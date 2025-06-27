import { Boom } from "@hapi/boom"
import { proto } from "../../WAProto"
import type {
  NewsletterMetadata,
  NewsletterCreateOptions,
  NewsletterUpdateOptions,
  NewsletterSubscription,
} from "../Types/Newsletter"
import type { SocketConfig } from "../Types"
import { type BinaryNode, getBinaryNodeChild, getBinaryNodeChildren, S_WHATSAPP_NET } from "../WABinary"
import { generateMessageIDV2, unixTimestampSeconds } from "../Utils"
import { makeChatsSocket } from "./chats"

export const makeNewsletterSocket = (config: SocketConfig) => {
  const sock = makeChatsSocket(config)
  const { ev, authState, query, sendNode, generateMessageTag, logger } = sock

  const newsletterQuery = async (jid: string, type: "get" | "set", content?: BinaryNode[]) => {
    const result = await query({
      tag: "iq",
      attrs: {
        id: generateMessageTag(),
        type,
        xmlns: "newsletter",
        to: jid,
      },
      content: content || [],
    })
    return result
  }

  const createNewsletter = async (options: NewsletterCreateOptions): Promise<NewsletterMetadata> => {
    const { name, description, picture } = options

    const content: BinaryNode[] = [
      {
        tag: "create",
        attrs: {},
        content: [
          {
            tag: "name",
            attrs: {},
            content: name,
          },
        ],
      },
    ]

    if (description) {
      content[0].content!.push({
        tag: "description",
        attrs: {},
        content: description,
      })
    }

    if (picture) {
      // Upload picture first
      const mediaResult = await sock.waUploadToServer(picture, { fileEncSha256B64: "", mediaType: "image" })

      content[0].content!.push({
        tag: "picture",
        attrs: {
          url: mediaResult.mediaUrl,
          directPath: mediaResult.directPath,
        },
      })
    }

    const result = await newsletterQuery(S_WHATSAPP_NET, "set", content)
    const createNode = getBinaryNodeChild(result, "create")

    if (!createNode) {
      throw new Boom("Failed to create newsletter", { statusCode: 400 })
    }

    const newsletterData: NewsletterMetadata = {
      id: createNode.attrs.id,
      name,
      description,
      creation_time: unixTimestampSeconds(),
      subscribers: 0,
      verification: "UNVERIFIED",
    }

    logger.info({ newsletterId: newsletterData.id }, "newsletter created successfully")

    return newsletterData
  }

  const getNewsletterInfo = async (newsletterId: string): Promise<NewsletterMetadata> => {
    const result = await newsletterQuery(newsletterId, "get", [
      {
        tag: "info",
        attrs: {},
      },
    ])

    const infoNode = getBinaryNodeChild(result, "info")
    if (!infoNode) {
      throw new Boom("Newsletter not found", { statusCode: 404 })
    }

    const nameNode = getBinaryNodeChild(infoNode, "name")
    const descNode = getBinaryNodeChild(infoNode, "description")
    const pictureNode = getBinaryNodeChild(infoNode, "picture")
    const subscribersNode = getBinaryNodeChild(infoNode, "subscribers")
    const verificationNode = getBinaryNodeChild(infoNode, "verification")

    return {
      id: newsletterId,
      name: nameNode?.content?.toString() || "",
      description: descNode?.content?.toString(),
      picture: pictureNode?.attrs?.url,
      subscribers: subscribersNode ? Number.parseInt(subscribersNode.content?.toString() || "0") : 0,
      verification: (verificationNode?.attrs?.status as "VERIFIED" | "UNVERIFIED") || "UNVERIFIED",
    }
  }

  const updateNewsletterInfo = async (newsletterId: string, options: NewsletterUpdateOptions): Promise<void> => {
    const { name, description, picture } = options
    const content: BinaryNode[] = []

    if (name) {
      content.push({
        tag: "name",
        attrs: {},
        content: name,
      })
    }

    if (description) {
      content.push({
        tag: "description",
        attrs: {},
        content: description,
      })
    }

    if (picture) {
      const mediaResult = await sock.waUploadToServer(picture, { fileEncSha256B64: "", mediaType: "image" })

      content.push({
        tag: "picture",
        attrs: {
          url: mediaResult.mediaUrl,
          directPath: mediaResult.directPath,
        },
      })
    }

    await newsletterQuery(newsletterId, "set", [
      {
        tag: "update",
        attrs: {},
        content,
      },
    ])

    logger.info({ newsletterId }, "newsletter updated successfully")
  }

  const subscribeToNewsletter = async (newsletterId: string): Promise<void> => {
    await newsletterQuery(newsletterId, "set", [
      {
        tag: "subscribe",
        attrs: {},
      },
    ])

    logger.info({ newsletterId }, "subscribed to newsletter")
  }

  const unsubscribeFromNewsletter = async (newsletterId: string): Promise<void> => {
    await newsletterQuery(newsletterId, "set", [
      {
        tag: "unsubscribe",
        attrs: {},
      },
    ])

    logger.info({ newsletterId }, "unsubscribed from newsletter")
  }

  const getNewsletterSubscriptions = async (): Promise<NewsletterSubscription[]> => {
    const result = await query({
      tag: "iq",
      attrs: {
        id: generateMessageTag(),
        type: "get",
        xmlns: "newsletter",
        to: S_WHATSAPP_NET,
      },
      content: [
        {
          tag: "subscriptions",
          attrs: {},
        },
      ],
    })

    const subscriptionsNode = getBinaryNodeChild(result, "subscriptions")
    if (!subscriptionsNode) {
      return []
    }

    const subscriptionNodes = getBinaryNodeChildren(subscriptionsNode, "subscription")
    return subscriptionNodes.map((node) => ({
      id: node.attrs.id,
      state: node.attrs.state as "SUBSCRIBED" | "UNSUBSCRIBED" | "PENDING",
      mute: node.attrs.mute as "NOT_MUTED" | "MUTED",
      role: node.attrs.role as "GUEST" | "SUBSCRIBER" | "ADMIN" | "OWNER",
    }))
  }

  const sendNewsletterMessage = async (newsletterId: string, message: proto.IMessage): Promise<string> => {
    const messageId = generateMessageIDV2()

    await sendNode({
      tag: "message",
      attrs: {
        id: messageId,
        type: "newsletter",
        to: newsletterId,
      },
      content: [
        {
          tag: "newsletter",
          attrs: {},
          content: [
            {
              tag: "message",
              attrs: {},
              content: proto.Message.encode(message).finish(),
            },
          ],
        },
      ],
    })

    logger.info({ newsletterId, messageId }, "newsletter message sent")
    return messageId
  }

  const muteNewsletter = async (newsletterId: string, duration?: number): Promise<void> => {
    const muteUntil = duration ? unixTimestampSeconds() + duration : -1

    await newsletterQuery(newsletterId, "set", [
      {
        tag: "mute",
        attrs: {
          until: muteUntil.toString(),
        },
      },
    ])

    logger.info({ newsletterId, duration }, "newsletter muted")
  }

  const unmuteNewsletter = async (newsletterId: string): Promise<void> => {
    await newsletterQuery(newsletterId, "set", [
      {
        tag: "unmute",
        attrs: {},
      },
    ])

    logger.info({ newsletterId }, "newsletter unmuted")
  }

  return {
    ...sock,
    createNewsletter,
    getNewsletterInfo,
    updateNewsletterInfo,
    subscribeToNewsletter,
    unsubscribeFromNewsletter,
    getNewsletterSubscriptions,
    sendNewsletterMessage,
    muteNewsletter,
    unmuteNewsletter,
  }
}
