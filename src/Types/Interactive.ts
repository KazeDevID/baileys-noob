import type { proto } from "../../WAProto"

export interface InteractiveButtonOptions {
  displayText: string
  id: string
  type?: "RESPONSE" | "URL_BUTTON"
  url?: string
}

export interface InteractiveListOptions {
  title: string
  description?: string
  buttonText: string
  sections: Array<{
    title: string
    rows: Array<{
      title: string
      description?: string
      rowId: string
    }>
  }>
}

export interface InteractiveTemplateOptions {
  header?: {
    title: string
    subtitle?: string
    hasMediaAttachment?: boolean
  }
  body: {
    text: string
  }
  footer?: {
    text: string
  }
  buttons: InteractiveButtonOptions[]
}

export interface InteractiveCarouselOptions {
  cards: Array<{
    header?: {
      title: string
      subtitle?: string
      imageMessage?: proto.Message.IImageMessage
    }
    body: {
      text: string
    }
    footer?: {
      text: string
    }
    buttons: InteractiveButtonOptions[]
  }>
}

export interface InteractiveFlowOptions {
  header: string
  body: string
  footer: string
  action: {
    button: string
    sections: Array<{
      title: string
      rows: Array<{
        header: string
        title: string
        description: string
        id: string
      }>
    }>
  }
}

export interface AIMessageIconOptions {
  enabled: boolean
  iconType?: "SPARKLE" | "ROBOT" | "BRAIN" | "CUSTOM"
  customIcon?: Buffer
  position?: "TOP_LEFT" | "TOP_RIGHT" | "BOTTOM_LEFT" | "BOTTOM_RIGHT"
  size?: "SMALL" | "MEDIUM" | "LARGE"
}

export type InteractiveMessageType = "button" | "list" | "template" | "carousel" | "flow" | "native_flow"
