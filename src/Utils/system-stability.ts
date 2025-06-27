import { EventEmitter } from "events"
import type { ILogger } from "./logger"

export interface SystemHealthMetrics {
  memoryUsage: NodeJS.MemoryUsage
  uptime: number
  connectionStability: number
  messageProcessingRate: number
  errorRate: number
  lastHealthCheck: Date
}

export interface StabilityConfig {
  healthCheckInterval: number
  memoryThreshold: number
  errorRateThreshold: number
  connectionTimeoutMs: number
  maxRetries: number
  backoffMultiplier: number
}

export class SystemStabilityManager extends EventEmitter {
  private healthMetrics: SystemHealthMetrics
  private errorCount = 0
  private messageCount = 0
  private connectionAttempts = 0
  private successfulConnections = 0
  private healthCheckInterval?: NodeJS.Timeout
  private startTime = Date.now()

  constructor(
    private logger: ILogger,
    private config: StabilityConfig = {
      healthCheckInterval: 30000, // 30 seconds
      memoryThreshold: 500 * 1024 * 1024, // 500MB
      errorRateThreshold: 0.05, // 5%
      connectionTimeoutMs: 30000,
      maxRetries: 5,
      backoffMultiplier: 1.5,
    },
  ) {
    super()
    this.healthMetrics = this.initializeHealthMetrics()
    this.startHealthMonitoring()
  }

  private initializeHealthMetrics(): SystemHealthMetrics {
    return {
      memoryUsage: process.memoryUsage(),
      uptime: 0,
      connectionStability: 1.0,
      messageProcessingRate: 0,
      errorRate: 0,
      lastHealthCheck: new Date(),
    }
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck()
    }, this.config.healthCheckInterval)

    // Monitor process events
    process.on("uncaughtException", (error) => {
      this.handleCriticalError("uncaughtException", error)
    })

    process.on("unhandledRejection", (reason, promise) => {
      this.handleCriticalError("unhandledRejection", new Error(String(reason)))
    })

    process.on("warning", (warning) => {
      this.logger.warn({ warning: warning.message }, "process warning detected")
    })
  }

  private performHealthCheck(): void {
    const now = Date.now()
    const timeSinceStart = now - this.startTime

    this.healthMetrics = {
      memoryUsage: process.memoryUsage(),
      uptime: timeSinceStart,
      connectionStability: this.calculateConnectionStability(),
      messageProcessingRate: this.calculateMessageProcessingRate(timeSinceStart),
      errorRate: this.calculateErrorRate(),
      lastHealthCheck: new Date(),
    }

    // Check for critical conditions
    this.checkMemoryUsage()
    this.checkErrorRate()
    this.checkConnectionStability()

    this.emit("health-check", this.healthMetrics)

    this.logger.debug(
      {
        memory: Math.round(this.healthMetrics.memoryUsage.heapUsed / 1024 / 1024),
        uptime: Math.round(this.healthMetrics.uptime / 1000),
        stability: this.healthMetrics.connectionStability,
        errorRate: this.healthMetrics.errorRate,
      },
      "system health check completed",
    )
  }

  private calculateConnectionStability(): number {
    if (this.connectionAttempts === 0) return 1.0
    return this.successfulConnections / this.connectionAttempts
  }

  private calculateMessageProcessingRate(timeSinceStart: number): number {
    if (timeSinceStart === 0) return 0
    return (this.messageCount / timeSinceStart) * 1000 // messages per second
  }

  private calculateErrorRate(): number {
    const totalOperations = this.messageCount + this.errorCount
    if (totalOperations === 0) return 0
    return this.errorCount / totalOperations
  }

  private checkMemoryUsage(): void {
    const heapUsed = this.healthMetrics.memoryUsage.heapUsed
    if (heapUsed > this.config.memoryThreshold) {
      this.logger.warn(
        {
          heapUsed: Math.round(heapUsed / 1024 / 1024),
          threshold: Math.round(this.config.memoryThreshold / 1024 / 1024),
        },
        "memory usage threshold exceeded",
      )

      this.emit("memory-warning", {
        current: heapUsed,
        threshold: this.config.memoryThreshold,
      })

      // Force garbage collection if available
      if (global.gc) {
        global.gc()
        this.logger.info("forced garbage collection")
      }
    }
  }

  private checkErrorRate(): void {
    if (this.healthMetrics.errorRate > this.config.errorRateThreshold) {
      this.logger.warn(
        {
          errorRate: this.healthMetrics.errorRate,
          threshold: this.config.errorRateThreshold,
        },
        "error rate threshold exceeded",
      )

      this.emit("high-error-rate", {
        current: this.healthMetrics.errorRate,
        threshold: this.config.errorRateThreshold,
      })
    }
  }

  private checkConnectionStability(): void {
    if (this.healthMetrics.connectionStability < 0.8) {
      this.logger.warn(
        {
          stability: this.healthMetrics.connectionStability,
        },
        "connection stability is low",
      )

      this.emit("connection-instability", {
        stability: this.healthMetrics.connectionStability,
      })
    }
  }

  private handleCriticalError(type: string, error: Error): void {
    this.logger.error(
      {
        type,
        error: error.message,
        stack: error.stack,
      },
      "critical system error detected",
    )

    this.emit("critical-error", { type, error })

    // Increment error count
    this.recordError()
  }

  // Public methods for tracking operations
  recordConnectionAttempt(): void {
    this.connectionAttempts++
  }

  recordSuccessfulConnection(): void {
    this.successfulConnections++
  }

  recordMessageProcessed(): void {
    this.messageCount++
  }

  recordError(): void {
    this.errorCount++
  }

  // Retry mechanism with exponential backoff
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries = this.config.maxRetries,
  ): Promise<T> {
    let lastError: Error
    let delay = 1000 // Start with 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation()
        if (attempt > 1) {
          this.logger.info(
            {
              operation: operationName,
              attempt,
              success: true,
            },
            "operation succeeded after retry",
          )
        }
        return result
      } catch (error) {
        lastError = error as Error
        this.recordError()

        this.logger.warn(
          {
            operation: operationName,
            attempt,
            maxRetries,
            error: lastError.message,
            nextRetryIn: delay,
          },
          "operation failed, will retry",
        )

        if (attempt < maxRetries) {
          await this.sleep(delay)
          delay *= this.config.backoffMultiplier
        }
      }
    }

    this.logger.error(
      {
        operation: operationName,
        maxRetries,
        finalError: lastError!.message,
      },
      "operation failed after all retries",
    )

    throw lastError!
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  getHealthMetrics(): SystemHealthMetrics {
    return { ...this.healthMetrics }
  }

  getSystemStats(): {
    totalMessages: number
    totalErrors: number
    totalConnectionAttempts: number
    successfulConnections: number
    uptime: number
  } {
    return {
      totalMessages: this.messageCount,
      totalErrors: this.errorCount,
      totalConnectionAttempts: this.connectionAttempts,
      successfulConnections: this.successfulConnections,
      uptime: Date.now() - this.startTime,
    }
  }

  shutdown(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }
    this.removeAllListeners()
    this.logger.info("system stability manager shutdown")
  }
}
