import { makeWASocket } from "./index"
import type { UserFacingSocketConfig } from "../Types"

export interface EnhancedSocketConfig extends UserFacingSocketConfig {
  // Enhanced stability options
  enableSystemMonitoring?: boolean
  healthCheckInterval?: number
  memoryThreshold?: number

  // Enhanced pairing options
  enableEnhancedPairing?: boolean
  defaultPairingCodeLength?: 6 | 8 | 10
  pairingCodeExpiration?: number

  // Newsletter options
  enableNewsletterFeatures?: boolean
  maxNewsletterSubscriptions?: number

  // Interactive message options
  enableInteractiveMessages?: boolean
  maxButtonsPerMessage?: number
  maxListSections?: number
}

export const createEnhancedWASocket = (config: EnhancedSocketConfig) => {
  const {
    enableSystemMonitoring = true,
    enableEnhancedPairing = true,
    enableNewsletterFeatures = true,
    enableInteractiveMessages = true,
    ...socketConfig
  } = config

  // Create the base socket
  const socket = makeWASocket(socketConfig)

  // Add enhanced error handling
  const originalOnUnexpectedError = socket.onUnexpectedError
  socket.onUnexpectedError = (error, context) => {
    socket.stabilityManager?.recordError()

    // Enhanced error logging with context
    socket.logger.error(
      {
        error: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        memoryUsage: process.memoryUsage(),
      },
      "enhanced error handler triggered",
    )

    // Call original handler
    originalOnUnexpectedError(error, context)
  }

  // Enhanced connection monitoring
  if (enableSystemMonitoring) {
    socket.ev.on("connection.update", (update) => {
      if (update.connection === "connecting") {
        socket.stabilityManager?.recordConnectionAttempt()
      } else if (update.connection === "open") {
        socket.stabilityManager?.recordSuccessfulConnection()
      }
    })

    socket.ev.on("messages.upsert", () => {
      socket.stabilityManager?.recordMessageProcessed()
    })
  }

  // Enhanced message sending with retry logic
  const originalSendMessage = socket.sendMessage
  socket.sendMessage = async (jid, content, options) => {
    if (enableSystemMonitoring) {
      return socket.stabilityManager!.executeWithRetry(
        () => originalSendMessage(jid, content, options),
        `sendMessage-${jid}`,
      )
    }
    return originalSendMessage(jid, content, options)
  }

  // Add feature availability checks
  socket.getAvailableFeatures = () => ({
    newsletters: enableNewsletterFeatures,
    interactiveMessages: enableInteractiveMessages,
    enhancedPairing: enableEnhancedPairing,
    systemMonitoring: enableSystemMonitoring,
  })

  // Add system health endpoint
  socket.getSystemHealth = () => {
    if (!enableSystemMonitoring) {
      throw new Error("System monitoring is disabled")
    }
    return socket.stabilityManager!.getHealthMetrics()
  }

  return socket
}
