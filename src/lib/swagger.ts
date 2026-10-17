// @ts-nocheck
import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = () => {
    const spec = createSwaggerSpec({
        apiFolder: "src/app/api",
        definition: {
            openapi: "3.0.0",
            info: {
                title: "Documentação da API WA-AKG",
                version: "1.6.1",
                description: `
# WhatsApp AI Gateway - Complete API Reference

Professional WhatsApp Gateway with **93 API endpoints** for complete WhatsApp automation.

## 🔐 Authentication
All endpoints require authentication via:
1. **API Key Header**: \`X-API-Key: your-api-key\`
2. **Session Cookie**: \`next-auth.session-token\` (automatically sent by browser)

## 📋 Common Parameters
- **sessionId**: Unique session identifier (e.g., "mysession-01")
- **jid**: WhatsApp JID format:
  - Personal: \`628123456789@s.whatsapp.net\`
  - Group: \`120363123456789@g.us\`

## 📊 Rate Limits
- Phone check: Max 50 numbers per request
- Broadcast: 10-20s random delay between messages
- Message history: Max 100 messages
                `,
            },
            servers: [
                {
                    url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
                    description: "API Server",
                },
            ],
            components: {
                securitySchemes: {
                    ApiKeyAuth: {
                        type: "apiKey",
                        in: "header",
                        name: "X-API-Key",
                        description: "API Key for authentication"
                    },
                    SessionAuth: {
                        type: "apiKey",
                        in: "cookie",
                        name: "next-auth.session-token",
                        description: "Session cookie (browser only)"
                    }
                },
                schemas: {
                    // Common Schemas
                    Error: {
                        type: "object",
                        properties: {
                            status: { type: "boolean", example: false },
                            message: { type: "string", example: "Error occurred" },
                            error: { type: "string", example: "Detailed error info" }
                        }
                    },
                    Success: {
                        type: "object",
                        properties: {
                            status: { type: "boolean", example: true },
                            message: { type: "string", example: "Operação concluída" },
                            data: { type: "object", nullable: true }
                        }
                    },
                    Session: {
                        type: "object",
                        properties: {
                            id: { type: "string", example: "clx123abc" },
                            name: { type: "string", example: "Marketing Bot" },
                            sessionId: { type: "string", example: "marketing-1" },
                            status: { type: "string", enum: ["Conectado", "Desconectado", "Conectando"], example: "Conectado" },
                            userId: { type: "string" },
                            botConfig: { type: "object", nullable: true },
                            webhooks: { type: "array", items: { type: "object" }, nullable: true },
                            _count: {
                                type: "object",
                                properties: {
                                    contacts: { type: "integer" },
                                    messages: { type: "integer" },
                                    groups: { type: "integer" },
                                    autoReplies: { type: "integer" },
                                    scheduledMessages: { type: "integer" }
                                },
                                nullable: true
                            },
                            createdAt: { type: "string", format: "date-time" },
                            updatedAt: { type: "string", format: "date-time" }
                        }
                    },
                    Message: {
                        type: "object",
                        properties: {
                            text: { type: "string", example: "Hello! How can I help you?" }
                        }
                    },
                    Contact: {
                        type: "object",
                        properties: {
                            jid: { type: "string", example: "628123456789@s.whatsapp.net" },
                            name: { type: "string", example: "João da Silva" },
                            notify: { type: "string" },
                            profilePic: { type: "string", nullable: true }
                        }
                    },
                    ScheduledMessage: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            sessionId: { type: "string" },
                            jid: { type: "string" },
                            content: { type: "string" },
                            sendAt: { type: "string", format: "date-time" },
                            status: { type: "string", example: "PENDING" }
                        }
                    },
                    Webhook: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            sessionId: { type: "string" },
                            url: { type: "string" },
                            events: {
                                type: "array",
                                items: { type: "string" },
                                description: "Events to subscribe to: message.received, message.sent, message.status, connection.update, group.update, contact.update, status.update, group.participant, message.deleted, message.edited or '*'"
                            },
                            secret: { type: "string" }
                        }
                    },
                    WebhookLog: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            webhookId: { type: "string" },
                            event: { type: "string" },
                            status: { type: "string", enum: ["SUCCESS", "FAILED"] },
                            requestUrl: { type: "string" },
                            requestHeaders: { type: "object" },
                            requestBody: { type: "object" },
                            responseStatusCode: { type: "integer", nullable: true },
                            responseBody: { type: "string", nullable: true },
                            responseTimeMs: { type: "integer", nullable: true },
                            errorMessage: { type: "string", nullable: true },
                            createdAt: { type: "string", format: "date-time" }
                        }
                    },
                    Group: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            subject: { type: "string" },
                            desc: { type: "string" },
                            owner: { type: "string" },
                            size: { type: "number" },
                            isCommunity: { type: "boolean", description: "Whether this group is a WhatsApp Community announcement group" },
                            linkedParentJid: { type: "string", nullable: true, description: "JID of the parent community if this is a sub-group" },
                            participants: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        id: { type: "string" },
                                        admin: { type: "string", nullable: true }
                                    }
                                }
                            }
                        }
                    },
                    Label: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            color: { type: "number", nullable: true },
                            predefinedId: { type: "string", nullable: true }
                        }
                    },
                    GroupDetails: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            subject: { type: "string" },
                            subjectOwner: { type: "string" },
                            subjectTime: { type: "number" },
                            desc: { type: "string" },
                            descOwner: { type: "string" },
                            descId: { type: "string" },
                            owner: { type: "string" }
                        }
                    },
                    BroadcastLog: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            sessionId: { type: "string" },
                            message: { type: "string" },
                            total: { type: "integer" },
                            sent: { type: "integer" },
                            failed: { type: "integer" },
                            status: { type: "string", enum: ["running", "completed", "cancelled"] },
                            delay: { type: "integer" },
                            startedAt: { type: "string", format: "date-time" },
                            completedAt: { type: "string", format: "date-time", nullable: true }
                        }
                    },
                    BroadcastRecipient: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            jid: { type: "string" },
                            status: { type: "string", enum: ["pending", "sent", "failed"] },
                            error: { type: "string", nullable: true },
                            sentAt: { type: "string", format: "date-time", nullable: true }
                        }
                    }
                },
                responses: {
                    Unauthorized: {
                        description: "Unauthorized - Invalid or missing API key",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                                example: { status: false, message: "Não autenticado", error: "Não autenticado" }
                            }
                        }
                    },
                    Forbidden: {
                        description: "Forbidden - Access denied",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                                example: { status: false, message: "Você não tem acesso a esta sessão", error: "Você não tem acesso a esta sessão" }
                            }
                        }
                    },
                    NotFound: {
                        description: "Resource not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                                example: { status: false, message: "Sessão não encontrada", error: "Sessão não encontrada" }
                            }
                        }
                    },
                    SessionNotReady: {
                        description: "Session not connected or ready",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                                example: { status: false, message: "Session not ready", error: "Session not ready" }
                            }
                        }
                    },
                    BadRequest: {
                        description: "Bad Request - Invalid parameters",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                                example: { status: false, message: "Invalid request parameters", error: "Invalid request parameters" }
                            }
                        }
                    },
                    ServerError: {
                        description: "Erro interno do servidor",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                                example: { status: false, message: "Erro interno do servidor", error: "Erro interno do servidor" }
                            }
                        }
                    }
                }
            },
            security: [{ ApiKeyAuth: [] }, { SessionAuth: [] }],
            paths: {
                "/media/{filename}": {
                    "get": {
                        "tags": [
                            "Mídia"
                        ],
                        "summary": "Get uploaded media file",
                        "parameters": [
                            {
                                "name": "filename",
                                "in": "path",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "File data"
                            }
                        }
                    }
                },
                "/groups/{sessionId}/{jid}/leave": {
                    "post": {
                        "tags": [
                            "Grupos"
                        ],
                        "summary": "Leave a group",
                        "parameters": [
                            {
                                "name": "sessionId",
                                "in": "path",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "name": "jid",
                                "in": "path",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "Left the group successfully"
                            }
                        }
                    }
                },
                "/docs": {
                    "get": {
                        "tags": [
                            "Documentação"
                        ],
                        "summary": "Get Swagger JSON specification",
                        "responses": {
                            "200": {
                                "description": "Swagger JSON spec"
                            }
                        }
                    }
                },
                "/chats/by-label/{labelId}": {
                    "get": {
                        "tags": [
                            "Conversas"
                        ],
                        "summary": "Get chats by label ID",
                        "parameters": [
                            {
                                "name": "labelId",
                                "in": "path",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "List of chats with the label"
                            }
                        }
                    }
                },
                "/auth/register": {
                    "post": {
                        "tags": [
                            "Web Authentication"
                        ],
                        "summary": "Register a new user",
                        "description": "Register a user via web.",
                        "requestBody": {
                            "required": true,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "required": [
                                            "name",
                                            "email",
                                            "password"
                                        ],
                                        "properties": {
                                            "name": {
                                                "type": "string",
                                                "example": "João da Silva"
                                            },
                                            "email": {
                                                "type": "string",
                                                "example": "john@example.com"
                                            },
                                            "password": {
                                                "type": "string",
                                                "example": "password123"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "responses": {
                            "200": {
                                "description": "User registered"
                            }
                        }
                    }
                },
                // ==================== AUTHENTICATION ====================
                "/auth/session": {
                    get: {
                        tags: ["Web Authentication"],
                        summary: "Get current web session",
                        description: "Check if the user is authenticated in the web dashboard",
                        responses: {
                            200: {
                                description: "Current session",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                user: {
                                                    type: "object",
                                                    properties: {
                                                        name: { type: "string" },
                                                        email: { type: "string" },
                                                        image: { type: "string" }
                                                    }
                                                },
                                                expires: { type: "string" }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "/auth/csrf": {
                    get: {
                        tags: ["Web Authentication"],
                        summary: "Get CSRF token",
                        description: "Retrieve CSRF token for form submissions",
                        responses: {
                            200: {
                                description: "CSRF Token",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                csrfToken: { type: "string" }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                // ==================== SESSIONS ====================
                "/sessions": {
                    get: {
                        tags: ["Sessões"],
                        summary: "List all accessible sessions",
                        description: "Get all sessions accessible to the authenticated user (role-based filtering)",
                        responses: {
                            200: {
                                description: "List of sessions",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "array",
                                            items: { $ref: "#/components/schemas/Session" }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" }
                        }
                    },
                    post: {
                        tags: ["Sessões"],
                        summary: "Create new WhatsApp session",
                        description: "Creates a new WhatsApp session for QR code pairing",
                        requestBody: {
                            required: true,
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["name"],
                                        properties: {
                                            name: { type: "string", example: "Sales Bot", description: "Display name for the session" },
                                            sessionId: { type: "string", example: "sales-01", description: "Unique session ID (auto-generated if not provided)" }
                                        }
                                    },
                                    example: {
                                        name: "Marketing Bot",
                                        sessionId: "marketing-1"
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Sessão criada com sucesso",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/Session" }
                                    }
                                }
                            },
                            400: { description: "Invalid request body" },
                            401: { $ref: "#/components/responses/Unauthorized" }
                        }
                    }
                },

                "/sessions/{id}/qr": {
                    get: {
                        tags: ["Sessões"],
                        summary: "Get QR code for pairing",
                        description: "Retrieve QR code (string and base64 image) for WhatsApp pairing",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: { type: "string" },
                                description: "Session ID",
                                example: "sales-01"
                            }
                        ],
                        responses: {
                            200: {
                                description: "QR code generated",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean" },
                                                qr: { type: "string", description: "QR code string" },
                                                base64: { type: "string", description: "Base64 data URL for image" }
                                            }
                                        },
                                        example: { status: true, message: "QR code generated", data: { success: true, qr: "2@AbCdEfGhIjKlMnOp...", base64: "data:image/png;base64,iVBORw0KGgo..." } }
                                    }
                                }
                            },
                            400: { description: "Already connected" },
                            404: { description: "QR not available yet" }
                        }
                    }
                },

                "/sessions/{id}/bot-config": {
                    get: {
                        tags: ["Sessões"],
                        summary: "Get bot configuration",
                        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                        responses: { 200: { description: "Bot configuration retrieved" } }
                    },
                    post: {
                        tags: ["Sessões"],
                        summary: "Update bot configuration",
                        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            enabled: { type: "boolean" },
                                            botMode: { type: "string", enum: ["OWNER", "SPECIFIC", "BLACKLIST", "ALL"] },
                                            botAllowedJids: { type: "array", items: { type: "string" } },
                                            botBlockedJids: { type: "array", items: { type: "string" } },
                                            autoReplyMode: { type: "string", enum: ["OWNER", "SPECIFIC", "BLACKLIST", "ALL"] },
                                            autoReplyAllowedJids: { type: "array", items: { type: "string" } },
                                            autoReplyBlockedJids: { type: "array", items: { type: "string" } },
                                            botName: { type: "string" },
                                            enableSticker: { type: "boolean" },
                                            enableVideoSticker: { type: "boolean" },
                                            maxStickerDuration: { type: "integer" },
                                            enablePing: { type: "boolean" },
                                            enableUptime: { type: "boolean" },
                                            removeBgApiKey: { type: "string", nullable: true }
                                        }
                                    },
                                    example: {
                                        enabled: true,
                                        botMode: "BLACKLIST",
                                        botBlockedJids: ["628123456789@s.whatsapp.net"],
                                        autoReplyMode: "SPECIFIC",
                                        autoReplyAllowedJids: ["628123456789@s.whatsapp.net"],
                                        botName: "My Assistant",
                                        enableSticker: true
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Configuration updated",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string" },
                                                sessionId: { type: "string" },
                                                enabled: { type: "boolean" },
                                                botMode: { type: "string" },
                                                botAllowedJids: { type: "array", items: { type: "string" } },
                                                autoReplyMode: { type: "string" },
                                                autoReplyAllowedJids: { type: "array", items: { type: "string" } },
                                                botName: { type: "string" },
                                                enableSticker: { type: "boolean" },
                                                enableVideoSticker: { type: "boolean" },
                                                maxStickerDuration: { type: "integer" },
                                                enablePing: { type: "boolean" },
                                                enableUptime: { type: "boolean" },
                                                removeBgApiKey: { type: "string", nullable: true },
                                                createdAt: { type: "string", format: "date-time" },
                                                updatedAt: { type: "string", format: "date-time" }
                                            }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            404: { description: "Sessão não encontrada" },
                            500: { description: "Erro interno do servidor" }
                        }
                    }
                },
                "/sessions/{id}": {
                    get: {
                        tags: ["Sessões"],
                        summary: "Consultar detalhes da sessão",
                        description: "Get detailed information about a specific session including uptime and status",
                        parameters: [
                            { name: "id", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: {
                                description: "Session details",
                                content: {
                                    "application/json": {
                                        schema: {
                                            allOf: [
                                                { $ref: "#/components/schemas/Session" },
                                                {
                                                    type: "object",
                                                    properties: {
                                                        uptime: { type: "integer", description: "Uptime in seconds" },
                                                        messageCount: { type: "integer" },
                                                        hasInstance: { type: "boolean" },
                                                        me: { type: "object", nullable: true }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                            404: { description: "Sessão não encontrada" }
                        }
                    }
                },
                "/sessions/{id}/{action}": {
                    post: {
                        tags: ["Sessões"],
                        summary: "Perform session action",
                        description: "Start, stop, restart, or logout a session",
                        parameters: [
                            { name: "id", in: "path", required: true, schema: { type: "string" } },
                            { name: "action", in: "path", required: true, schema: { type: "string", enum: ["start", "stop", "restart", "logout"] } }
                        ],
                        responses: {
                            200: {
                                description: "Action performed successfully",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/Success" }
                                    }
                                }
                            },
                            400: { description: "Invalid action" },
                            500: { description: "Não foi possível concluir a ação" }
                        }
                    }
                },

                "/sessions/{id}/settings": {
                    patch: {
                        tags: ["Sessões"],
                        summary: "Atualizar configurações da sessão",
                        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            config: {
                                                type: "object",
                                                properties: {
                                                    readReceipts: { type: "boolean" },
                                                    rejectCalls: { type: "boolean" }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        responses: { 200: { description: "Settings updated" } }
                    },
                    delete: {
                        tags: ["Sessões"],
                        summary: "Delete session and logout",
                        description: "Permanently deletes session and logs out from WhatsApp",
                        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                        responses: {
                            200: {
                                description: "Sessão excluída",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/Success" }
                                    }
                                }
                            }
                        }
                    }
                },

                // ==================== SESSION ACCESS ====================
                "/sessions/{sessionId}/access": {
                    get: {
                        tags: ["Acesso às sessões"],
                        summary: "List users with shared access",
                        description: "Get all users who have been granted access to the specified session. Only the session owner or SUPERADMIN can use this endpoint.",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" }, description: "Session ID (slug or CUID)", example: "marketing-1" }
                        ],
                        responses: {
                            200: {
                                description: "Access list retrieved",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                status: { type: "boolean", example: true },
                                                message: { type: "string", example: "Access list retrieved successfully" },
                                                data: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            id: { type: "string" },
                                                            sessionId: { type: "string" },
                                                            userId: { type: "string" },
                                                            createdAt: { type: "string", format: "date-time" },
                                                            user: {
                                                                type: "object",
                                                                properties: {
                                                                    id: { type: "string" },
                                                                    name: { type: "string" },
                                                                    email: { type: "string" },
                                                                    role: { type: "string" }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { description: "Forbidden - Only session owner can manage access" },
                            404: { description: "Sessão não encontrada" }
                        }
                    },
                    post: {
                        tags: ["Acesso às sessões"],
                        summary: "Grant access to another user",
                        description: "Grant session access to another registered user by email. Only the session owner or SUPERADMIN can use this endpoint. Cannot grant access to the session owner or SUPERADMINs.",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" }, description: "Session ID (slug or CUID)", example: "marketing-1" }
                        ],
                        requestBody: {
                            required: true,
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["email"],
                                        properties: {
                                            email: { type: "string", format: "email", description: "Email of the user to grant access", example: "staff@example.com" }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            201: {
                                description: "Acesso concedido com sucesso",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                status: { type: "boolean", example: true },
                                                message: { type: "string", example: "Access granted to staff@example.com" },
                                                data: {
                                                    type: "object",
                                                    properties: {
                                                        id: { type: "string" },
                                                        sessionId: { type: "string" },
                                                        userId: { type: "string" },
                                                        createdAt: { type: "string", format: "date-time" },
                                                        user: {
                                                            type: "object",
                                                            properties: {
                                                                id: { type: "string" },
                                                                name: { type: "string" },
                                                                email: { type: "string" },
                                                                role: { type: "string" }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            400: { description: "Validation error / Cannot grant to owner / SUPERADMIN already has access" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { description: "Forbidden - Only session owner can manage access" },
                            404: { description: "Session or user not found" },
                            409: { description: "User already has access to this session" }
                        }
                    },
                    delete: {
                        tags: ["Acesso às sessões"],
                        summary: "Revoke user access",
                        description: "Remove shared access for a user from the specified session. Only the session owner or SUPERADMIN can use this endpoint.",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" }, description: "Session ID (slug or CUID)", example: "marketing-1" }
                        ],
                        requestBody: {
                            required: true,
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["userId"],
                                        properties: {
                                            userId: { type: "string", description: "CUID of the user to revoke access from", example: "clx456ghi" }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Acesso revogado com sucesso",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/Success" }
                                    }
                                }
                            },
                            400: { description: "Validation error" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { description: "Forbidden - Only session owner can manage access" },
                            404: { description: "Session or access record not found" }
                        }
                    }
                },

                // ==================== MESSAGING ====================

                "/messages/{sessionId}/{jid}/send": {
                    post: {
                        tags: ["Mensagens"],
                        summary: "Send message (text/media/sticker)",
                        description: "Universal endpoint for sending text, images, videos, documents, and stickers. Supports mentions and all WhatsApp message types.",
                        parameters: [
                            {
                                name: "sessionId",
                                in: "path",
                                required: true,
                                schema: { type: "string" },
                                description: "Session identifier",
                                example: "sales-01"
                            },
                            {
                                name: "jid",
                                in: "path",
                                required: true,
                                schema: { type: "string" },
                                description: "JID do destinatário",
                                example: "628123456789@s.whatsapp.net"
                            }
                        ],
                        requestBody: {
                            required: true,
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["message"],
                                        properties: {
                                            message: {
                                                type: "object",
                                                description: "Message content (text, image, sticker, etc.)",
                                                oneOf: [
                                                    {
                                                        properties: {
                                                            text: { type: "string", example: "Olá!" }
                                                        }
                                                    },
                                                    {
                                                        properties: {
                                                            image: {
                                                                type: "object",
                                                                properties: {
                                                                    url: { type: "string", example: "https://example.com/image.jpg" }
                                                                }
                                                            },
                                                            caption: { type: "string", example: "Check this out" }
                                                        }
                                                    },
                                                    {
                                                        properties: {
                                                            sticker: {
                                                                oneOf: [
                                                                    { type: "string", description: "URL to sticker image" },
                                                                    {
                                                                        type: "object",
                                                                        properties: {
                                                                            url: { type: "string" },
                                                                            pack: { type: "string" },
                                                                            author: { type: "string" }
                                                                        }
                                                                    }
                                                                ]
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            mentions: {
                                                type: "array",
                                                items: { type: "string" },
                                                example: ["628123456789@s.whatsapp.net"],
                                                description: "List of JIDs to mention (for group messages)"
                                            }
                                        }
                                    },
                                    examples: {
                                        text: {
                                            summary: "Text message",
                                            value: {
                                                jid: "628123456789@s.whatsapp.net",
                                                message: { text: "Hello, how can I help you?" }
                                            }
                                        },
                                        image: {
                                            summary: "Image with caption",
                                            value: {
                                                jid: "628123456789@s.whatsapp.net",
                                                message: {
                                                    image: { url: "https://example.com/product.jpg" },
                                                    caption: "New product available!"
                                                }
                                            }
                                        },
                                        sticker: {
                                            summary: "Sticker from URL",
                                            value: {
                                                jid: "628123456789@s.whatsapp.net",
                                                message: {
                                                    sticker: {
                                                        url: "https://example.com/sticker.webp",
                                                        pack: "My Stickers",
                                                        author: "WA-AKG"
                                                    }
                                                }
                                            }
                                        },
                                        withMention: {
                                            summary: "Message with Mention",
                                            value: {
                                                jid: "120363123456789@g.us",
                                                message: { text: "Hello @628123456789, welcome!" },
                                                mentions: ["628123456789@s.whatsapp.net"]
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Mensagem enviada",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/Success" },
                                        example: {
                                            status: true,
                                            message: "Mensagem enviada",
                                            data: {
                                                key: {
                                                    remoteJid: "628123456789@s.whatsapp.net",
                                                    fromMe: true,
                                                    id: "3EB01234567890"
                                                },
                                                message: {
                                                    conversation: "Hello from WA-AKG!"
                                                },
                                                messageTimestamp: "1678901234"
                                            }
                                        }
                                    }
                                }
                            },
                            400: { description: "Invalid request - jid and message are required" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            404: { description: "Session not found or disconnected" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Não foi possível enviar mensagem" }
                        }
                    }
                },

                "/messages/{sessionId}/{jid}/media": {
                    post: {
                        tags: ["Mensagens"],
                        summary: "Send media (image/video/audio/document)",
                        description: "Send file using multipart/form-data",
                        parameters: [
                            {
                                name: "sessionId",
                                in: "path",
                                required: true,
                                schema: { type: "string" },
                                description: "Session identifier"
                            },
                            {
                                name: "jid",
                                in: "path",
                                required: true,
                                schema: { type: "string" },
                                description: "JID do destinatário"
                            }
                        ],
                        requestBody: {
                            content: {
                                "multipart/form-data": {
                                    schema: {
                                        type: "object",
                                        required: ["file", "type"],
                                        properties: {
                                            file: { type: "string", format: "binary" },
                                            type: {
                                                type: "string",
                                                enum: ["image", "video", "audio", "voice", "document", "sticker"],
                                                default: "image"
                                            },
                                            caption: { type: "string" }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Media sent successfully",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/Success" }
                                    }
                                }
                            },
                            400: { description: "Bad Request - File missing" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Não foi possível enviar mídia" }
                        }
                    }
                },


                "/messages/{sessionId}/broadcast": {
                    post: {
                        tags: ["Mensagens"],
                        summary: "Broadcast message to multiple recipients",
                        description: "Send same message to multiple contacts with anti-ban delays (10-20s random)",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["recipients", "message"],
                                        properties: {
                                            recipients: {
                                                type: "array",
                                                items: { type: "string" },
                                                example: ["628123456789@s.whatsapp.net", "628987654321@s.whatsapp.net"]
                                            },
                                            message: { type: "string", example: "Flash Sale! 50% off" },
                                            delay: { type: "number", description: "Optional delay (unused)" }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Broadcast started",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean", example: true },
                                                message: { type: "string", example: "Broadcast started in background" }
                                            }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Não foi possível iniciar o disparo" }
                        }
                    }
                },

                "/messages/{sessionId}/broadcast/history": {
                    get: {
                        tags: ["Mensagens"],
                        summary: "Get broadcast history",
                        description: "Retrieve list of past broadcasts with status, sent/failed counts (persisted in DB)",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "limit", in: "query", schema: { type: "integer", default: 20 }, description: "Max results (max 50)" },
                            { name: "offset", in: "query", schema: { type: "integer", default: 0 }, description: "Pagination offset" }
                        ],
                        responses: {
                            200: {
                                description: "Broadcast history",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                status: { type: "boolean", example: true },
                                                data: {
                                                    type: "array",
                                                    items: { $ref: "#/components/schemas/BroadcastLog" }
                                                },
                                                total: { type: "integer" },
                                                limit: { type: "integer" },
                                                offset: { type: "integer" }
                                            }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" }
                        }
                    }
                },

                "/messages/{sessionId}/broadcast/history/{logId}": {
                    get: {
                        tags: ["Mensagens"],
                        summary: "Get broadcast detail",
                        description: "Retrieve full detail of a specific broadcast including per-recipient status",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "logId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: {
                                description: "Broadcast detail",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                status: { type: "boolean", example: true },
                                                data: {
                                                    type: "object",
                                                    properties: {
                                                        id: { type: "string" },
                                                        sessionId: { type: "string" },
                                                        message: { type: "string" },
                                                        total: { type: "integer" },
                                                        sent: { type: "integer" },
                                                        failed: { type: "integer" },
                                                        status: { type: "string" },
                                                        delay: { type: "integer" },
                                                        startedAt: { type: "string", format: "date-time" },
                                                        completedAt: { type: "string", format: "date-time", nullable: true },
                                                        recipients: {
                                                            type: "array",
                                                            items: { $ref: "#/components/schemas/BroadcastRecipient" }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            404: { description: "Broadcast not found" }
                        }
                    }
                },

                "/messages/{sessionId}/{jid}/poll": {
                    post: {
                        tags: ["Mensagens"],
                        summary: "Send poll message",
                        description: "Create interactive poll (2-12 options, single or multiple choice)",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["question", "options"],
                                        properties: {
                                            question: { type: "string", example: "What's your favorite product?" },
                                            options: {
                                                type: "array",
                                                items: { type: "string" },
                                                minItems: 2,
                                                maxItems: 12,
                                                example: ["Product A", "Product B", "Product C"]
                                            },
                                            selectableCount: { type: "integer", minimum: 1, example: 1 }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: { description: "Poll sent", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true } } } } } },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Failed to send poll" }
                        }
                    }
                },

                "/messages/{sessionId}/{jid}/location": {
                    post: {
                        tags: ["Mensagens"],
                        summary: "Enviar localização",
                        description: "Share GPS coordinates with optional name and address",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["latitude", "longitude"],
                                        properties: {
                                            latitude: { type: "number", minimum: -90, maximum: 90, example: -6.2088 },
                                            longitude: { type: "number", minimum: -180, maximum: 180, example: 106.8456 },
                                            name: { type: "string", example: "Central Park" },
                                            address: { type: "string", example: "Jakarta, Indonesia" }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: { description: "Location sent", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true } } } } } },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Failed to send location" }
                        }
                    }
                },

                "/messages/{sessionId}/{jid}/contact": {
                    post: {
                        tags: ["Mensagens"],
                        summary: "Send contact card",
                        description: "Share one or multiple contact vCards",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["contacts"],
                                        properties: {
                                            contacts: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    required: ["displayName", "vcard"],
                                                    properties: {
                                                        displayName: { type: "string", example: "João da Silva" },
                                                        vcard: { type: "string", example: "BEGIN:VCARD..." }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: { description: "Contact sent", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true } } } } } },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Failed to send contact" }
                        }
                    }
                },

                "/messages/{sessionId}/download/{messageId}/media": {
                    get: {
                        tags: ["Mensagens"],
                        summary: "Download message media",
                        description: "Download media from a message (direct binary or redirect)",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "messageId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: {
                                description: "Binary media file",
                                content: {
                                    "*/*": { schema: { type: "string", format: "binary" } }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { description: "Forbidden - Cannot access session or message" },
                            404: { description: "Message not found or has no media" }
                        }
                    }
                },

                "/messages/{sessionId}/{jid}/{messageId}/react": {
                    post: {
                        tags: ["Mensagens"],
                        summary: "React to message with emoji",
                        description: "Add emoji reaction to a message (empty string removes reaction)",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" } },
                            { name: "messageId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["emoji"],
                                        properties: {
                                            emoji: { type: "string", example: "👍", description: "Emoji or empty string to remove" }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: { description: "Reaction sent", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, message: { type: "string" } } } } } },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Failed to send reaction" }
                        }
                    }
                },

                "/messages/{sessionId}/{jid}/{messageId}/reply": {
                    post: {
                        tags: ["Mensagens"],
                        summary: "Reply to a message (quoted reply)",
                        description: "Send a quoted reply to a specific message by its ID. Uses same request format as /send — pass a Baileys message object.",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" }, example: "sales-01" },
                            { name: "jid", in: "path", required: true, schema: { type: "string" }, example: "628123456789@s.whatsapp.net" },
                            { name: "messageId", in: "path", required: true, schema: { type: "string" }, description: "ID of message to reply to", example: "3EB0ABCD1234567890" }
                        ],
                        requestBody: {
                            required: true,
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["message"],
                                        properties: {
                                            message: {
                                                type: "object",
                                                description: "Message content — same format as /send (text, image, video, etc.)",
                                                example: { text: "Thanks for your message!" }
                                            },
                                            mentions: { type: "array", items: { type: "string" }, example: ["628123456789@s.whatsapp.net"], description: "JIDs to mention" },
                                            fromMe: { type: "boolean", default: false, description: "Whether the quoted message was sent by you" }
                                        }
                                    },
                                    examples: {
                                        textReply: {
                                            summary: "Text reply",
                                            value: { message: { text: "Got it, thanks!" } }
                                        },
                                        imageReply: {
                                            summary: "Image reply",
                                            value: { message: { image: { url: "https://example.com/confirm.jpg" }, caption: "Confirmation image" } }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Reply sent successfully",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean", example: true },
                                                message: { type: "string", example: "Mensagem enviada" }
                                            }
                                        }
                                    }
                                }
                            },
                            400: { description: "Informe a mensagem" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Failed to send reply" }
                        }
                    }
                },

                "/messages/{sessionId}/{jid}/reply": {
                    post: {
                        tags: ["Mensagens"],
                        summary: "Reply to a message (body-based)",
                        description: "Send a quoted reply with messageId provided in the request body. Same request format as /send with added messageId.",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" }, example: "sales-01" },
                            { name: "jid", in: "path", required: true, schema: { type: "string" }, example: "628123456789@s.whatsapp.net" }
                        ],
                        requestBody: {
                            required: true,
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["messageId", "message"],
                                        properties: {
                                            messageId: { type: "string", example: "3EB0ABCD1234567890", description: "ID of the message to reply to" },
                                            message: {
                                                type: "object",
                                                description: "Message content — same format as /send (text, image, video, etc.)",
                                                example: { text: "Sure, let me help you!" }
                                            },
                                            mentions: { type: "array", items: { type: "string" }, description: "JIDs to mention" },
                                            fromMe: { type: "boolean", default: false, description: "Whether the quoted message was sent by you" }
                                        }
                                    },
                                    example: {
                                        messageId: "3EB0ABCD1234567890",
                                        message: { text: "Sure, let me check that for you!" }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Reply sent successfully",
                                content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } }
                            },
                            400: { description: "messageId and message required" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Failed to send reply" }
                        }
                    }
                },

                "/messages/{sessionId}/{jid}/{messageId}/star": {
                    post: {
                        tags: ["Mensagens"],
                        summary: "Star or unstar a message",
                        description: "Mark a message as starred (saved) or remove the star. Starred messages appear in the Starred Messages section.",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" } },
                            { name: "messageId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            star: { type: "boolean", example: true, default: true, description: "true to star, false to unstar" },
                                            fromMe: { type: "boolean", example: false, default: false, description: "Whether the message was sent by you" }
                                        }
                                    },
                                    examples: {
                                        star: { summary: "Favoritar mensagem", value: { star: true } },
                                        unstar: { summary: "Unstar message", value: { star: false } }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Star status updated",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean", example: true },
                                                message: { type: "string", example: "Message starred" }
                                            }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Failed to star/unstar message" }
                        }
                    }
                },

                "/messages/{sessionId}/search": {
                    get: {
                        tags: ["Mensagens"],
                        summary: "Buscar mensagens",
                        description: "Search messages stored in the database for a session. Supports full-text search, filtering by JID, type, and sender.",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" }, example: "sales-01" },
                            { name: "q", in: "query", schema: { type: "string" }, example: "invoice", description: "Text to search for in message content" },
                            { name: "jid", in: "query", schema: { type: "string" }, example: "628123456789@s.whatsapp.net", description: "Filter by chat JID" },
                            { name: "type", in: "query", schema: { type: "string", enum: ["TEXT", "IMAGE", "VIDEO", "AUDIO", "DOCUMENT", "STICKER", "LOCATION", "CONTACT"] }, description: "Filter by message type" },
                            { name: "fromMe", in: "query", schema: { type: "boolean" }, description: "Filter by sender (true=outgoing, false=incoming)" },
                            { name: "page", in: "query", schema: { type: "integer", default: 1, minimum: 1 } },
                            { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } }
                        ],
                        responses: {
                            200: {
                                description: "Search results",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean", example: true },
                                                data: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            id: { type: "string" },
                                                            remoteJid: { type: "string" },
                                                            fromMe: { type: "boolean" },
                                                            keyId: { type: "string" },
                                                            pushName: { type: "string" },
                                                            type: { type: "string" },
                                                            content: { type: "string" },
                                                            status: { type: "string" },
                                                            timestamp: { type: "string", format: "date-time" },
                                                            quoteId: { type: "string", nullable: true }
                                                        }
                                                    }
                                                },
                                                pagination: {
                                                    type: "object",
                                                    properties: {
                                                        total: { type: "integer" },
                                                        page: { type: "integer" },
                                                        limit: { type: "integer" },
                                                        pages: { type: "integer" }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            400: { description: "q or jid is required" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            404: { description: "Sessão não encontrada" },
                            500: { description: "Failed to search messages" }
                        }
                    }
                },

                "/messages/{sessionId}/{jid}/list": {
                    post: {
                        tags: ["Mensagens"],
                        summary: "Send list message",
                        description: "Send a formatted numbered list message",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["title", "options"],
                                        properties: {
                                            title: { type: "string", example: "Our Services" },
                                            options: { type: "array", items: { type: "string" }, example: ["Web Dev", "App Dev", "UI/UX"] },
                                            footer: { type: "string", example: "Choose one" }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: { description: "Message sent", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true } } } } } },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Não foi possível enviar mensagem" }
                        }
                    }
                },

                "/messages/{sessionId}/{jid}/spam": {
                    post: {
                        tags: ["Mensagens"],
                        summary: "Message bombing (Spam)",
                        description: "Send a message multiple times in a row in the background",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["message"],
                                        properties: {
                                            message: { type: "string", example: "Check our new catalog!" },
                                            count: { type: "integer", default: 10, example: 5 },
                                            delay: { type: "integer", default: 500, example: 1000, description: "Delay in ms" }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: { description: "Spam started", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, message: { type: "string" } } } } } },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Failed to start spam" }
                        }
                    }
                },

                "/messages/{sessionId}/{jid}/sticker": {
                    post: {
                        tags: ["Mensagens"],
                        summary: "Enviar figurinha",
                        description: "Convert an image to sticker and send it",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "multipart/form-data": {
                                    schema: {
                                        type: "object",
                                        required: ["file"],
                                        properties: {
                                            file: { type: "string", format: "binary" },
                                            pack: { type: "string", description: "Sticker pack name (default: WA-AKG)" },
                                            author: { type: "string", description: "Sticker author name (default: User)" },
                                            type: { type: "string", enum: ["full", "crop", "circle"], description: "Sticker crop type (default: full)" },
                                            quality: { type: "integer", minimum: 1, maximum: 100, description: "Image quality (default: 50)" }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: { description: "Sticker sent", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true } } } } } },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Não foi possível criar figurinha" }
                        }
                    }
                },

                "/messages/{sessionId}/forward": {
                    post: {
                        tags: ["Mensagens"],
                        summary: "Encaminhar mensagem",
                        description: "Forward a message to one or multiple chats",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["fromJid", "messageId", "toJids"],
                                        properties: {
                                            fromJid: { type: "string", description: "Source chat JID", example: "628123456789@s.whatsapp.net" },
                                            messageId: { type: "string", example: "3EB0ABCD1234567890" },
                                            toJids: {
                                                type: "array",
                                                items: { type: "string" },
                                                description: "Recipient JIDs",
                                                example: ["628987654321@s.whatsapp.net"]
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: { description: "Message forwarded", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, message: { type: "string" } } } } } },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Failed to forward message" }
                        }
                    }
                },
                "/messages/{sessionId}/{jid}/{messageId}": {
                    delete: {
                        tags: ["Mensagens"],
                        summary: "Delete message for everyone",
                        description: "Delete message (only works for messages < 7 minutes old)",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" } },
                            { name: "messageId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: {
                                description: "Message deleted",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean", example: true },
                                                message: { type: "string", example: "Message deleted for everyone" }
                                            }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Não foi possível excluir mensagem" }
                        }
                    },
                    patch: {
                        tags: ["Mensagens"],
                        summary: "Edit a sent message",
                        description: "Edit text of a sent message",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" } },
                            { name: "messageId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            required: true,
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["text"],
                                        properties: {
                                            text: { type: "string", example: "Updated text message" }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Message edited",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                status: { type: "boolean", example: true },
                                                message: { type: "string", example: "Message edited successfully" }
                                            }
                                        }
                                    }
                                }
                            },
                            400: { description: "Bad Request" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Failed to edit message" }
                        }
                    }
                },

                // ==================== CHAT MANAGEMENT ====================
                "/chat/{sessionId}": {
                    get: {
                        tags: ["Conversas"],
                        summary: "Get chat list with contacts",
                        description: "Retrieve all contacts with last message for a session",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: {
                                description: "Chat list",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "array",
                                            items: { $ref: "#/components/schemas/Contact" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },

                "/chat/{sessionId}/{jid}": {
                    get: {
                        tags: ["Conversas"],
                        summary: "Get message history",
                        description: "Fetch up to 100 messages for a chat (enriched with participant info for groups)",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" }, description: "URL-encoded JID" }
                        ],
                        responses: { 200: { description: "Message history (max 100 messages)" } }
                    }
                },

                "/chat/{sessionId}/{jid}/read": {
                    put: {
                        tags: ["Conversas"],
                        summary: "Mark messages as read",
                        description: "Mark specific messages or entire chat as read using RESTful path parameters",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" }, description: "Session identifier" },
                            { name: "jid", in: "path", required: true, schema: { type: "string" }, description: "URL-encoded WhatsApp JID" }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            messageIds: {
                                                type: "array",
                                                items: { type: "string" },
                                                description: "Optional: specific message IDs to mark as read. If not provided, marks entire chat as read"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Messages marked as read",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean", example: true },
                                                message: { type: "string", example: "Messages marked as read" }
                                            }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Failed to mark messages as read" }
                        }
                    }
                },

                "/chat/{sessionId}/{jid}/archive": {
                    put: {
                        tags: ["Conversas"],
                        summary: "Archive/unarchive chat",
                        description: "Archive or unarchive a chat using RESTful path parameters",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" }, description: "URL-encoded JID" }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["archive"],
                                        properties: {
                                            archive: { type: "boolean", description: "true to archive, false to unarchive" }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Chat archived/unarchived",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean", example: true },
                                                message: { type: "string", example: "Chat archived" }
                                            }
                                        }
                                    }
                                }
                            },
                            400: { description: "Preencha os campos obrigatórios" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Failed to archive/unarchive chat" }
                        }
                    }
                },

                "/chat/{sessionId}/{jid}/mute": {
                    put: {
                        tags: ["Conversas"],
                        summary: "Mute/unmute chat",
                        description: "Mute chat with optional duration (default 8 hours)",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" }, description: "URL-encoded JID" }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["mute"],
                                        properties: {
                                            mute: { type: "boolean" },
                                            duration: { type: "integer", description: "Duration in seconds (default: 8 hours)", example: 3600 }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Chat muted/unmuted",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean", example: true },
                                                message: { type: "string", example: "Chat muted" }
                                            }
                                        }
                                    }
                                }
                            },
                            400: { description: "Preencha os campos obrigatórios" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Failed to mute/unmute chat" }
                        }
                    }
                },

                "/chat/{sessionId}/{jid}/pin": {
                    put: {
                        tags: ["Conversas"],
                        summary: "Pin/unpin chat",
                        description: "Pin or unpin a chat",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" }, description: "URL-encoded JID" }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["pin"],
                                        properties: {
                                            pin: { type: "boolean" }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Chat pinned/unpinned",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean", example: true },
                                                message: { type: "string", example: "Chat pinned" }
                                            }
                                        }
                                    }
                                }
                            },
                            400: { description: "Preencha os campos obrigatórios" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Failed to pin/unpin chat" }
                        }
                    }
                },

                "/chat/{sessionId}/{jid}/presence": {
                    post: {
                        tags: ["Conversas"],
                        summary: "Send presence (typing/recording)",
                        description: "Send presence status (typing, recording, online, etc.) to a chat",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" }, description: "URL-encoded JID" }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["presence"],
                                        properties: {
                                            presence: {
                                                type: "string",
                                                enum: ["composing", "recording", "paused", "available", "unavailable"],
                                                example: "composing"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Presence sent",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean", example: true },
                                                message: { type: "string", example: "Presence 'composing' sent to 628123456789@s.whatsapp.net" }
                                            }
                                        }
                                    }
                                }
                            },
                            400: { description: "Missing required fields or invalid presence" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Failed to send presence" }
                        }
                    }
                },

                "/chat/{sessionId}/{jid}/profile-picture": {
                    post: {
                        tags: ["Conversas"],
                        summary: "Get profile picture URL",
                        description: "Get profile picture URL for a contact or group",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" }, description: "URL-encoded JID" }
                        ],
                        responses: {
                            200: {
                                description: "Profile picture URL",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean", example: true },
                                                jid: { type: "string", example: "628123456789@s.whatsapp.net" },
                                                profilePicUrl: { type: "string", nullable: true, example: "https://pps.whatsapp.net/..." },
                                                message: { type: "string", example: "No profile picture found" }
                                            }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Failed to fetch profile picture" }
                        }
                    }
                },

                "/chat/{sessionId}/check": {
                    post: {
                        tags: ["Conversas"],
                        summary: "Check if numbers exist on WhatsApp",
                        description: "Validate phone numbers (max 50 per request)",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["numbers"],
                                        properties: {
                                            numbers: {
                                                type: "array",
                                                items: { type: "string" },
                                                maxItems: 50,
                                                example: ["628123456789", "628987654321"]
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Validation results",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean" },
                                                results: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            number: { type: "string" },
                                                            exists: { type: "boolean" },
                                                            jid: { type: "string", nullable: true },
                                                            error: { type: "string", nullable: true }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            400: { description: "Preencha os campos obrigatórios" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Failed to check numbers" }
                        }
                    }
                },

                // ==================== GROUPS ====================
                "/groups/{sessionId}": {
                    get: {
                        tags: ["Grupos"],
                        summary: "List all groups",
                        description: "Get all groups associated with the session",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: { description: "List of groups", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Group" } } } } },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            404: { $ref: "#/components/responses/NotFound" },
                            500: { description: "Não foi possível carregar grupos" }
                        }
                    }
                },

                "/groups/{sessionId}/create": {
                    post: {
                        tags: ["Grupos"],
                        summary: "Create new group",
                        description: "Create a new group with specified participants",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["subject", "participants"],
                                        properties: {
                                            subject: { type: "string", maxLength: 100, example: "VIP Customers" },
                                            participants: {
                                                type: "array",
                                                items: { type: "string" },
                                                example: ["628123456789@s.whatsapp.net"]
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: { description: "Grupo criado", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, group: { $ref: "#/components/schemas/Group" } } } } } },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Failed to create group" }
                        }
                    }
                },

                "/groups/{sessionId}/{jid}/subject": {
                    put: {
                        tags: ["Grupos"],
                        summary: "Update group subject",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["subject"],
                                        properties: {
                                            subject: { type: "string", maxLength: 100 }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: { description: "Subject updated", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, message: { type: "string" }, subject: { type: "string" } } } } } },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            400: { description: "Invalid subject" },
                            500: { description: "Failed to update subject" }
                        }
                    }
                },
                "/groups/{jid}/subject": {
                    put: {
                        tags: ["Grupos"],
                        summary: "Update group name",
                        description: "Update group subject (max 100 characters, requires admin)",
                        parameters: [
                            { name: "jid", in: "path", required: true, schema: { type: "string" }, description: "URL-encoded group JID" }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["sessionId", "subject"],
                                        properties: {
                                            sessionId: { type: "string" },
                                            subject: { type: "string", maxLength: 100 }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Subject updated",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean", example: true },
                                                message: { type: "string", example: "Group subject updated successfully" },
                                                subject: { type: "string", example: "New Subject" }
                                            }
                                        }
                                    }
                                }
                            },
                            400: { description: "Invalid request (missing fields or subject too long)" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Failed to update group subject" }
                        }
                    }
                },

                "/groups/{sessionId}/{jid}/members": {
                    put: {
                        tags: ["Grupos"],
                        summary: "Manage group members",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["action", "participants"],
                                        properties: {
                                            action: { type: "string", enum: ["add", "remove", "promote", "demote"] },
                                            participants: { type: "array", items: { type: "string" } }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: { description: "Members updated", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, message: { type: "string" }, result: { type: "array", items: { type: "object" } } } } } } },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            400: { description: "Invalid action" },
                            500: { description: "Failed to update members" }
                        }
                    }
                },

                "/groups/{sessionId}/{jid}/invite": {
                    "put": {
                        "tags": [
                            "Grupos"
                        ],
                        "summary": "Update or revoke group invite link",
                        "parameters": [
                            {
                                "name": "sessionId",
                                "in": "path",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "name": "jid",
                                "in": "path",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "Group invite updated"
                            }
                        }
                    }
                    ,
                    get: {
                        tags: ["Grupos"],
                        summary: "Consultar convite",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: { description: "Invite code", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, inviteCode: { type: "string" }, inviteUrl: { type: "string" } } } } } },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            500: { description: "Failed to get code" }
                        }
                    },
                    put: {
                        tags: ["Grupos"],
                        summary: "Revoke invite code",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: { description: "Invite revoked", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, message: { type: "string" }, newInviteCode: { type: "string" }, inviteUrl: { type: "string" } } } } } },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            500: { description: "Failed to revoke code" }
                        }
                    }
                },



                // ==================== CONTACTS ====================

                // ==================== PROFILE ====================
                "/profile/{sessionId}": {
                    get: {
                        tags: ["Profile"],
                        summary: "Get own profile",
                        description: "Fetch profile information of the connected WhatsApp account",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: {
                                description: "Profile info",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean" },
                                                jid: { type: "string" },
                                                status: { type: "object" }
                                            }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" }
                        }
                    }
                },
                "/profile/{sessionId}/name": {
                    put: {
                        tags: ["Profile"],
                        summary: "Update profile name",
                        description: "Update the WhatsApp display name (max 25 chars)",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["name"],
                                        properties: {
                                            name: { type: "string", maxLength: 25 }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: { description: "Name updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" }
                        }
                    }
                },
                "/profile/{sessionId}/status": {
                    put: {
                        tags: ["Profile"],
                        summary: "Update profile status",
                        description: "Update the WhatsApp about/status (max 139 chars)",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["status"],
                                        properties: {
                                            status: { type: "string", maxLength: 139 }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: { description: "Status updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" }
                        }
                    }
                },
                "/profile/{sessionId}/picture": {
                    "delete": {
                        "tags": [
                            "Profile"
                        ],
                        "summary": "Remove profile picture",
                        "parameters": [
                            {
                                "name": "sessionId",
                                "in": "path",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "Foto do perfil removida"
                            }
                        }
                    }
                    ,
                    put: {
                        tags: ["Profile"],
                        summary: "Update profile picture",
                        description: "Upload a new profile picture",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "multipart/form-data": {
                                    schema: {
                                        type: "object",
                                        required: ["file"],
                                        properties: {
                                            file: { type: "string", format: "binary" }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: { description: "Picture updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" }
                        }
                    },
                    delete: {
                        tags: ["Profile"],
                        summary: "Remove profile picture",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: { description: "Picture removed", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" }
                        }
                    }
                },

                // ==================== AUTO REPLY ====================
                "/autoreplies/{sessionId}": {
                    "delete": {
                        "tags": [
                            "Auto Replies"
                        ],
                        "summary": "Delete all autoreplies",
                        "parameters": [
                            {
                                "name": "sessionId",
                                "in": "path",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "Autoreplies deleted"
                            }
                        }
                    }
                    ,
                    get: {
                        tags: ["Resposta automática"],
                        summary: "List auto-reply rules",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: { description: "List of auto-reply rules" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            404: { description: "Sessão não encontrada" }
                        }
                    },
                    post: {
                        tags: ["Resposta automática"],
                        summary: "Create auto-reply rule",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["keyword"],
                                        properties: {
                                            keyword: { type: "string" },
                                            response: { type: "string" },
                                            matchType: { type: "string", enum: ["EXACT", "CONTAINS", "STARTS_WITH", "REGEX"] },
                                            isMedia: { type: "boolean" },
                                            mediaUrl: { type: "string" },
                                            mediaType: { type: "string", enum: ["image", "video", "document", "audio"] },
                                            triggerType: { type: "string", enum: ["ALL", "GROUP", "PRIVATE"] }
                                        }
                                    },
                                    example: {
                                        keyword: "hello",
                                        response: "Hi there! How can I help?",
                                        matchType: "EXACT",
                                        triggerType: "ALL",
                                        isMedia: false,
                                        mediaUrl: null,
                                        mediaType: null
                                    }
                                }
                            }
                        },
                        responses: {
                            200: { description: "Rule created" },
                            400: { description: "Preencha os campos obrigatórios" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" }
                        }
                    }
                },
                "/autoreplies/{sessionId}/{replyId}": {
                    "delete": {
                        "tags": [
                            "Auto Replies"
                        ],
                        "summary": "Delete a specific autoreply",
                        "parameters": [
                            {
                                "name": "sessionId",
                                "in": "path",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "name": "replyId",
                                "in": "path",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "Autoreply deleted"
                            }
                        }
                    }
                    ,
                    put: {
                        tags: ["Resposta automática"],
                        summary: "Update auto-reply rule",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "replyId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["keyword"],
                                        properties: {
                                            keyword: { type: "string" },
                                            response: { type: "string" },
                                            isMedia: { type: "boolean" },
                                            mediaUrl: { type: "string" },
                                            mediaType: { type: "string", enum: ["image", "video", "document", "audio"] },
                                            triggerType: { type: "string", enum: ["ALL", "GROUP", "PRIVATE"] }
                                        }
                                    },
                                    example: {
                                        keyword: "hello",
                                        response: "Hi there! How can I help?",
                                        matchType: "EXACT",
                                        triggerType: "ALL",
                                        isMedia: false,
                                        mediaUrl: null,
                                        mediaType: null
                                    }
                                }
                            }
                        },
                        responses: {
                            200: { description: "Rule updated" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            404: { description: "Regra não encontrada" }
                        }
                    },
                    delete: {
                        tags: ["Resposta automática"],
                        summary: "Delete auto-reply rule",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "replyId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: { description: "Rule deleted" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            404: { description: "Regra não encontrada" }
                        }
                    }
                },

                // ==================== SCHEDULER ====================
                "/scheduler/{sessionId}": {
                    "delete": {
                        "tags": [
                            "Agendamentos"
                        ],
                        "summary": "Delete all scheduled messages for a session",
                        "parameters": [
                            {
                                "name": "sessionId",
                                "in": "path",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "Scheduled messages deleted"
                            }
                        }
                    }
                    ,
                    get: {
                        tags: ["Agendamentos"],
                        summary: "List scheduled messages",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: { description: "List of scheduled messages" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            404: { description: "Sessão não encontrada" }
                        }
                    },
                    post: {
                        tags: ["Agendamentos"],
                        summary: "Create scheduled message",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["jid", "sendAt"],
                                        properties: {
                                            jid: { type: "string" },
                                            content: { type: "string" },
                                            sendAt: { type: "string", format: "date-time" },
                                            mediaUrl: { type: "string" },
                                            mediaType: { type: "string", enum: ["image", "video", "document", "audio"] },
                                            cronExpression: { type: "string" },
                                            recurrenceRule: { type: "string" }
                                        }
                                    },
                                    example: {
                                        jid: "628123456789@s.whatsapp.net",
                                        content: "Reminder: Meeting in 10 mins",
                                        sendAt: "2024-12-25T10:00:00.000Z",
                                        mediaUrl: "https://example.com/image.jpg",
                                        mediaType: "image",
                                        cronExpression: "*/10 * * * *",
                                        recurrenceRule: "{\"type\":\"minutes\",\"value\":10}"
                                    }
                                }
                            }
                        },
                        responses: {
                            200: { description: "Scheduled message created" },
                            400: { description: "Preencha os campos obrigatórios" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" }
                        }
                    }
                },
                "/scheduler/{sessionId}/{scheduleId}": {
                    "delete": {
                        "tags": [
                            "Agendamentos"
                        ],
                        "summary": "Delete a specific scheduled message",
                        "parameters": [
                            {
                                "name": "sessionId",
                                "in": "path",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "name": "scheduleId",
                                "in": "path",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "Scheduled message deleted"
                            }
                        }
                    }
                    ,
                    put: {
                        tags: ["Agendamentos"],
                        summary: "Update scheduled message",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "scheduleId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["jid", "sendAt"],
                                        properties: {
                                            jid: { type: "string" },
                                            content: { type: "string" },
                                            sendAt: { type: "string", format: "date-time" },
                                            mediaUrl: { type: "string" },
                                            mediaType: { type: "string", enum: ["image", "video", "document", "audio"] },
                                            cronExpression: { type: "string" },
                                            recurrenceRule: { type: "string" }
                                        }
                                    },
                                    example: {
                                        jid: "628123456789@s.whatsapp.net",
                                        content: "Updated meeting reminder",
                                        sendAt: "2024-12-25T11:00:00.000Z",
                                        mediaUrl: "https://example.com/image.jpg",
                                        mediaType: "image",
                                        cronExpression: null,
                                        recurrenceRule: null
                                    }
                                }
                            }
                        },
                        responses: {
                            200: { description: "Message updated" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            404: { description: "Mensagem não encontrada" }
                        }
                    },
                    delete: {
                        tags: ["Agendamentos"],
                        summary: "Delete scheduled message",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "scheduleId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: { description: "Message deleted" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            404: { description: "Mensagem não encontrada" }
                        }
                    }
                },
                "/scheduler": {
                    "post": {
                        "tags": [
                            "Agendamentos"
                        ],
                        "summary": "Create a scheduled message task",
                        "responses": {
                            "200": {
                                "description": "Scheduled task created"
                            }
                        }
                    }
                },

                // ==================== WEBHOOKS ====================
                "/webhooks/{sessionId}": {
                    get: {
                        tags: ["Webhooks"],
                        summary: "List webhooks for a session",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: { description: "List of webhooks" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" }
                        }
                    },
                    post: {
                        tags: ["Webhooks"],
                        summary: "Create a webhook",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["name", "url", "events"],
                                        properties: {
                                            name: { type: "string" },
                                            url: { type: "string" },
                                            secret: { type: "string" },
                                            events: { type: "array", items: { type: "string" } }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: { description: "Webhook created" },
                            400: { description: "Invalid input" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" }
                        }
                    }
                },
                "/webhooks/{sessionId}/{id}": {
                    "delete": {
                        "tags": [
                            "Webhooks"
                        ],
                        "summary": "Delete a webhook configuration",
                        "parameters": [
                            {
                                "name": "sessionId",
                                "in": "path",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "name": "id",
                                "in": "path",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "Webhook excluído"
                            }
                        }
                    }
                    ,
                    put: {
                        tags: ["Webhooks"],
                        summary: "Atualizar webhook",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "id", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            name: { type: "string" },
                                            url: { type: "string" },
                                            secret: { type: "string" },
                                            events: { type: "array", items: { type: "string" } },
                                            isActive: { type: "boolean" }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: { description: "Webhook updated" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            404: { description: "Webhook not found" }
                        }
                    },
                    delete: {
                        tags: ["Webhooks"],
                        summary: "Excluir webhook",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "id", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: { description: "Webhook excluído" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            404: { description: "Webhook not found" }
                        }
                    }
                },
                "/webhooks/{id}": {
                    delete: {
                        tags: ["Webhooks"],
                        summary: "Excluir webhook",
                        parameters: [
                            { name: "id", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: {
                                description: "Webhook excluído",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean" }
                                            }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            404: { description: "Webhook not found" },
                            500: { $ref: "#/components/responses/ServerError" }
                        }
                    }
                },

                "/webhooks/{sessionId}/{id}/test": {
                    post: {
                        tags: ["Webhooks"],
                        summary: "Test webhook endpoint",
                        description: "Fire a test payload to verify the webhook endpoint is reachable and responding correctly",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "id", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: {
                                description: "Test result",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                status: { type: "boolean" },
                                                message: { type: "string" },
                                                data: {
                                                    type: "object",
                                                    properties: {
                                                        success: { type: "boolean" },
                                                        statusCode: { type: "integer" },
                                                        responseBody: { type: "string" },
                                                        responseTimeMs: { type: "integer" },
                                                        error: { type: "string" }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            404: { description: "Webhook not found" }
                        }
                    }
                },
                "/webhooks/{sessionId}/{id}/logs": {
                    get: {
                        tags: ["Webhooks"],
                        summary: "Get webhook delivery logs",
                        description: "Retrieve delivery history for a specific webhook",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "id", in: "path", required: true, schema: { type: "string" } },
                            { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
                            { name: "offset", in: "query", schema: { type: "integer", default: 0 } }
                        ],
                        responses: {
                            200: {
                                description: "Webhook delivery logs",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                status: { type: "boolean" },
                                                data: {
                                                    type: "array",
                                                    items: { $ref: "#/components/schemas/WebhookLog" }
                                                },
                                                total: { type: "integer" },
                                                limit: { type: "integer" },
                                                offset: { type: "integer" }
                                            }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            404: { description: "Webhook not found" }
                        }
                    }
                },

                // ==================== USERS ====================
                "/users": {
                    "post": {
                        "tags": [
                            "Usuários"
                        ],
                        "summary": "Create user resource",
                        "responses": {
                            "200": {
                                "description": "Usuário criado"
                            }
                        }
                    }
                    ,
                    get: {
                        tags: ["Usuários"],
                        summary: "List users (SUPERADMIN only)",
                        responses: {
                            200: {
                                description: "List of users",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id: { type: "string" },
                                                    name: { type: "string" },
                                                    email: { type: "string" },
                                                    role: { type: "string" },
                                                    createdAt: { type: "string", format: "date-time" },
                                                    _count: {
                                                        type: "object",
                                                        properties: {
                                                            sessions: { type: "integer" }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            500: { $ref: "#/components/responses/ServerError" }
                        }
                    },
                    post: {
                        tags: ["Usuários"],
                        summary: "Create user (SUPERADMIN only)",
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["name", "email", "password"],
                                        properties: {
                                            name: { type: "string", minLength: 2 },
                                            email: { type: "string", format: "email" },
                                            password: { type: "string", minLength: 6 },
                                            role: {
                                                type: "string",
                                                enum: ["SUPERADMIN", "OWNER", "STAFF"],
                                                default: "OWNER"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Usuário criado",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string" },
                                                name: { type: "string" },
                                                email: { type: "string" },
                                                role: { type: "string" },
                                                createdAt: { type: "string", format: "date-time" }
                                            }
                                        }
                                    }
                                }
                            },
                            400: { $ref: "#/components/responses/BadRequest" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            500: { $ref: "#/components/responses/ServerError" }
                        }
                    }
                },

                "/users/{id}": {
                    "delete": {
                        "tags": [
                            "Usuários"
                        ],
                        "summary": "Excluir usuário",
                        "parameters": [
                            {
                                "name": "id",
                                "in": "path",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "Usuário excluído"
                            }
                        }
                    }
                    ,
                    patch: {
                        tags: ["Usuários"],
                        summary: "Update user (SUPERADMIN only)",
                        parameters: [
                            { name: "id", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            name: { type: "string" },
                                            email: { type: "string" },
                                            password: { type: "string" },
                                            role: { type: "string", enum: ["SUPERADMIN", "OWNER", "STAFF"] }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Usuário atualizado",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean" },
                                                user: {
                                                    type: "object",
                                                    properties: {
                                                        id: { type: "string" },
                                                        email: { type: "string" },
                                                        name: { type: "string" },
                                                        role: { type: "string" },
                                                        emailVerified: { type: "string", nullable: true },
                                                        image: { type: "string", nullable: true },
                                                        createdAt: { type: "string", format: "date-time" },
                                                        updatedAt: { type: "string", format: "date-time" }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            400: { $ref: "#/components/responses/BadRequest" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            404: { description: "User not found" },
                            500: { $ref: "#/components/responses/ServerError" }
                        }
                    },
                    delete: {
                        tags: ["Usuários"],
                        summary: "Delete user (SUPERADMIN only)",
                        parameters: [
                            { name: "id", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: {
                                description: "Usuário excluído",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean" },
                                                message: { type: "string" }
                                            }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            404: { description: "User not found" },
                            500: { $ref: "#/components/responses/ServerError" }
                        }
                    }
                },

                "/user/api-key": {
                    "post": {
                        "tags": [
                            "User"
                        ],
                        "summary": "Generate a new API Key",
                        "responses": {
                            "200": {
                                "description": "API Key created"
                            }
                        }
                    },
                    "delete": {
                        "tags": [
                            "User"
                        ],
                        "summary": "Revoke API Key",
                        "responses": {
                            "200": {
                                "description": "API Key revoked"
                            }
                        }
                    }
                    ,
                    get: {
                        tags: ["Usuários"],
                        summary: "Get current API key",
                        responses: {
                            200: {
                                description: "Current API key",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                apiKey: { type: "string", nullable: true }
                                            }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" }
                        }
                    },
                    post: {
                        tags: ["Usuários"],
                        summary: "Generate new API key",
                        responses: {
                            200: {
                                description: "New API key generated",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                apiKey: { type: "string" }
                                            }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            500: { description: "Não foi possível gerar chave da API" }
                        }
                    },
                    delete: {
                        tags: ["Usuários"],
                        summary: "Revoke API key",
                        responses: {
                            200: {
                                description: "API key revoked",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/Success" }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            500: { description: "Não foi possível revogar chave da API" }
                        }
                    }
                },

                "/groups/{sessionId}/{jid}": {
                    get: {
                        tags: ["Grupos"],
                        summary: "Get group details",
                        description: "Get detailed group information",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: {
                                description: "Group details",
                                content: { "application/json": { schema: { $ref: "#/components/schemas/GroupDetails" } } }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            404: { $ref: "#/components/responses/NotFound" },
                            500: { description: "Failed to fetch details" }
                        }
                    }
                },
                "/groups/{jid}/leave": {
                    post: {
                        tags: ["Grupos"],
                        summary: "Sair do grupo",
                        parameters: [
                            { name: "jid", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["sessionId"],
                                        properties: {
                                            sessionId: { type: "string" }
                                        }
                                    }
                                }
                            }
                        },
                        responses: { 200: { description: "Left group" } }
                    }
                },
                // ==================== GROUPS ====================
                "/groups/{sessionId}/invite/accept": {
                    post: {
                        tags: ["Grupos"],
                        summary: "Accept group invite",
                        description: "Join a group using an invite code",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["inviteCode"],
                                        properties: {
                                            inviteCode: { type: "string" }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: { description: "Group invite accepted", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, message: { type: "string" }, groupJid: { type: "string" } } } } } },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            400: { description: "Invalid/Expired code" },
                            503: { $ref: "#/components/responses/SessionNotReady" },
                            500: { description: "Failed to accept invite" }
                        }
                    }
                },
                "/groups/{sessionId}/{jid}/picture": {
                    "delete": {
                        "tags": [
                            "Grupos"
                        ],
                        "summary": "Remove group picture",
                        "parameters": [
                            {
                                "name": "sessionId",
                                "in": "path",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "name": "jid",
                                "in": "path",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "Group picture removed"
                            }
                        }
                    }
                    ,
                    put: {
                        tags: ["Grupos"],
                        summary: "Update group picture",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "multipart/form-data": {
                                    schema: {
                                        type: "object",
                                        required: ["file"],
                                        properties: {
                                            file: { type: "string", format: "binary" }
                                        }
                                    }
                                }
                            }
                        },
                        responses: { 200: { description: "Picture updated" } }
                    },
                    delete: {
                        tags: ["Grupos"],
                        summary: "Remove group picture",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: { 200: { description: "Picture removed" } }
                    }
                },
                "/groups/{sessionId}/{jid}/settings": {
                    put: {
                        tags: ["Grupos"],
                        summary: "Atualizar configurações do grupo",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["setting"],
                                        properties: {
                                            setting: {
                                                type: "string",
                                                enum: ["announcement", "not_announcement", "locked", "unlocked"],
                                                description: "announcement (admins only send), not_announcement (all send), locked (admins only edit), unlocked (all edit)"
                                            },
                                            value: { type: "boolean", description: "Ignored but required" }
                                        }
                                    }
                                }
                            }
                        },
                        responses: { 200: { description: "Settings updated" } }
                    }
                },
                "/groups/{sessionId}/{jid}/description": {
                    put: {
                        tags: ["Grupos"],
                        summary: "Update group description",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            description: { type: "string", maxLength: 512 }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: { description: "Description updated", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, description: { type: "string" } } } } } },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            400: { description: "Invalid input" },
                            500: { description: "Failed to update" }
                        }
                    }
                },
                "/groups/{sessionId}/{jid}/ephemeral": {
                    put: {
                        tags: ["Grupos"],
                        summary: "Toggle disappearing messages",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["expiration"],
                                        properties: {
                                            expiration: { type: "integer", enum: [0, 86400, 604800, 7776000] }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: { description: "Ephemeral toggled", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, expiration: { type: "integer" } } } } } },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            400: { description: "Invalid expiration" },
                            500: { description: "Failed to toggle" }
                        }
                    }
                },
                // ==================== LABELS ====================
                "/labels/{sessionId}": {
                    "post": {
                        "tags": [
                            "Etiquetas"
                        ],
                        "summary": "Create a label",
                        "parameters": [
                            {
                                "name": "sessionId",
                                "in": "path",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "required": [
                                            "name"
                                        ],
                                        "properties": {
                                            "name": {
                                                "type": "string"
                                            },
                                            "color": {
                                                "type": "integer"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "responses": {
                            "200": {
                                "description": "Label created"
                            }
                        }
                    },
                    "put": {
                        "tags": [
                            "Etiquetas"
                        ],
                        "summary": "Update all labels or bulk update",
                        "parameters": [
                            {
                                "name": "sessionId",
                                "in": "path",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "Labels updated"
                            }
                        }
                    },
                    "delete": {
                        "tags": [
                            "Etiquetas"
                        ],
                        "summary": "Delete labels",
                        "parameters": [
                            {
                                "name": "sessionId",
                                "in": "path",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "Labels deleted"
                            }
                        }
                    }
                    ,
                    get: {
                        tags: ["Etiquetas"],
                        summary: "List labels",
                        description: "Get all labels with chat count",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: {
                                description: "List of labels",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean", example: true },
                                                labels: { type: "array", items: { $ref: "#/components/schemas/Label" } }
                                            }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            404: { description: "Sessão não encontrada" }
                        }
                    },
                    post: {
                        tags: ["Etiquetas"],
                        summary: "Criar etiqueta",
                        description: "Create new label with color (0-19 index)",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["name"],
                                        properties: {
                                            name: { type: "string", example: "Important" },
                                            color: { type: "integer", minimum: 0, maximum: 19, example: 0, description: "Color index (0-19)" }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Label created",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean", example: true },
                                                label: { $ref: "#/components/schemas/Label" }
                                            }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            500: { description: "Não foi possível criar etiqueta" }
                        }
                    }
                },
                "/labels/{sessionId}/{labelId}": {
                    "delete": {
                        "tags": [
                            "Etiquetas"
                        ],
                        "summary": "Delete a specific label",
                        "parameters": [
                            {
                                "name": "sessionId",
                                "in": "path",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            },
                            {
                                "name": "labelId",
                                "in": "path",
                                "required": true,
                                "schema": {
                                    "type": "string"
                                }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "Label deleted"
                            }
                        }
                    }
                    ,
                    put: {
                        tags: ["Etiquetas"],
                        summary: "Atualizar etiqueta",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "labelId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            name: { type: "string" },
                                            color: { type: "integer", minimum: 0, maximum: 19 }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Label updated",
                                content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, label: { $ref: "#/components/schemas/Label" } } } } }
                            }
                        }
                    },
                    delete: {
                        tags: ["Etiquetas"],
                        summary: "Excluir etiqueta",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "labelId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: {
                                description: "Label deleted",
                                content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } }
                            }
                        }
                    }
                },
                "/labels/{sessionId}/chat/{jid}/labels": {
                    get: {
                        tags: ["Etiquetas"],
                        summary: "Consultar etiquetas da conversa",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: {
                                description: "Chat labels",
                                content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, labels: { type: "array", items: { $ref: "#/components/schemas/Label" } } } } } }
                            }
                        }
                    },
                    put: {
                        tags: ["Etiquetas"],
                        summary: "Update chat labels",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["labelIds", "action"],
                                        properties: {
                                            labelIds: { type: "array", items: { type: "string" } },
                                            action: { type: "string", enum: ["add", "remove"] }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Chat labels updated",
                                content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, labels: { type: "array", items: { $ref: "#/components/schemas/Label" } } } } } }
                            }
                        }
                    }
                },

                // ==================== NOTIFICATIONS ====================
                "/notifications": {
                    "post": {
                        "tags": [
                            "Notificações"
                        ],
                        "summary": "Send or register a notification",
                        "responses": {
                            "200": {
                                "description": "Notification processed"
                            }
                        }
                    }
                    ,
                    get: {
                        tags: ["Notificações"],
                        summary: "List notifications",
                        description: "Get the last 50 notifications for the authenticated user",
                        responses: {
                            200: {
                                description: "List of notifications",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id: { type: "string" },
                                                    userId: { type: "string" },
                                                    title: { type: "string" },
                                                    message: { type: "string" },
                                                    type: { type: "string" },
                                                    href: { type: "string", nullable: true },
                                                    read: { type: "boolean" },
                                                    createdAt: { type: "string", format: "date-time" }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            500: { description: "Erro ao carregar notificações" }
                        }
                    },
                    post: {
                        tags: ["Notificações"],
                        summary: "Criar notificação",
                        description: "Send a notification to a specific user or broadcast to all (Superadmin only)",
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["title", "message"],
                                        properties: {
                                            title: { type: "string", example: "Maintenance" },
                                            message: { type: "string", example: "System update in 5 minutes" },
                                            type: { type: "string", enum: ["INFO", "SUCCESS", "WARNING", "ERROR"], default: "INFO" },
                                            href: { type: "string", example: "/settings" },
                                            targetUserId: { type: "string", description: "Target user UUID" },
                                            broadcast: { type: "boolean", default: false }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Notification created",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean", example: true },
                                                count: { type: "integer", description: "Number of users notified if broadcast" }
                                            }
                                        }
                                    }
                                }
                            },
                            400: { description: "Invalid request" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            500: { description: "Erro ao criar notificação" }
                        }
                    }
                },
                "/notifications/read": {
                    patch: {
                        tags: ["Notificações"],
                        summary: "Mark notifications as read",
                        description: "Mark specific or all notifications as read for the authenticated user",
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            ids: {
                                                type: "array",
                                                items: { type: "string" },
                                                description: "Array of notification IDs. If omitted or empty, all notifications are marked as read."
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Notifications updated",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/Success" }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            500: { description: "Erro ao atualizar notificações" }
                        }
                    }
                },
                "/notifications/delete": {
                    delete: {
                        tags: ["Notificações"],
                        summary: "Delete specific notification",
                        parameters: [
                            {
                                name: "id",
                                in: "query",
                                required: true,
                                schema: { type: "string" },
                                description: "Notification UUID"
                            }
                        ],
                        responses: {
                            200: {
                                description: "Notificação excluída",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/Success" }
                                    }
                                }
                            },
                            400: { description: "Notification ID required" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            500: { description: "Erro ao excluir notificação" }
                        }
                    }
                },

                // ==================== SYSTEM ====================
                "/settings/system": {
                    "post": {
                        "tags": [
                            "Configurações"
                        ],
                        "summary": "Atualizar configurações do sistema",
                        "responses": {
                            "200": {
                                "description": "System settings updated"
                            }
                        }
                    }
                    ,
                    get: {
                        tags: ["Sistema"],
                        summary: "Consultar configurações do sistema",
                        responses: {
                            200: {
                                description: "System settings",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", example: "default" },
                                                appName: { type: "string", example: "WA-AKG" },
                                                logoUrl: { type: "string", example: "https://example.com/logo.png" },
                                                timezone: { type: "string", example: "Asia/Jakarta" }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    post: {
                        tags: ["Sistema"],
                        summary: "Atualizar configurações do sistema",
                        description: "Update global system configuration (Superadmin/Owner only)",
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            appName: { type: "string" },
                                            logoUrl: { type: "string" },
                                            timezone: { type: "string" }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Settings updated",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string" },
                                                appName: { type: "string" },
                                                logoUrl: { type: "string" },
                                                timezone: { type: "string" },
                                                updatedAt: { type: "string", format: "date-time" }
                                            }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            500: { description: "Failed to update settings" }
                        }
                    }
                },
                "/status/{sessionId}/update": {
                    post: {
                        tags: ["Sistema"],
                        summary: "Update status",
                        description: "Post a status update (story) to WhatsApp. Supports text, image, and video.",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        requestBody: {
                            required: true,
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["content"],
                                        properties: {
                                            content: { type: "string", description: "Status text or caption" },
                                            type: { type: "string", enum: ["TEXT", "IMAGE", "VIDEO"], default: "TEXT" },
                                            mediaUrl: { type: "string", description: "Required for IMAGE and VIDEO" },
                                            backgroundColor: { type: "integer" },
                                            font: { type: "integer" },
                                            mentions: { type: "array", items: { type: "string" } }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: { description: "Status posted", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } },
                            400: { description: "Preencha os campos obrigatórios" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { $ref: "#/components/responses/SessionNotReady" }
                        }
                    }
                },
                "/status/update": {
                    post: {
                        tags: ["Sistema"],
                        summary: "Update status",
                        description: "Post a status update (story) to WhatsApp. Supports text, image, and video.",
                        requestBody: {
                            required: true,
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        required: ["sessionId", "content"],
                                        properties: {
                                            sessionId: { type: "string" },
                                            content: { type: "string", description: "Status text or caption" },
                                            type: { type: "string", enum: ["TEXT", "IMAGE", "VIDEO"], default: "TEXT" },
                                            mediaUrl: { type: "string", description: "Required for IMAGE and VIDEO" },
                                            backgroundColor: { type: "integer", description: "ARGB color for TEXT status" },
                                            font: { type: "integer", description: "Font style for TEXT status" },
                                            mentions: {
                                                type: "array",
                                                items: { type: "string" },
                                                description: "List of JIDs to mention/tag in the status"
                                            }
                                        }
                                    },
                                    examples: {
                                        simple: {
                                            summary: "Simple Text Status",
                                            value: {
                                                sessionId: "sales-01",
                                                content: "Hello World!",
                                                type: "TEXT",
                                                backgroundColor: 4278190080
                                            }
                                        },
                                        withMention: {
                                            summary: "Status with Mention",
                                            value: {
                                                sessionId: "sales-01",
                                                content: "Check this out @628123456789",
                                                type: "TEXT",
                                                backgroundColor: 4278190080,
                                                mentions: ["628123456789@s.whatsapp.net"]
                                            }
                                        },
                                        image: {
                                            summary: "Image Status",
                                            value: {
                                                sessionId: "sales-01",
                                                content: "Our new product!",
                                                type: "IMAGE",
                                                mediaUrl: "https://example.com/product.jpg"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            200: {
                                description: "Status updated",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/Success" }
                                    }
                                }
                            },
                            400: { description: "Preencha os campos obrigatórios" },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            503: { description: "Session not ready" },
                            500: { description: "Failed to post status" }
                        }
                    }
                },
                "/system/check-updates": {
                    post: {
                        tags: ["Sistema"],
                        summary: "Check for updates",
                        description: "Checks for new releases on GitHub and creates a system notification if a newer version is available.",
                        responses: {
                            200: {
                                description: "Check results",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean" },
                                                message: { type: "string" },
                                                version: { type: "string", description: "Latest version tag" }
                                            }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            500: { description: "Erro ao verificar atualizações" }
                        }
                    }
                },
                "/contacts/{sessionId}/{jid}/block": {
                    post: {
                        tags: ["Contatos"],
                        summary: "Bloquear contato",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: { description: "Contact blocked", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, message: { type: "string" } } } } } },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            500: { description: "Failed to block contact" }
                        }
                    }
                },
                "/contacts/{sessionId}/{jid}/unblock": {
                    post: {
                        tags: ["Contatos"],
                        summary: "Desbloquear contato",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "jid", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: { description: "Contact unblocked", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, message: { type: "string" } } } } } },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            500: { description: "Failed to unblock contact" }
                        }
                    }
                },
                "/chats/{sessionId}/by-label/{labelId}": {
                    get: {
                        tags: ["Etiquetas"],
                        summary: "Get chats by label",
                        description: "Get all chats associated with a specific label",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "labelId", in: "path", required: true, schema: { type: "string" } }
                        ],
                        responses: {
                            200: {
                                description: "List of chats with label",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean" },
                                                label: { type: "object" },
                                                chats: { type: "array", items: { type: "string" } },
                                                count: { type: "integer" }
                                            }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" },
                            403: { $ref: "#/components/responses/Forbidden" },
                            404: { description: "Label not found" }
                        }
                    }
                }
            }
        }
    });
    return spec;
};

