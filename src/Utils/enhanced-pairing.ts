import { randomBytes, createHash } from "crypto"
import { Boom } from "@hapi/boom"
import type { AuthenticationCreds } from "../Types"
import { bytesToCrockford, derivePairingCodeKey, aesEncryptCTR } from "./crypto"
import type { ILogger } from "./logger"

export interface EnhancedPairingOptions {
  phoneNumber: string
  customCode?: string
  codeLength?: 6 | 8 | 10
  includeChecksum?: boolean
  expirationMinutes?: number
  allowedAttempts?: number
  rateLimitMs?: number
}

export interface PairingCodeResult {
  code: string
  expiresAt: Date
  attemptsRemaining: number
  qrFallback?: string
}

export class EnhancedPairingManager {
  private activeCodes = new Map<
    string,
    {
      phoneNumber: string
      code: string
      expiresAt: Date
      attempts: number
      maxAttempts: number
      createdAt: Date
    }
  >()

  private rateLimits = new Map<
    string,
    {
      lastAttempt: Date
      attempts: number
    }
  >()

  constructor(
    private logger: ILogger,
    private defaultOptions: Partial<EnhancedPairingOptions> = {},
  ) {}

  async generateEnhancedPairingCode(
    creds: AuthenticationCreds,
    options: EnhancedPairingOptions,
  ): Promise<PairingCodeResult> {
    const {
      phoneNumber,
      customCode,
      codeLength = 8,
      includeChecksum = true,
      expirationMinutes = 5,
      allowedAttempts = 3,
      rateLimitMs = 60000,
    } = { ...this.defaultOptions, ...options }

    // Rate limiting check
    await this.checkRateLimit(phoneNumber, rateLimitMs)

    // Generate or validate custom code
    let pairingCode: string
    if (customCode) {
      this.validateCustomCode(customCode, codeLength)
      pairingCode = customCode.toUpperCase()
    } else {
      pairingCode = this.generateSecurePairingCode(codeLength, includeChecksum)
    }

    // Create expiration date
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000)

    // Store pairing session
    const sessionId = this.generateSessionId(phoneNumber, pairingCode)
    this.activeCodes.set(sessionId, {
      phoneNumber,
      code: pairingCode,
      expiresAt,
      attempts: 0,
      maxAttempts: allowedAttempts,
      createdAt: new Date(),
    })

    // Update credentials
    creds.pairingCode = pairingCode
    creds.pairingEphemeralKeyPair = creds.pairingEphemeralKeyPair || this.generateEphemeralKeyPair()

    // Generate QR fallback
    const qrFallback = await this.generateQRFallback(pairingCode, creds)

    this.logger.info(
      {
        phoneNumber,
        codeLength: pairingCode.length,
        expiresAt,
        hasCustomCode: !!customCode,
      },
      "enhanced pairing code generated",
    )

    // Cleanup expired codes
    this.cleanupExpiredCodes()

