import type { proto } from "../../WAProto"

export interface NewsletterMetadata {
  id: string
  name: string
  description?: string
  picture?: string
  preview?: string
  subscribers?: number
  verification?: "VERIFIED" | "UNVERIFIED"
  reaction_codes?: proto.Message.IReactionMessage[]
  creation_time?: number
  invite?: string
  handle?: string
  settings?: {
    reaction_codes?: {
      enabled: boolean
      value: proto.Message.IReactionMessage[]
    }
    updates?: {
      enabled: boolean
    }
  }
}

export interface NewsletterCreateOptions {
  name: string
  description?: string
  picture?: Buffer
}

export interface NewsletterUpdateOptions {
  name?: string
  description?: string
  picture?: Buffer
}

export interface NewsletterSubscription {
  id: string
  state: "SUBSCRIBED" | "UNSUBSCRIBED" | "PENDING"
  mute?: "NOT_MUTED" | "MUTED"
  role?: "GUEST" | "SUBSCRIBER" | "ADMIN" | "OWNER"
}

export interface NewsletterMessage {
  id: string
  newsletterId: string
  message: proto.IMessage
  timestamp: number
  views?: number
  serverTimestamp?: number
}

export type NewsletterAction =
  | "create"
  | "update"
  | "delete"
  | "subscribe"
  | "unsubscribe"
  | "mute"
  | "unmute"
  | "admin_promote"
  | "admin_demote"
