# 🚀 Baileys-Noob

A comprehensive, enhanced WhatsApp Web API library built on top of the original Baileys package

[![npm version](https://badge.fury.io/js/baileys-noob.svg)](https://badge.fury.io/js/baileys-noob)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/baileys-noob.svg)](https://nodejs.org/)

## 📋 Table of Contents

- [Installation](#-installation)
- [Basic Messaging](#-basic-messaging)
- [Newsletter Management](#-newsletter-management)
- [Interactive Messages](#-interactive-messages)
- [AI Message Integration](#-ai-message-integration)
- [Enhanced Pairing](#-enhanced-pairing)
- [System Stability](#-system-stability)
- [Event Handling](#-event-handling)
- [Media Handling](#-media-handling)
- [Error Handling](#-error-handling)
- [Advanced Usage](#-advanced-usage)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)


## 📦 Installation

\`\`\`
npm install baileys-noob
\`\`\`


## 💬 Basic Messaging

### Send Text Messages

\`\`\`
sock.sendMessage(jid, { text: text })

\`\`\`

### Send Media Messages

\`\`\`javascript
// send image
sock.sendMessage(jid, { image: fs.readFileSync(imagePath), caption: caption, jpegThumbnail: null })

// send video
sock.sendMessage(jid, { video: fs.readFileSync(videoPath), caption: caption, gifPlayback: false, ptv: false })

// send audio
sock.sendMessage(jid, { audio: fs.readFileSync(audioPath), mimetype: 'audio/mp4' })

// send doc
sock.sendMessage(jid, { document: fs.readFileSync(documentPath), fileName: fileName, mimetype: mimetype, caption: 'Document sent via Baileys-Noob' })

\`\`\`

### Message with Mentions

\`\`\`javascript
sock.sendMessage(jid, { text: text, mentions: mentionedJids })

\`\`\`

## 📰 Newsletter Management

### Create channel

\`\`\`javascript
sock.createNewsletter({
    name: name,
    description: description,
    picture: picture ? fs.readFileSync(picture) : undefined
})
        
\`\`\`

### Newsletter Operations

\`\`\`javascript
// Get newsletter information
sock.getNewsletterInfo(newsletterId)

// Update newsletter
sock.updateNewsletterInfo(newsletterId, updates)

// Subscribe to newsletter
sock.subscribeToNewsletter(newsletterId)

// Send newsletter message
sock.sendNewsletterMessage(newsletterId, {
    text: message
})

// Get subscriptions
sock.getNewsletterSubscriptions()

\`\`\`

## 🎛️ Interactive Messages

### Button Messages

\`\`\`javascript
sock.createButtonMessage(jid, {
    body: { text: text },
    footer: { text: 'Powered by Baileys-Noob' },
    buttons: [
        { id: 'btn_0', displayText: 'Opsi 1', type: 'RESPONSE' },
        { id: 'btn_1', displayText: 'Opsi 2', type: 'RESPONSE' },
        { id: 'btn_2', displayText: 'Opsi 3', type: 'RESPONSE' }
    ]
})
\`\`\`

### List Messages

\`\`\`javascript
async function sendListMessage(jid, title, description, sections) {
    try {
        const message = await sock.createListMessage(jid, {
            title: title,
            description: description,
            buttonText: 'Select Option',
            sections: sections
        })
        
        console.log('📋 List message sent:', message.key.id)
        return message
    } catch (error) {
        console.error('❌ Failed to send list message:', error)
        throw error
    }
}

// Usage
await sendListMessage(
    '1234567890@s.whatsapp.net',
    'Menu Options',
    'Please select from the following options:',
    [
        {
            title: 'Main Menu',
            rows: [
                { title: 'Home', description: 'Go to home page', rowId: 'home' },
                { title: 'About', description: 'Learn more about us', rowId: 'about' },
                { title: 'Contact', description: 'Get in touch', rowId: 'contact' }
            ]
        }
    ]
)
\`\`\`

### Template Messages

\`\`\`javascript
async function sendTemplateMessage(jid, header, body, footer, buttons) {
    try {
        const message = await sock.createTemplateMessage(jid, {
            header: { title: header },
            body: { text: body },
            footer: { text: footer },
            buttons: buttons.map((btn, index) => ({
                id: \`template_btn_\${index}\`,
                displayText: btn,
                type: 'RESPONSE'
            }))
        })
        
        console.log('📄 Template message sent:', message.key.id)
        return message
    } catch (error) {
        console.error('❌ Failed to send template message:', error)
        throw error
    }
}

// Usage
await sendTemplateMessage(
    '1234567890@s.whatsapp.net',
    'Welcome!',
    'Thank you for using our service. How can we help you today?',
    'Baileys-Noob Bot',
    ['Get Help', 'View Services', 'Contact Support']
)
\`\`\`

### Flow Messages

\`\`\`javascript
async function sendFlowMessage(jid, flowData) {
    try {
        const message = await sock.createFlowMessage(jid, {
            header: flowData.header,
            body: flowData.body,
            footer: flowData.footer,
            action: {
                button: flowData.buttonText,
                sections: flowData.sections
            }
        })
        
        console.log('🌊 Flow message sent:', message.key.id)
        return message
    } catch (error) {
        console.error('❌ Failed to send flow message:', error)
        throw error
    }
}

// Usage
await sendFlowMessage('1234567890@s.whatsapp.net', {
    header: 'Service Selection',
    body: 'Please choose the service you need:',
    footer: 'We\'re here to help!',
    buttonText: 'Choose Service',
    sections: [
        {
            title: 'Technical Support',
            rows: [
                { header: 'Bug Report', title: 'Report a Bug', description: 'Report technical issues', id: 'bug_report' },
                { header: 'Feature Request', title: 'Request Feature', description: 'Suggest new features', id: 'feature_request' }
            ]
        },
        {
            title: 'General Support',
            rows: [
                { header: 'FAQ', title: 'Frequently Asked Questions', description: 'Common questions and answers', id: 'faq' },
                { header: 'Contact', title: 'Contact Us', description: 'Get in touch with our team', id: 'contact' }
            ]
        }
    ]
})
\`\`\`

## 🤖 AI Message Integration

### Add AI Icons to Messages

\`\`\`javascript
async function sendAIMessage(jid, text, aiOptions) {
    try {
        // Create the base message
        let message = {
            text: text
        }
        
        // Add AI icon customization
        message = await sock.addAIMessageIcon(message, {
            enabled: true,
            iconType: aiOptions.iconType || 'SPARKLE',
            position: aiOptions.position || 'TOP_RIGHT',
            size: aiOptions.size || 'MEDIUM',
            customIcon: aiOptions.customIcon
        })
        
        const sentMessage = await sock.sendMessage(jid, message)
        console.log('🤖 AI message sent:', sentMessage.key.id)
        return sentMessage
    } catch (error) {
        console.error('❌ Failed to send AI message:', error)
        throw error
    }
}

// Usage examples
await sendAIMessage('1234567890@s.whatsapp.net', 'This is an AI-generated response!', {
    iconType: 'ROBOT',
    position: 'TOP_LEFT',
    size: 'LARGE'
})

// With custom icon
await sendAIMessage('1234567890@s.whatsapp.net', 'Custom AI response!', {
    iconType: 'CUSTOM',
    customIcon: fs.readFileSync('./custom-ai-icon.png'),
    position: 'BOTTOM_RIGHT',
    size: 'SMALL'
})
\`\`\`

### AI Message Types

\`\`\`javascript
// Different AI icon types
const AI_ICON_TYPES = {
    SPARKLE: 'sparkle',    // ✨ Default sparkle icon
    ROBOT: 'robot',        // 🤖 Robot icon
    BRAIN: 'brain',        // 🧠 Brain icon
    CUSTOM: 'custom'       // Custom uploaded icon
}

// Position options
const AI_POSITIONS = {
    TOP_LEFT: 'top_left',
    TOP_RIGHT: 'top_right',
    BOTTOM_LEFT: 'bottom_left',
    BOTTOM_RIGHT: 'bottom_right'
}

// Size options
const AI_SIZES = {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large'
}
\`\`\`

## 📡 Event Handling

### Message Events

\`\`\`javascript
// Handle incoming messages
sock.ev.on('messages.upsert', async (m) => {
    const message = m.messages[0]
    
    if (!message.key.fromMe && m.type === 'notify') {
        console.log('📨 New message received:', message)
        
        const messageText = message.message?.conversation || 
                           message.message?.extendedTextMessage?.text || ''
        
        const senderJid = message.key.remoteJid
        const senderName = message.pushName || 'Unknown'
        
        console.log(\`👤 From: \${senderName} (\${senderJid})\`)
        console.log(\`💬 Message: \${messageText}\`)
        
        // Handle different message types
        if (message.message?.imageMessage) {
            console.log('🖼️ Image message received')
            await handleImageMessage(message)
        } else if (message.message?.videoMessage) {
            console.log('🎥 Video message received')
            await handleVideoMessage(message)
        } else if (message.message?.audioMessage) {
            console.log('🎵 Audio message received')
            await handleAudioMessage(message)
        } else if (message.message?.documentMessage) {
            console.log('📄 Document message received')
            await handleDocumentMessage(message)
        }
        
        // Auto-reply example
        if (messageText.toLowerCase().includes('hello')) {
            await sock.sendMessage(senderJid, {
                text: \`Hello \${senderName}! How can I help you today?\`
            })
        }
    }
})

// Handle message updates (read receipts, delivery status, etc.)
sock.ev.on('messages.update', (messageUpdate) => {
    for (const update of messageUpdate) {
        console.log('📝 Message update:', update)
        
        if (update.update.status) {
            console.log(\`📊 Status: \${update.update.status}\`)
        }
    }
})

// Handle message reactions
sock.ev.on('messages.reaction', (reactions) => {
    for (const reaction of reactions) {
        console.log('😊 Reaction received:', reaction)
    }
})
\`\`\`

### Connection Events

\`\`\`javascript
// Connection state changes
sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr, receivedPendingNotifications } = update
    
    if (qr) {
        console.log('📱 QR Code received, scan with WhatsApp')
        // You can display the QR code here
    }
    
    if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
        console.log('🔌 Connection closed:', lastDisconnect?.error)
        
        if (shouldReconnect) {
            console.log('🔄 Reconnecting...')
            connectToWhatsApp()
        } else {
            console.log('❌ Logged out, please scan QR code again')
        }
    } else if (connection === 'open') {
        console.log('✅ Connected successfully!')
        
        if (receivedPendingNotifications) {
            console.log('📬 Received pending notifications')
        }
    } else if (connection === 'connecting') {
        console.log('🔄 Connecting to WhatsApp...')
    }
})

// Credentials update
sock.ev.on('creds.update', (creds) => {
    console.log('🔐 Credentials updated')
    // Save credentials automatically if using useMultiFileAuthState
})
\`\`\`

### Contact and Chat Events

\`\`\`javascript
// Contact updates
sock.ev.on('contacts.update', (contacts) => {
    for (const contact of contacts) {
        console.log('👤 Contact updated:', contact)
    }
})

// Chat updates
sock.ev.on('chats.update', (chats) => {
    for (const chat of chats) {
        console.log('💬 Chat updated:', chat)
    }
})

// New chats
sock.ev.on('chats.upsert', (chats) => {
    for (const chat of chats) {
        console.log('💬 New chat:', chat)
    }
})

// Presence updates (online/offline status)
sock.ev.on('presence.update', (presence) => {
    console.log('👁️ Presence update:', presence)
})
\`\`\`

### Group Events

\`\`\`javascript
// Group updates
sock.ev.on('groups.upsert', (groups) => {
    for (const group of groups) {
        console.log('👥 Group created/updated:', group)
    }
})

// Group participant updates
sock.ev.on('group-participants.update', (update) => {
    console.log('👥 Group participants updated:', update)
    
    const { id, participants, action } = update
    
    switch (action) {
        case 'add':
            console.log(\`➕ Added to group \${id}:\`, participants)
            break
        case 'remove':
            console.log(\`➖ Removed from group \${id}:\`, participants)
            break
        case 'promote':
            console.log(\`⬆️ Promoted in group \${id}:\`, participants)
            break
        case 'demote':
            console.log(\`⬇️ Demoted in group \${id}:\`, participants)
            break
    }
})
\`\`\`

## 🎯 System Stability

### Health Monitoring

\`\`\`javascript
// Access the stability manager
const stabilityManager = sock.stabilityManager

// Monitor system health
stabilityManager.on('health-check', (metrics) => {
    console.log('🏥 System Health:', {
        memory: Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024) + 'MB',
        uptime: Math.round(metrics.uptime / 1000) + 's',
        connectionStability: (metrics.connectionStability * 100).toFixed(1) + '%',
        messageRate: metrics.messageProcessingRate.toFixed(2) + '/s',
        errorRate: (metrics.errorRate * 100).toFixed(2) + '%'
    })
})

// Handle critical errors
stabilityManager.on('critical-error', (error) => {
    console.error('🚨 Critical system error:', error)
    // Implement your error handling logic here
})

// Handle memory warnings
stabilityManager.on('memory-warning', (warning) => {
    console.warn('⚠️ High memory usage:', warning)
    // Implement memory cleanup logic here
})

// Handle connection instability
stabilityManager.on('connection-instability', (data) => {
    console.warn('📶 Connection unstable:', data)
    // Implement connection recovery logic here
})

// Get current system stats
const stats = stabilityManager.getSystemStats()
console.log('📊 System Statistics:', stats)
\`\`\`

### Retry Mechanisms

\`\`\`javascript
// Use built-in retry mechanism for critical operations
async function sendMessageWithRetry(jid, message) {
    return await stabilityManager.executeWithRetry(
        async () => {
            return await sock.sendMessage(jid, message)
        },
        'sendMessage',
        3 // max retries
    )
}

// Usage
try {
    const result = await sendMessageWithRetry('1234567890@s.whatsapp.net', {
        text: 'This message will be retried if it fails'
    })
    console.log('✅ Message sent successfully:', result.key.id)
} catch (error) {
    console.error('❌ Failed to send message after retries:', error)
}
\`\`\`

## 📁 Media Handling

### Download Media

\`\`\`javascript
const fs = require('fs')
const path = require('path')

async function downloadMedia(message, filename) {
    try {
        const buffer = await sock.downloadMediaMessage(message)
        
        if (buffer) {
            const filePath = path.join('./downloads', filename)
            fs.writeFileSync(filePath, buffer)
            console.log(\`💾 Media saved: \${filePath}\`)
            return filePath
        }
    } catch (error) {
        console.error('❌ Failed to download media:', error)
        throw error
    }
}

// Handle different media types
async function handleImageMessage(message) {
    const filename = \`image_\${Date.now()}.jpg\`
    await downloadMedia(message, filename)
}

async function handleVideoMessage(message) {
    const filename = \`video_\${Date.now()}.mp4\`
    await downloadMedia(message, filename)
}

async function handleAudioMessage(message) {
    const filename = \`audio_\${Date.now()}.ogg\`
    await downloadMedia(message, filename)
}

async function handleDocumentMessage(message) {
    const docMessage = message.message.documentMessage
    const filename = docMessage.fileName || \`document_\${Date.now()}\`
    await downloadMedia(message, filename)
}
\`\`\`

### Upload Media

\`\`\`javascript
async function uploadAndSendMedia(jid, filePath, type, options = {}) {
    try {
        const fileBuffer = fs.readFileSync(filePath)
        const fileName = path.basename(filePath)
        
        let messageContent = {}
        
        switch (type) {
            case 'image':
                messageContent = {
                    image: fileBuffer,
                    caption: options.caption,
                    jpegThumbnail: options.thumbnail
                }
                break
                
            case 'video':
                messageContent = {
                    video: fileBuffer,
                    caption: options.caption,
                    gifPlayback: options.isGif || false,
                    ptv: options.isVideoNote || false
                }
                break
                
            case 'audio':
                messageContent = {
                    audio: fileBuffer,
                    ptt: options.isVoiceNote || false,
                    mimetype: options.mimetype || 'audio/mp4'
                }
                break
                
            case 'document':
                messageContent = {
                    document: fileBuffer,
                    fileName: fileName,
                    mimetype: options.mimetype || 'application/octet-stream',
                    caption: options.caption
                }
                break
                
            default:
                throw new Error('Unsupported media type')
        }
        
        const message = await sock.sendMessage(jid, messageContent)
        console.log(\`📤 \${type} uploaded and sent:\`, message.key.id)
        return message
        
    } catch (error) {
        console.error(\`❌ Failed to upload \${type}:\`, error)
        throw error
    }
}

// Usage examples
await uploadAndSendMedia('1234567890@s.whatsapp.net', './image.jpg', 'image', {
    caption: 'Check out this image!'
})

await uploadAndSendMedia('1234567890@s.whatsapp.net', './video.mp4', 'video', {
    caption: 'Amazing video!',
    isGif: false
})

await uploadAndSendMedia('1234567890@s.whatsapp.net', './audio.mp3', 'audio', {
    isVoiceNote: true
})

await uploadAndSendMedia('1234567890@s.whatsapp.net', './document.pdf', 'document', {
    caption: 'Important document',
    mimetype: 'application/pdf'
})
\`\`\`

## ⚠️ Error Handling

### Comprehensive Error Handling

\`\`\`javascript
const { Boom } = require('@hapi/boom')

// Global error handler
function setupErrorHandling(sock) {
    // Handle socket errors
    sock.ev.on('connection.update', (update) => {
        const { lastDisconnect } = update
        
        if (lastDisconnect?.error) {
            const error = lastDisconnect.error as Boom
            
            switch (error.output?.statusCode) {
                case DisconnectReason.badSession:
                    console.error('❌ Bad session file, please delete and scan again')
                    break
                    
                case DisconnectReason.connectionClosed:
                    console.error('🔌 Connection closed, reconnecting...')
                    break
                    
                case DisconnectReason.connectionLost:
                    console.error('📶 Connection lost, reconnecting...')
                    break
                    
                case DisconnectReason.connectionReplaced:
                    console.error('🔄 Connection replaced, another web session opened')
                    break
                    
                case DisconnectReason.loggedOut:
                    console.error('👋 Device logged out, please scan QR code again')
                    break
                    
                case DisconnectReason.restartRequired:
                    console.error('🔄 Restart required')
                    break
                    
                case DisconnectReason.timedOut:
                    console.error('⏰ Connection timed out, reconnecting...')
                    break
                    
                default:
                    console.error('❌ Unknown disconnect reason:', error)
            }
        }
    })
    
    // Handle message send errors
    sock.ev.on('messages.update', (updates) => {
        for (const update of updates) {
            if (update.update.status === 'ERROR') {
                console.error('❌ Message failed to send:', update.key.id)
                // Implement retry logic here
            }
        }
    })
}

// Specific error handling functions
async function safeMessageSend(jid, content, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const message = await sock.sendMessage(jid, content)
            return message
        } catch (error) {
            console.error(\`❌ Send attempt \${attempt} failed:\`, error.message)
            
            if (attempt === retries) {
                throw new Error(\`Failed to send message after \${retries} attempts: \${error.message}\`)
            }
            
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
    }
}

// Usage
try {
    await safeMessageSend('1234567890@s.whatsapp.net', { text: 'Hello!' })
} catch (error) {
    console.error('❌ Final error:', error.message)
}
\`\`\`

### Error Types and Solutions

\`\`\`javascript
// Common error scenarios and solutions
const ERROR_SOLUTIONS = {
    'rate-overlimit': {
        description: 'Too many requests sent',
        solution: 'Implement rate limiting and delays between messages',
        code: \`
            // Add delay between messages
            await new Promise(resolve => setTimeout(resolve, 1000))
        \`
    },
    
    'connection-closed': {
        description: 'WebSocket connection closed',
        solution: 'Implement automatic reconnection',
        code: \`
            if (shouldReconnect) {
                setTimeout(connectToWhatsApp, 5000)
            }
        \`
    },
    
    'media-upload-failed': {
        description: 'Failed to upload media file',
        solution: 'Check file size and format, implement retry mechanism',
        code: \`
            // Check file size (max 16MB for most media)
            const stats = fs.statSync(filePath)
            if (stats.size > 16 * 1024 * 1024) {
                throw new Error('File too large')
            }
        \`
    },
    
    'invalid-jid': {
        description: 'Invalid WhatsApp ID format',
        solution: 'Validate JID format before sending',
        code: \`
            function isValidJid(jid) {
                return /^\\d+@s\\.whatsapp\\.net$/.test(jid) || 
                       /^\\d+-\\d+@g\\.us$/.test(jid)
            }
        \`
    }
}
\`\`\`

## 🔧 Advanced Usage

### Custom Message Handlers

\`\`\`javascript
class MessageHandler {
    constructor(sock) {
        this.sock = sock
        this.commands = new Map()
        this.setupHandlers()
    }
    
    // Register command handlers
    registerCommand(command, handler) {
        this.commands.set(command.toLowerCase(), handler)
    }
    
    setupHandlers() {
        this.sock.ev.on('messages.upsert', async (m) => {
            const message = m.messages[0]
            
            if (!message.key.fromMe && m.type === 'notify') {
                await this.handleMessage(message)
            }
        })
    }
    
    async handleMessage(message) {
        const text = this.extractMessageText(message)
        const senderJid = message.key.remoteJid
        
        // Handle commands (messages starting with !)
        if (text.startsWith('!')) {
            const [command, ...args] = text.slice(1).split(' ')
            await this.handleCommand(command, args, senderJid, message)
        }
        
        // Handle button responses
        if (message.message?.buttonsResponseMessage) {
            await this.handleButtonResponse(message)
        }
        
        // Handle list responses
        if (message.message?.listResponseMessage) {
            await this.handleListResponse(message)
        }
    }
    
    async handleCommand(command, args, senderJid, message) {
        const handler = this.commands.get(command.toLowerCase())
        
        if (handler) {
            try {
                await handler(args, senderJid, message)
            } catch (error) {
                console.error(\`❌ Command error (\${command}):\`, error)
                await this.sock.sendMessage(senderJid, {
                    text: \`❌ Error executing command: \${error.message}\`
                })
            }
        } else {
            await this.sock.sendMessage(senderJid, {
                text: \`❓ Unknown command: \${command}\`
            })
        }
    }
    
    async handleButtonResponse(message) {
        const response = message.message.buttonsResponseMessage
        const senderJid = message.key.remoteJid
        
        console.log('🔘 Button pressed:', response.selectedButtonId)
        
        // Handle button response based on ID
        switch (response.selectedButtonId) {
            case 'btn_0':
                await this.sock.sendMessage(senderJid, {
                    text: 'You selected Option 1!'
                })
                break
            case 'btn_1':
                await this.sock.sendMessage(senderJid, {
                    text: 'You selected Option 2!'
                })
                break
            // Add more cases as needed
        }
    }
    
    async handleListResponse(message) {
        const response = message.message.listResponseMessage
        const senderJid = message.key.remoteJid
        
        console.log('📋 List item selected:', response.singleSelectReply.selectedRowId)
        
        // Handle list response based on row ID
        switch (response.singleSelectReply.selectedRowId) {
            case 'home':
                await this.sock.sendMessage(senderJid, {
                    text: '🏠 Welcome to the home page!'
                })
                break
            case 'about':
                await this.sock.sendMessage(senderJid, {
                    text: 'ℹ️ About us: We are a WhatsApp bot service.'
                })
                break
            // Add more cases as needed
        }
    }
    
    extractMessageText(message) {
        return message.message?.conversation ||
               message.message?.extendedTextMessage?.text ||
               message.message?.imageMessage?.caption ||
               message.message?.videoMessage?.caption ||
               ''
    }
}

// Usage
const messageHandler = new MessageHandler(sock)

// Register commands
messageHandler.registerCommand('help', async (args, senderJid) => {
    await sock.sendMessage(senderJid, {
        text: \`
🤖 Available Commands:
!help - Show this help message
!ping - Check bot status
!time - Get current time
!weather [city] - Get weather info
!joke - Get a random joke
        \`
    })
})

messageHandler.registerCommand('ping', async (args, senderJid) => {
    await sock.sendMessage(senderJid, {
        text: '🏓 Pong! Bot is online.'
    })
})

messageHandler.registerCommand('time', async (args, senderJid) => {
    const now = new Date()
    await sock.sendMessage(senderJid, {
        text: \`🕐 Current time: \${now.toLocaleString()}\`
    })
})
\`\`\`

### Group Management

\`\`\`javascript
// Group management functions
async function createGroup(subject, participants) {
    try {
        const group = await sock.groupCreate(subject, participants)
        console.log('👥 Group created:', group)
        return group
    } catch (error) {
        console.error('❌ Failed to create group:', error)
        throw error
    }
}

async function addParticipants(groupJid, participants) {
    try {
        const result = await sock.groupParticipantsUpdate(groupJid, participants, 'add')
        console.log('➕ Participants added:', result)
        return result
    } catch (error) {
        console.error('❌ Failed to add participants:', error)
        throw error
    }
}

async function removeParticipants(groupJid, participants) {
    try {
        const result = await sock.groupParticipantsUpdate(groupJid, participants, 'remove')
        console.log('➖ Participants removed:', result)
        return result
    } catch (error) {
        console.error('❌ Failed to remove participants:', error)
        throw error
    }
}

async function promoteParticipants(groupJid, participants) {
    try {
        const result = await sock.groupParticipantsUpdate(groupJid, participants, 'promote')
        console.log('⬆️ Participants promoted:', result)
        return result
    } catch (error) {
        console.error('❌ Failed to promote participants:', error)
        throw error
    }
}

async function demoteParticipants(groupJid, participants) {
    try {
        const result = await sock.groupParticipantsUpdate(groupJid, participants, 'demote')
        console.log('⬇️ Participants demoted:', result)
        return result
    } catch (error) {
        console.error('❌ Failed to demote participants:', error)
        throw error
    }
}

async function updateGroupSubject(groupJid, subject) {
    try {
        await sock.groupUpdateSubject(groupJid, subject)
        console.log('📝 Group subject updated:', subject)
    } catch (error) {
        console.error('❌ Failed to update group subject:', error)
        throw error
    }
}

async function updateGroupDescription(groupJid, description) {
    try {
        await sock.groupUpdateDescription(groupJid, description)
        console.log('📄 Group description updated')
    } catch (error) {
        console.error('❌ Failed to update group description:', error)
        throw error
    }
}

async function getGroupMetadata(groupJid) {
    try {
        const metadata = await sock.groupMetadata(groupJid)
        console.log('👥 Group metadata:', metadata)
        return metadata
    } catch (error) {
        console.error('❌ Failed to get group metadata:', error)
        throw error
    }
}

// Usage examples
const groupJid = await createGroup('My Bot Group', [
    '1234567890@s.whatsapp.net',
    '0987654321@s.whatsapp.net'
])

await updateGroupSubject(groupJid, 'Updated Group Name')
await updateGroupDescription(groupJid, 'This is an automated group managed by Baileys-Noob')
\`\`\`

### Contact Management

\`\`\`javascript
// Contact management functions
async function getContactInfo(jid) {
    try {
        // Get contact from local store
        const contacts = await sock.store?.contacts
        const contact = contacts?.[jid]
        
        if (contact) {
            console.log('👤 Contact info:', contact)
            return contact
        } else {
            console.log('❓ Contact not found in local store')
            return null
        }
    } catch (error) {
        console.error('❌ Failed to get contact info:', error)
        throw error
    }
}

async function updateContactName(jid, name) {
    try {
        await sock.updateProfileName(name)
        console.log(\`📝 Profile name updated to: \${name}\`)
    } catch (error) {
        console.error('❌ Failed to update profile name:', error)
        throw error
    }
}

async function getProfilePicture(jid) {
    try {
        const profilePicUrl = await sock.profilePictureUrl(jid, 'image')
        console.log('🖼️ Profile picture URL:', profilePicUrl)
        return profilePicUrl
    } catch (error) {
        console.error('❌ Failed to get profile picture:', error)
        return null
    }
}

async function updateProfilePicture(imagePath) {
    try {
        const imageBuffer = fs.readFileSync(imagePath)
        await sock.updateProfilePicture(sock.user.id, imageBuffer)
        console.log('🖼️ Profile picture updated')
    } catch (error) {
        console.error('❌ Failed to update profile picture:', error)
        throw error
    }
}

async function getStatus(jid) {
    try {
        const status = await sock.fetchStatus(jid)
        console.log('📱 Status:', status)
        return status
    } catch (error) {
        console.error('❌ Failed to get status:', error)
        return null
    }
}

async function updateStatus(status) {
    try {
        await sock.updateProfileStatus(status)
        console.log(\`📱 Status updated to: \${status}\`)
    } catch (error) {
        console.error('❌ Failed to update status:', error)
        throw error
    }
}
\`\`\`

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. **Connection Issues**

\`\`\`javascript
// Issue: Connection keeps dropping
// Solution: Implement robust reconnection logic

let reconnectAttempts = 0
const maxReconnectAttempts = 5

async function connectWithRetry() {
    try {
        const sock = await connectToWhatsApp()
        reconnectAttempts = 0 // Reset on successful connection
        return sock
    } catch (error) {
        reconnectAttempts++
        
        if (reconnectAttempts <= maxReconnectAttempts) {
            console.log(\`🔄 Reconnection attempt \${reconnectAttempts}/\${maxReconnectAttempts}\`)
            setTimeout(connectWithRetry, 5000 * reconnectAttempts) // Exponential backoff
        } else {
            console.error('❌ Max reconnection attempts reached')
            throw error
        }
    }
}
\`\`\`

#### 2. **Authentication Problems**

\`\`\`javascript
// Issue: Authentication fails or session expires
// Solution: Proper session management

const path = require('path')

async function setupRobustAuth() {
    const authDir = path.join(__dirname, 'auth_session')
    
    // Ensure auth directory exists
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true })
    }
    
    try {
        const { state, saveCreds } = await useMultiFileAuthState(authDir)
        
        const sock = makeWASocket({
            auth: state,
            // ... other options
        })
        
        // Save credentials on every update
        sock.ev.on('creds.update', saveCreds)
        
        return sock
    } catch (error) {
        console.error('❌ Auth setup failed:', error)
        
        // Clear corrupted auth files
        if (fs.existsSync(authDir)) {
            fs.rmSync(authDir, { recursive: true, force: true })
            console.log('🗑️ Cleared corrupted auth files, please scan QR again')
        }
        
        throw error
    }
}
\`\`\`

#### 3. **Message Sending Failures**

\`\`\`javascript
// Issue: Messages fail to send
// Solution: Implement retry mechanism with proper error handling

async function robustMessageSend(jid, content, options = {}) {
    const maxRetries = options.maxRetries || 3
    const retryDelay = options.retryDelay || 1000
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Validate JID format
            if (!isValidJid(jid)) {
                throw new Error('Invalid JID format')
            }
            
            // Check if user is online (optional)
            const presence = await sock.presenceSubscribe(jid)
            
            // Send message
            const message = await sock.sendMessage(jid, content)
            
            console.log(\`✅ Message sent successfully (attempt \${attempt})\`)
            return message
            
        } catch (error) {
            console.error(\`❌ Send attempt \${attempt} failed:\`, error.message)
            
            // Don't retry for certain errors
            if (error.message.includes('invalid-jid') || 
                error.message.includes('not-authorized')) {
                throw error
            }
            
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
            } else {
                throw new Error(\`Failed to send message after \${maxRetries} attempts: \${error.message}\`)
            }
        }
    }
}

function isValidJid(jid) {
    const patterns = [
        /^\d+@s\.whatsapp\.net$/,     // Individual chat
        /^\d+-\d+@g\.us$/,            // Group chat
        /^status@broadcast$/          // Status broadcast
    ]
    
    return patterns.some(pattern => pattern.test(jid))
}
\`\`\`

#### 4. **Memory Issues**

\`\`\`javascript
// Issue: High memory usage
// Solution: Implement memory management

function setupMemoryManagement(sock) {
    // Monitor memory usage
    setInterval(() => {
        const memUsage = process.memoryUsage()
        const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024)
        
        if (heapUsedMB > 500) { // 500MB threshold
            console.warn(\`⚠️ High memory usage: \${heapUsedMB}MB\`)
            
            // Force garbage collection if available
            if (global.gc) {
                global.gc()
                console.log('🗑️ Forced garbage collection')
            }
            
            // Clear message cache if implemented
            if (sock.messageCache) {
                sock.messageCache.clear()
                console.log('🗑️ Cleared message cache')
            }
        }
    }, 30000) // Check every 30 seconds
    
    // Handle memory warnings
    process.on('warning', (warning) => {
        if (warning.name === 'MaxListenersExceededWarning') {
            console.warn('⚠️ Too many event listeners, possible memory leak')
        }
    })
}
\`\`\`

#### 5. **Rate Limiting**

\`\`\`javascript
// Issue: Getting rate limited by WhatsApp
// Solution: Implement proper rate limiting

class RateLimiter {
    constructor(maxRequests = 10, timeWindow = 60000) {
        this.maxRequests = maxRequests
        this.timeWindow = timeWindow
        this.requests = []
    }
    
    async checkLimit() {
        const now = Date.now()
        
        // Remove old requests outside time window
        this.requests = this.requests.filter(time => now - time < this.timeWindow)
        
        if (this.requests.length >= this.maxRequests) {
            const oldestRequest = Math.min(...this.requests)
            const waitTime = this.timeWindow - (now - oldestRequest)
            
            console.log(\`⏳ Rate limit reached, waiting \${waitTime}ms\`)
            await new Promise(resolve => setTimeout(resolve, waitTime))
            
            return this.checkLimit() // Recursive check
        }
        
        this.requests.push(now)
        return true
    }
}

const rateLimiter = new RateLimiter(5, 60000) // 5 requests per minute

async function sendMessageWithRateLimit(jid, content) {
    await rateLimiter.checkLimit()
    return await sock.sendMessage(jid, content)
}
\`\`\`

### Debug Mode

\`\`\`javascript
// Enable debug mode for troubleshooting
const sock = makeWASocket({
    auth: state,
    logger: require('pino')({
        level: 'debug', // Enable debug logging
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'hostname'
            }
        }
    }),
    // ... other options
})

// Log all events for debugging
const originalEmit = sock.ev.emit
sock.ev.emit = function(event, ...args) {
    console.log(\`🔍 Event emitted: \${event}\`, args)
    return originalEmit.call(this, event, ...args)
}
\`\`\`

## 📚 Complete Example Application

Here's a complete example of a WhatsApp bot using all the features:

\`\`\`javascript
const { 
    default: makeWASocket, 
    DisconnectReason, 
    useMultiFileAuthState,
    downloadMediaMessage
} = require('baileys-noob')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const path = require('path')

class WhatsAppBot {
    constructor() {
        this.sock = null
        this.isConnected = false
        this.messageHandler = null
        this.rateLimiter = new Map()
    }
    
    async initialize() {
        try {
            // Setup authentication
            const { state, saveCreds } = await useMultiFileAuthState('./auth_session')
            
            // Create socket
            this.sock = makeWASocket({
                auth: state,
                logger: require('pino')({ level: 'silent' }),
                generateHighQualityLinkPreview: true,
                markOnlineOnConnect: true,
                syncFullHistory: false,
                fireInitQueries: true,
                emitOwnEvents: false
            })
            
            // Setup event handlers
            this.setupEventHandlers()
            
            // Save credentials
            this.sock.ev.on('creds.update', saveCreds)
            
            console.log('🤖 WhatsApp Bot initialized')
            
        } catch (error) {
            console.error('❌ Failed to initialize bot:', error)
            throw error
        }
    }
    
    setupEventHandlers() {
        // Connection updates
        this.sock.ev.on('connection.update', this.handleConnectionUpdate.bind(this))
        
        // Incoming messages
        this.sock.ev.on('messages.upsert', this.handleMessages.bind(this))
        
        // Message updates
        this.sock.ev.on('messages.update', this.handleMessageUpdates.bind(this))
        
        // Group updates
        this.sock.ev.on('group-participants.update', this.handleGroupUpdates.bind(this))
    }
    
    async handleConnectionUpdate(update) {
        const { connection, lastDisconnect, qr } = update
        
        if (qr) {
            console.log('📱 Scan this QR code to connect:')
            console.log(qr)
        }
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            
            if (shouldReconnect) {
                console.log('🔄 Reconnecting...')
                setTimeout(() => this.initialize(), 5000)
            } else {
                console.log('❌ Logged out, please restart and scan QR')
            }
            
            this.isConnected = false
        } else if (connection === 'open') {
            console.log('✅ Connected to WhatsApp!')
            this.isConnected = true
            
            // Send startup message to admin (optional)
            // await this.sendMessage('admin@s.whatsapp.net', { text: '🤖 Bot is online!' })
        }
    }
    
    async handleMessages(m) {
        const message = m.messages[0]
        
        if (!message.key.fromMe && m.type === 'notify') {
            await this.processMessage(message)
        }
    }
    
    async processMessage(message) {
        try {
            const text = this.extractText(message)
            const senderJid = message.key.remoteJid
            const senderName = message.pushName || 'Unknown'
            
            console.log(\`📨 Message from \${senderName}: \${text}\`)
            
            // Rate limiting
            if (!await this.checkRateLimit(senderJid)) {
                return
            }
            
            // Handle commands
            if (text.startsWith('!')) {
                await this.handleCommand(text, senderJid, message)
            }
            
            // Handle media
            if (message.message?.imageMessage) {
                await this.handleImageMessage(message)
            }
            
            // Auto-responses
            await this.handleAutoResponses(text, senderJid)
            
        } catch (error) {
            console.error('❌ Error processing message:', error)
        }
    }
    
    async handleCommand(text, senderJid, message) {
        const [command, ...args] = text.slice(1).split(' ')
        
        switch (command.toLowerCase()) {
            case 'help':
                await this.sendHelpMessage(senderJid)
                break
                
            case 'ping':
                await this.sendMessage(senderJid, { text: '🏓 Pong!' })
                break
                
            case 'time':
                await this.sendMessage(senderJid, { 
                    text: \`🕐 Current time: \${new Date().toLocaleString()}\`
                })
                break
                
            case 'buttons':
                await this.sendButtonExample(senderJid)
                break
                
            case 'list':
                await this.sendListExample(senderJid)
                break
                
            case 'newsletter':
                await this.handleNewsletterCommand(args, senderJid)
                break
                
            case 'ai':
                await this.sendAIMessage(senderJid, args.join(' '))
                break
                
            default:
                await this.sendMessage(senderJid, { 
                    text: \`❓ Unknown command: \${command}\\nType !help for available commands\`
                })
        }
    }
    
    async sendHelpMessage(jid) {
        const helpText = \`
🤖 **WhatsApp Bot Commands**

📋 **Basic Commands:**
!help - Show this help message
!ping - Check bot status
!time - Get current time

🎛️ **Interactive Messages:**
!buttons - Show button example
!list - Show list example

📰 **Newsletter:**
!newsletter create [name] - Create newsletter
!newsletter subscribe [id] - Subscribe to newsletter

🤖 **AI Features:**
!ai [message] - Send AI-styled message

💡 **Tips:**
- Send images to get image analysis
- Use buttons and lists for better interaction
        \`
        
        await this.sendMessage(jid, { text: helpText })
    }
    
    async sendButtonExample(jid) {
        await this.sock.createButtonMessage(jid, {
            body: { text: 'Choose an option:' },
            footer: { text: 'Baileys-Noob Bot' },
            buttons: [
                { id: 'option1', displayText: 'Option 1' },
                { id: 'option2', displayText: 'Option 2' },
                { id: 'option3', displayText: 'Option 3' }
            ]
        })
    }
    
    async sendListExample(jid) {
        await this.sock.createListMessage(jid, {
            title: 'Select Service',
            description: 'Choose from our available services:',
            buttonText: 'View Options',
            sections: [
                {
                    title: 'Main Services',
                    rows: [
                        { title: 'Support', description: 'Get technical support', rowId: 'support' },
                        { title: 'Information', description: 'Get more information', rowId: 'info' },
                        { title: 'Feedback', description: 'Send us feedback', rowId: 'feedback' }
                    ]
                }
            ]
        })
    }
    
    async sendAIMessage(jid, text) {
        if (!text) {
            await this.sendMessage(jid, { text: '❓ Please provide a message for AI styling' })
            return
        }
        
        const aiMessage = await this.sock.addAIMessageIcon(
            { text: \`🤖 AI Response: \${text}\` },
            {
                enabled: true,
                iconType: 'SPARKLE',
                position: 'TOP_RIGHT',
                size: 'MEDIUM'
            }
        )
        
        await this.sendMessage(jid, aiMessage)
    }
    
    async handleNewsletterCommand(args, senderJid) {
        const action = args[0]
        
        switch (action) {
            case 'create':
                const name = args.slice(1).join(' ')
                if (!name) {
                    await this.sendMessage(senderJid, { text: '❓ Please provide newsletter name' })
                    return
                }
                
                try {
                    const newsletter = await this.sock.createNewsletter({ name })
                    await this.sendMessage(senderJid, { 
                        text: \`✅ Newsletter created: \${newsletter.name} (ID: \${newsletter.id})\`
                    })
                } catch (error) {
                    await this.sendMessage(senderJid, { 
                        text: \`❌ Failed to create newsletter: \${error.message}\`
                    })
                }
                break
                
            case 'subscribe':
                const newsletterId = args[1]
                if (!newsletterId) {
                    await this.sendMessage(senderJid, { text: '❓ Please provide newsletter ID' })
                    return
                }
                
                try {
                    await this.sock.subscribeToNewsletter(newsletterId)
                    await this.sendMessage(senderJid, { text: '✅ Subscribed to newsletter!' })
                } catch (error) {
                    await this.sendMessage(senderJid, { 
                        text: \`❌ Failed to subscribe: \${error.message}\`
                    })
                }
                break
                
            default:
                await this.sendMessage(senderJid, { 
                    text: 'Usage: !newsletter create [name] or !newsletter subscribe [id]'
                })
        }
    }
    
    async handleImageMessage(message) {
        try {
            const buffer = await downloadMediaMessage(message, 'buffer', {})
            const caption = message.message.imageMessage.caption || ''
            
            console.log('🖼️ Image received:', caption)
            
            // You can process the image here
            // For example, save it or analyze it
            
            await this.sendMessage(message.key.remoteJid, {
                text: '📸 Image received! Thanks for sharing.'
            })
            
        } catch (error) {
            console.error('❌ Failed to process image:', error)
        }
    }
    
    async handleAutoResponses(text, senderJid) {
        const lowerText = text.toLowerCase()
        
        if (lowerText.includes('hello') || lowerText.includes('hi')) {
            await this.sendMessage(senderJid, {
                text: '👋 Hello! How can I help you today? Type !help for available commands.'
            })
        } else if (lowerText.includes('thank')) {
            await this.sendMessage(senderJid, {
                text: '😊 You\'re welcome! Happy to help!'
            })
        } else if (lowerText.includes('bye')) {
            await this.sendMessage(senderJid, {
                text: '👋 Goodbye! Have a great day!'
            })
        }
    }
    
    async handleMessageUpdates(updates) {
        for (const update of updates) {
            if (update.update.status === 'ERROR') {
                console.error('❌ Message failed:', update.key.id)
            }
        }
    }
    
    async handleGroupUpdates(update) {
        const { id, participants, action } = update
        
        try {
            const groupMetadata = await this.sock.groupMetadata(id)
            
            for (const participant of participants) {
                let message = ''
                
                switch (action) {
                    case 'add':
                        message = \`👋 Welcome to \${groupMetadata.subject}! Type !help to see available commands.\`
                        break
                    case 'remove':
                        message = \`👋 \${participant} left the group.\`
                        break
                    case 'promote':
                        message = \`🎉 \${participant} is now an admin!\`
                        break
                    case 'demote':
                        message = \`📝 \${participant} is no longer an admin.\`
                        break
                }
                
                if (message) {
                    await this.sendMessage(id, { text: message })
                }
            }
        } catch (error) {
            console.error('❌ Error handling group update:', error)
        }
    }
    
    async checkRateLimit(jid) {
        const now = Date.now()
        const userLimits = this.rateLimiter.get(jid) || { requests: [], lastWarning: 0 }
        
        // Remove old requests (older than 1 minute)
        userLimits.requests = userLimits.requests.filter(time => now - time < 60000)
        
        if (userLimits.requests.length >= 10) { // 10 messages per minute
            if (now - userLimits.lastWarning > 60000) { // Warn once per minute
                await this.sendMessage(jid, {
                    text: '⚠️ You\'re sending messages too quickly. Please slow down.'
                })
                userLimits.lastWarning = now
            }
            return false
        }
        
        userLimits.requests.push(now)
        this.rateLimiter.set(jid, userLimits)
        return true
    }
    
    extractText(message) {
        return message.message?.conversation ||
               message.message?.extendedTextMessage?.text ||
               message.message?.imageMessage?.caption ||
               message.message?.videoMessage?.caption ||
               ''
    }
    
    async sendMessage(jid, content, options = {}) {
        try {
            if (!this.isConnected) {
                throw new Error('Bot is not connected')
            }
            
            const message = await this.sock.sendMessage(jid, content, options)
            return message
        } catch (error) {
            console.error('❌ Failed to send message:', error)
            throw error
        }
    }
    
    async shutdown() {
        if (this.sock) {
            await this.sock.logout()
            console.log('🤖 Bot shutdown complete')
        }
    }
}

// Usage
async function startBot() {
    const bot = new WhatsAppBot()
    
    try {
        await bot.initialize()
        
        // Graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\\n🛑 Shutting down bot...')
            await bot.shutdown()
            process.exit(0)
        })
        
    } catch (error) {
        console.error('❌ Failed to start bot:', error)
        process.exit(1)
    }
}

// Start the bot
startBot()
\`\`\`

## 🤝 Contributing

We welcome contributions to Baileys-Noob! Here's how you can help:

### Development Setup

\`\`\`bash
# Clone the repository
git clone https://github.com/KazeDevID/baileys-noob.git
cd baileys-noob

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build
\`\`\`

### Contribution Guidelines

1. **Fork the repository** and create your feature branch
2. **Write tests** for new functionality
3. **Follow the coding standards** (ESLint configuration provided)
4. **Update documentation** for any new features
5. **Submit a pull request** with a clear description

### Code Style

\`\`\`javascript
// Use TypeScript for new features
interface NewFeature {
    name: string
    description: string
    enabled: boolean
}

// Follow async/await pattern
async function newFeature(): Promise<void> {
    try {
        // Implementation
    } catch (error) {
        logger.error('Error in newFeature:', error)
        throw error
    }
}

// Use proper error handling
function validateInput(input: string): void {
    if (!input || input.trim().length === 0) {
        throw new Error('Input cannot be empty')
    }
}
\`\`\`

### Reporting Issues

When reporting issues, please include:

- **Node.js version**
- **Package version**
- **Operating system**
- **Detailed error messages**
- **Steps to reproduce**
- **Expected vs actual behavior**

### Feature Requests

For feature requests, please provide:

- **Clear description** of the feature
- **Use case** and benefits
- **Proposed implementation** (if applicable)
- **Breaking changes** (if any)

## 🙏 Acknowledgments

- **[@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys)** - The original Baileys library
- **WhatsApp** - For providing the platform
- **Contributors** - Everyone who has contributed to this project
- **Community** - For feedback and support

## 📞 Support

- **GitHub Issues**: [Report bugs and request features](https://github.com/KazeDevID/baileys-noob/issues)
- **Discussions**: [Community discussions](https://github.com/KazeDevID/baileys-noob/discussions)
- **Examples**: [More examples and tutorials](https://github.com/KazeDevID/baileys-noob-examples)

---

**Made with ❤️ by the Baileys-Noob community**

*Happy coding! 🚀*