    return {
      code: pairingCode,
      expiresAt,
      attemptsRemaining: allowedAttempts,
      qrFallback,
    }
  }

  private generateSecurePairingCode(length: number, includeChecksum: boolean): string {
    const baseLength = includeChecksum ? length - 1 : length
    const randomCode = bytesToCrockford(randomBytes(Math.ceil(baseLength / 2))).substring(0, baseLength)

    if (includeChecksum) {
      const checksum = this.calculateChecksum(randomCode)
      return randomCode + checksum
    }

    return randomCode
  }

  private calculateChecksum(code: string): string {
    const hash = createHash("sha256").update(code).digest()
    return bytesToCrockford(hash.slice(0, 1)).substring(0, 1)
  }

  private validateCustomCode(code: string, expectedLength: number): void {
    if (!code || code.length !== expectedLength) {
      throw new Boom(`Custom pairing code must be exactly ${expectedLength} characters`, {
        statusCode: 400,
      })
    }

    // Check for valid Crockford Base32 characters
    const validChars = /^[0-9A-HJKMNP-TV-Z]+$/i
    if (!validChars.test(code)) {
      throw new Boom("Custom pairing code contains invalid characters", {
        statusCode: 400,
      })
    }
  }

  private async checkRateLimit(phoneNumber: string, rateLimitMs: number): Promise<void> {
    const now = new Date()
    const rateLimit = this.rateLimits.get(phoneNumber)

    if (rateLimit) {
      const timeSinceLastAttempt = now.getTime() - rateLimit.lastAttempt.getTime()
      if (timeSinceLastAttempt < rateLimitMs) {
        throw new Boom("Rate limit exceeded. Please wait before requesting another code", {
          statusCode: 429,
          data: {
            retryAfter: Math.ceil((rateLimitMs - timeSinceLastAttempt) / 1000),
          },
        })
      }
    }

    this.rateLimits.set(phoneNumber, {
      lastAttempt: now,
      attempts: (rateLimit?.attempts || 0) + 1,
    })
  }

  private generateSessionId(phoneNumber: string, code: string): string {
    return createHash("sha256").update(`${phoneNumber}:${code}:${Date.now()}`).digest("hex").substring(0, 16)
  }

  private generateEphemeralKeyPair() {
    // This would use the existing Curve.generateKeyPair() from crypto utils
    const { Curve } = require("./crypto")
    return Curve.generateKeyPair()
  }

  private async generateQRFallback(pairingCode: string, creds: AuthenticationCreds): Promise<string> {
    try {
      const salt = randomBytes(32)
      const key = await derivePairingCodeKey(pairingCode, salt)
      const iv = randomBytes(16)
      const payload = Buffer.from(
        JSON.stringify({
          publicKey: Buffer.from(creds.noiseKey.public).toString("base64"),
          timestamp: Date.now(),
        }),
      )

      const encrypted = aesEncryptCTR(payload, key, iv)
      const qrData = Buffer.concat([salt, iv, encrypted]).toString("base64")

      return `whatsapp://pair?code=${qrData}`
    } catch (error) {
      this.logger.warn({ error }, "failed to generate QR fallback")
      return ""
    }
  }

  validatePairingAttempt(phoneNumber: string, attemptedCode: string): boolean {
    const session = Array.from(this.activeCodes.values()).find(
      (s) => s.phoneNumber === phoneNumber && s.code === attemptedCode,
    )

    if (!session) {
      return false
    }

    // Check expiration
    if (new Date() > session.expiresAt) {
      this.logger.warn({ phoneNumber }, "pairing code expired")
      return false
    }

    // Check attempts
    if (session.attempts >= session.maxAttempts) {
      this.logger.warn({ phoneNumber }, "pairing code max attempts exceeded")
      return false
    }

    session.attempts++
    return true
  }

  private cleanupExpiredCodes(): void {
    const now = new Date()
    for (const [sessionId, session] of this.activeCodes.entries()) {
      if (now > session.expiresAt) {
        this.activeCodes.delete(sessionId)
      }
    }

    // Cleanup old rate limits (older than 1 hour)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    for (const [phoneNumber, rateLimit] of this.rateLimits.entries()) {
      if (rateLimit.lastAttempt < oneHourAgo) {
        this.rateLimits.delete(phoneNumber)
      }
    }
  }

  getActivePairingSessions(): Array<{
    phoneNumber: string
    expiresAt: Date
    attemptsRemaining: number
    createdAt: Date
  }> {
    return Array.from(this.activeCodes.values()).map((session) => ({
      phoneNumber: session.phoneNumber,
      expiresAt: session.expiresAt,
      attemptsRemaining: session.maxAttempts - session.attempts,
      createdAt: session.createdAt,
    }))
  }

  revokePairingCode(phoneNumber: string): boolean {
    const sessionToRevoke = Array.from(this.activeCodes.entries()).find(
      ([_, session]) => session.phoneNumber === phoneNumber,
    )

    if (sessionToRevoke) {
      this.activeCodes.delete(sessionToRevoke[0])
      this.logger.info({ phoneNumber }, "pairing code revoked")
      return true
    }

    return false
  }
}
