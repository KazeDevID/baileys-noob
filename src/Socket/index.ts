import { DEFAULT_CONNECTION_CONFIG } from "../Defaults"
import type { UserFacingSocketConfig } from "../Types"
import { makeNewsletterSocket } from "./newsletter"
import { makeInteractiveSocket } from "./interactive"
import { SystemStabilityManager } from "../Utils/system-stability"
import { EnhancedPairingManager } from "../Utils/enhanced-pairing"

// export the enhanced socket layer with all new features
const makeWASocket = (config: UserFacingSocketConfig) => {
  const enhancedConfig = {
    ...DEFAULT_CONNECTION_CONFIG,
    ...config,
  }

  // Initialize system stability manager
  const stabilityManager = new SystemStabilityManager(enhancedConfig.logger)

  // Initialize enhanced pairing manager
  const pairingManager = new EnhancedPairingManager(enhancedConfig.logger)

  // Create the enhanced socket with all features
  const interactiveSocket = makeInteractiveSocket(enhancedConfig)
  const newsletterSocket = makeNewsletterSocket(enhancedConfig)

  // Combine all socket functionality
  const enhancedSocket = {
    ...interactiveSocket,
    ...newsletterSocket,
    stabilityManager,
    pairingManager,

    // Enhanced pairing code generation
    requestEnhancedPairingCode: async (phoneNumber: string, options?: any) => {
      return pairingManager.generateEnhancedPairingCode(enhancedSocket.authState.creds, { phoneNumber, ...options })
    },
  }

  // Set up stability monitoring
  stabilityManager.on("critical-error", (data) => {
    enhancedSocket.logger.error(data, "critical system error - attempting recovery")
  })

  stabilityManager.on("memory-warning", (data) => {
    enhancedSocket.logger.warn(data, "high memory usage detected")
  })

  return enhancedSocket
}

export default makeWASocket
