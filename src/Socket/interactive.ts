import { proto } from "../../WAProto"
import type { SocketConfig } from "../Types"
import type {
  InteractiveListOptions,
  InteractiveTemplateOptions,
  InteractiveCarouselOptions,
  InteractiveFlowOptions,
  AIMessageIconOptions,
} from "../Types/Interactive"
import { generateMessageIDV2 } from "../Utils"
import { makeMessagesSocket } from "./messages-send"

export const makeInteractiveSocket = (config: SocketConfig) => {
  const sock = makeMessagesSocket(config)
  const { logger } = sock

  const createButtonMessage = async (jid: string, options: InteractiveTemplateOptions) => {
    const { header, body, footer, buttons } = options

    const buttonMessage: proto.Message.IButtonsMessage = {
      contentText: body.text,
      footerText: footer?.text,
      buttons: buttons.map((btn, index) => ({
        buttonId: btn.id,
        buttonText: {
          displayText: btn.displayText,
        },
        type: proto.Message.ButtonsMessage.Button.Type.RESPONSE,
      })),
      headerType: header ? proto.Message.ButtonsMessage.HeaderType.TEXT : undefined,
    }

    if (header) {
      buttonMessage.text = header.title
    }

    const message = proto.Message.fromObject({
      buttonsMessage: buttonMessage,
    })

    const result = await sock.sendMessage(
      jid,
      { message },
      {
        messageId: generateMessageIDV2(),
      },
    )

    logger.info({ jid, buttons: buttons.length }, "interactive button message sent")
    return result
  }

  const createListMessage = async (jid: string, options: InteractiveListOptions) => {
    const { title, description, buttonText, sections } = options

    const listMessage: proto.Message.IListMessage = {
      title,
      description,
      buttonText,
      listType: proto.Message.ListMessage.ListType.SINGLE_SELECT,
      sections: sections.map((section) => ({
        title: section.title,
        rows: section.rows.map((row) => ({
          title: row.title,
          description: row.description,
          rowId: row.rowId,
        })),
      })),
    }

    const message = proto.Message.fromObject({
      listMessage: listMessage,
    })

    const result = await sock.sendMessage(
      jid,
      { message },
      {
        messageId: generateMessageIDV2(),
      },
    )

    logger.info({ jid, sections: sections.length }, "interactive list message sent")
    return result
  }

  const createTemplateMessage = async (jid: string, options: InteractiveTemplateOptions) => {
    const { header, body, footer, buttons } = options

    const templateMessage: proto.Message.ITemplateMessage = {
      hydratedTemplate: {
        hydratedContentText: body.text,
        hydratedFooterText: footer?.text,
        hydratedButtons: buttons.map((btn) => ({
          index: buttons.indexOf(btn),
          quickReplyButton: {
            displayText: btn.displayText,
            id: btn.id,
          },
        })),
      },
    }

    if (header) {
      templateMessage.hydratedTemplate!.hydratedTitleText = header.title
    }

    const message = proto.Message.fromObject({
      templateMessage: templateMessage,
    })

    const result = await sock.sendMessage(
      jid,
      { message },
      {
        messageId: generateMessageIDV2(),
      },
    )

    logger.info({ jid, template: true }, "interactive template message sent")
    return result
  }

  const createCarouselMessage = async (jid: string, options: InteractiveCarouselOptions) => {
    const { cards } = options

    // Create multiple template messages for carousel effect
    const results = []
    for (const card of cards) {
      const templateOptions: InteractiveTemplateOptions = {
        header: card.header,
        body: card.body,
        footer: card.footer,
        buttons: card.buttons,
      }

      const result = await createTemplateMessage(jid, templateOptions)
      results.push(result)
    }

    logger.info({ jid, cards: cards.length }, "interactive carousel messages sent")
    return results
  }

  const createFlowMessage = async (jid: string, options: InteractiveFlowOptions) => {
    const { header, body, footer, action } = options

    const interactiveMessage: proto.Message.IInteractiveMessage = {
      header: {
        title: header,
        hasMediaAttachment: false,
      },
      body: {
        text: body,
      },
      footer: {
        text: footer,
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: action.button,
              sections: action.sections,
            }),
          },
        ],
      },
    }

    const message = proto.Message.fromObject({
      interactiveMessage: interactiveMessage,
    })

    const result = await sock.sendMessage(
      jid,
      { message },
      {
        messageId: generateMessageIDV2(),
      },
    )

    logger.info({ jid, flow: true }, "interactive flow message sent")
    return result
  }

  const createNativeFlowMessage = async (jid: string, flowData: any) => {
    const interactiveMessage: proto.Message.IInteractiveMessage = {
      nativeFlowMessage: {
        buttons: [
          {
            name: "flow",
            buttonParamsJson: JSON.stringify(flowData),
          },
        ],
      },
    }

    const message = proto.Message.fromObject({
      interactiveMessage: interactiveMessage,
    })

    const result = await sock.sendMessage(
      jid,
      { message },
      {
        messageId: generateMessageIDV2(),
      },
    )

    logger.info({ jid, nativeFlow: true }, "native flow message sent")
    return result
  }

  const addAIMessageIcon = async (message: proto.IMessage, options: AIMessageIconOptions): Promise<proto.IMessage> => {
    if (!options.enabled) {
      return message
    }

    // Add AI context info to the message
    const messageType = Object.keys(message)[0] as keyof proto.IMessage
    const messageContent = message[messageType] as any

    if (messageContent && typeof messageContent === "object") {
      messageContent.contextInfo = messageContent.contextInfo || {}
      messageContent.contextInfo.isAiGenerated = true
      messageContent.contextInfo.aiIconType = options.iconType || "SPARKLE"
      messageContent.contextInfo.aiIconPosition = options.position || "TOP_RIGHT"
      messageContent.contextInfo.aiIconSize = options.size || "MEDIUM"

      if (options.customIcon) {
        // Upload custom icon and add reference
        const iconResult = await sock.waUploadToServer(options.customIcon, { fileEncSha256B64: "", mediaType: "image" })
        messageContent.contextInfo.aiCustomIconUrl = iconResult.mediaUrl
      }
    }

    logger.debug({ iconType: options.iconType }, "AI message icon added")
    return message
  }

  return {
    ...sock,
    createButtonMessage,
    createListMessage,
    createTemplateMessage,
    createCarouselMessage,
    createFlowMessage,
    createNativeFlowMessage,
    addAIMessageIcon,
  }
}
