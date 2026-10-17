"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FileText, Code, ExternalLink } from "lucide-react";

export default function ApiDocsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [filter, setFilter] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Todos");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }
    }, [status, router]);

    const apiEndpoints = [
        // Sessions
        { category: "Sessões", method: "GET", path: "/api/sessions", description: "List all sessions", params: "-" },
        { category: "Sessões", method: "POST", path: "/api/sessions", description: "Criar nova sessão", params: "Body: { name, sessionId }" },
        { category: "Sessões", method: "GET", path: "/api/sessions/[sessionId]", description: "Consultar detalhes da sessão", params: "Path: sessionId" },
        { category: "Sessões", method: "GET", path: "/api/sessions/[sessionId]/qr", description: "Get QR code", params: "Path: sessionId" },
        { category: "Sessões", method: "GET", path: "/api/sessions/[sessionId]/bot-config", description: "Get bot config", params: "Path: sessionId" },
        { category: "Sessões", method: "POST", path: "/api/sessions/[sessionId]/bot-config", description: "Update bot config", params: "Path: sessionId, Body: { enabled, botMode, ... }" },
        { category: "Sessões", method: "PATCH", path: "/api/sessions/[sessionId]/settings", description: "Update settings", params: "Path: sessionId, Body: { config }" },
        { category: "Sessões", method: "DELETE", path: "/api/sessions/[sessionId]/settings", description: "Excluir sessão", params: "Path: sessionId" },
        { category: "Sessões", method: "POST", path: "/api/sessions/[sessionId]/[action]", description: "Controlar sessão", params: "Path: sessionId, action (start|stop|restart|logout)" },

        // Groups
        { category: "Grupos", method: "GET", path: "/api/groups/[sessionId]", description: "List groups", params: "Path: sessionId" },
        { category: "Grupos", method: "POST", path: "/api/groups/[sessionId]/create", description: "Criar grupo", params: "Path: sessionId, Body: { subject, participants }" },
        { category: "Grupos", method: "POST", path: "/api/groups/[sessionId]/invite/accept", description: "Aceitar convite", params: "Path: sessionId, Body: { code }" },
        { category: "Grupos", method: "PUT", path: "/api/groups/[sessionId]/[jid]/picture", description: "Update group picture", params: "Path: sessionId, jid, Body: { file } (multipart/form-data)" },
        { category: "Grupos", method: "DELETE", path: "/api/groups/[sessionId]/[jid]/picture", description: "Remove group picture", params: "Path: sessionId, jid" },
        { category: "Grupos", method: "PUT", path: "/api/groups/[sessionId]/[jid]/subject", description: "Update group name", params: "Path: sessionId, jid, Body: { subject }" },
        { category: "Grupos", method: "PUT", path: "/api/groups/[sessionId]/[jid]/description", description: "Update description", params: "Path: sessionId, jid, Body: { description }" },
        { category: "Grupos", method: "GET", path: "/api/groups/[sessionId]/[jid]/invite", description: "Consultar convite", params: "Path: sessionId, jid" },
        { category: "Grupos", method: "PUT", path: "/api/groups/[sessionId]/[jid]/invite/revoke", description: "Revogar convite", params: "Path: sessionId, jid" },
        { category: "Grupos", method: "PUT", path: "/api/groups/[sessionId]/[jid]/members", description: "Manage members", params: "Path: sessionId, jid, Body: { action, participants }" },
        { category: "Grupos", method: "PUT", path: "/api/groups/[sessionId]/[jid]/settings", description: "Update settings", params: "Path: sessionId, jid, Body: { settings }" },
        { category: "Grupos", method: "PUT", path: "/api/groups/[sessionId]/[jid]/ephemeral", description: "Toggle disappearing", params: "Path: sessionId, jid, Body: { ephemeral }" },
        { category: "Grupos", method: "POST", path: "/api/groups/[sessionId]/[jid]/leave", description: "Sair do grupo", params: "Path: sessionId, jid" },

        // Groups (Legacy)
        { category: "Grupos", method: "GET", path: "/api/groups", description: "List groups [DEPRECATED]", params: "Query: sessionId" },
        { category: "Grupos", method: "POST", path: "/api/groups/create", description: "Create group [DEPRECATED]", params: "Body: { sessionId, subject, participants }" },
        { category: "Grupos", method: "POST", path: "/api/groups/invite/accept", description: "Accept invite [DEPRECATED]", params: "Body: { sessionId, code }" },

        // Profile
        { category: "Profile", method: "GET", path: "/api/profile/[sessionId]", description: "Get own profile", params: "Path: sessionId" },
        { category: "Profile", method: "PUT", path: "/api/profile/[sessionId]/name", description: "Update name", params: "Path: sessionId, Body: { name }" },
        { category: "Profile", method: "PUT", path: "/api/profile/[sessionId]/status", description: "Update status", params: "Path: sessionId, Body: { status }" },
        { category: "Profile", method: "PUT", path: "/api/profile/[sessionId]/picture", description: "Update picture", params: "Path: sessionId, Body: { image } (multipart/form-data)" },
        { category: "Profile", method: "DELETE", path: "/api/profile/[sessionId]/picture", description: "Remove picture", params: "Path: sessionId" },

        // Profile (Legacy)
        { category: "Profile", method: "GET", path: "/api/profile", description: "Get profile [DEPRECATED]", params: "Query: sessionId" },
        { category: "Profile", method: "PUT", path: "/api/profile/name", description: "Update name [DEPRECATED]", params: "Body: { sessionId, name }" },
        { category: "Profile", method: "PUT", path: "/api/profile/picture", description: "Update picture [DEPRECATED]", params: "Body: { sessionId, image }" },
        { category: "Profile", method: "DELETE", path: "/api/profile/picture", description: "Remove picture [DEPRECATED]", params: "Body: { sessionId }" },
        { category: "Profile", method: "PUT", path: "/api/profile/status", description: "Update status [DEPRECATED]", params: "Body: { sessionId, status }" },

        // Messaging
        { category: "Mensagens", method: "POST", path: "/api/messages/[sessionId]/[jid]/send", description: "Send message", params: "Path: sessionId, jid, Body: { message }" },
        { category: "Mensagens", method: "POST", path: "/api/messages/[sessionId]/[jid]/list", description: "Send list message", params: "Path: sessionId, jid, Body: { ... }" },
        { category: "Mensagens", method: "POST", path: "/api/messages/[sessionId]/[jid]/location", description: "Enviar localização", params: "Path: sessionId, jid, Body: { location }" },
        { category: "Mensagens", method: "POST", path: "/api/messages/[sessionId]/[jid]/poll", description: "Enviar enquete", params: "Path: sessionId, jid, Body: { poll }" },
        { category: "Mensagens", method: "POST", path: "/api/messages/[sessionId]/[jid]/spam", description: "Report spam", params: "Path: sessionId, jid" },
        { category: "Mensagens", method: "POST", path: "/api/messages/[sessionId]/[jid]/sticker", description: "Enviar figurinha", params: "Path: sessionId, jid, Body: { file, pack, author, type, quality } (multipart/form-data)" },
        { category: "Mensagens", method: "POST", path: "/api/messages/[sessionId]/[jid]/[messageId]/react", description: "Enviar reação", params: "Path: sessionId, jid, messageId" },
        { category: "Mensagens", method: "POST", path: "/api/messages/[sessionId]/[jid]/contact", description: "Enviar contato", params: "Path: sessionId, jid, Body: { vcard }" },
        { category: "Mensagens", method: "POST", path: "/api/messages/[sessionId]/[jid]/forward", description: "Encaminhar mensagem", params: "Path: sessionId, jid, Body: { messageId }" },
        { category: "Mensagens", method: "POST", path: "/api/messages/[sessionId]/broadcast", description: "Disparo em massa", params: "Path: sessionId, Body: { recipients[], message, delay }" },
        { category: "Mensagens", method: "GET", path: "/api/messages/[sessionId]/broadcast/history", description: "Get broadcast history", params: "Path: sessionId, Query: limit, offset" },
        { category: "Mensagens", method: "GET", path: "/api/messages/[sessionId]/broadcast/history/[logId]", description: "Get broadcast detail", params: "Path: sessionId, logId" },
        { category: "Mensagens", method: "DELETE", path: "/api/messages/[sessionId]/[jid]/[messageId]", description: "Excluir mensagem", params: "Path: sessionId, jid, messageId" },

        { category: "Mensagens", method: "GET", path: "/api/messages/[sessionId]/download/[messageId]/media", description: "Baixar mídia", params: "Path: sessionId, messageId" },
        { category: "Mensagens", method: "GET", path: "/api/media/[filename]", description: "Serve media file", params: "Path: filename" },

        // Messaging (Legacy)
        { category: "Mensagens", method: "POST", path: "/api/messages/broadcast", description: "Broadcast message [DEPRECATED]", params: "Body: { sessionId, jids[], message }" },
        { category: "Mensagens", method: "POST", path: "/api/messages/contact", description: "Send contact [DEPRECATED]", params: "Body: { sessionId, jid, vcard }" },
        { category: "Mensagens", method: "DELETE", path: "/api/messages/delete", description: "Delete message [DEPRECATED]", params: "Body: { sessionId, jid, messageId }" },
        { category: "Mensagens", method: "POST", path: "/api/messages/forward", description: "Forward message [DEPRECATED]", params: "Body: { sessionId, jid, messageId }" },
        { category: "Mensagens", method: "POST", path: "/api/messages/list", description: "Send list message [DEPRECATED]", params: "Body: { sessionId, jid, ... }" },
        { category: "Mensagens", method: "POST", path: "/api/messages/location", description: "Send location [DEPRECATED]", params: "Body: { sessionId, jid, location }" },
        { category: "Mensagens", method: "POST", path: "/api/messages/poll", description: "Send poll [DEPRECATED]", params: "Body: { sessionId, jid, poll }" },
        { category: "Mensagens", method: "POST", path: "/api/messages/react", description: "Send reaction [DEPRECATED]", params: "Body: { sessionId, jid, reaction }" },
        { category: "Mensagens", method: "POST", path: "/api/messages/spam", description: "Report spam [DEPRECATED]", params: "Body: { sessionId, jid }" },
        { category: "Mensagens", method: "POST", path: "/api/messages/sticker", description: "Send sticker [DEPRECATED]", params: "Body: { sessionId, jid, sticker }" },

        // Chat
        { category: "Conversas", method: "GET", path: "/api/chat/[sessionId]", description: "Listar conversas", params: "Path: sessionId, Query: page, limit" },
        { category: "Conversas", method: "GET", path: "/api/chat/[sessionId]/[jid]", description: "Get specific chat", params: "Path: sessionId, jid, Query: limit" },
        { category: "Conversas", method: "POST", path: "/api/chat/[sessionId]/check", description: "Verificar números no WhatsApp", params: "Path: sessionId, Body: { phones[] }" },
        { category: "Conversas", method: "PUT", path: "/api/chat/[sessionId]/[jid]/read", description: "Marcar como lida", params: "Path: sessionId, jid" },
        { category: "Conversas", method: "POST", path: "/api/chat/[sessionId]/[jid]/archive", description: "Arquivar conversa", params: "Path: sessionId, jid, Body: { archive }" },
        { category: "Conversas", method: "POST", path: "/api/chat/[sessionId]/[jid]/presence", description: "Send presence", params: "Path: sessionId, jid, Body: { presence }" },
        { category: "Conversas", method: "POST", path: "/api/chat/[sessionId]/[jid]/profile-picture", description: "Consultar foto do perfil", params: "Path: sessionId, jid" },
        { category: "Conversas", method: "PUT", path: "/api/chat/[sessionId]/[jid]/mute", description: "Silenciar conversa", params: "Path: sessionId, jid, Body: { mute }" },
        { category: "Conversas", method: "PUT", path: "/api/chat/[sessionId]/[jid]/pin", description: "Fixar conversa", params: "Path: sessionId, jid, Body: { pin }" },
        { category: "Conversas", method: "GET", path: "/api/chats/[sessionId]/by-label/[labelId]", description: "Filter by label", params: "Path: sessionId, labelId" },

        // Chat (Legacy)
        { category: "Conversas", method: "POST", path: "/api/chat/[sessionId]/send", description: "Send message [DEPRECATED]", params: "Path: sessionId, Body: { jid, message }" },
        { category: "Conversas", method: "PUT", path: "/api/chat/archive", description: "Archive chat [DEPRECATED]", params: "Body: { sessionId, jid, archive }" },
        { category: "Conversas", method: "POST", path: "/api/chat/check", description: "Check WhatsApp numbers [DEPRECATED]", params: "Body: { sessionId, phones[] }" },
        { category: "Conversas", method: "PUT", path: "/api/chat/mute", description: "Mute chat [DEPRECATED]", params: "Body: { sessionId, jid, mute }" },
        { category: "Conversas", method: "PUT", path: "/api/chat/pin", description: "Pin chat [DEPRECATED]", params: "Body: { sessionId, jid, pin }" },
        { category: "Conversas", method: "POST", path: "/api/chat/presence", description: "Send presence [DEPRECATED]", params: "Body: { sessionId, jid, presence }" },
        { category: "Conversas", method: "POST", path: "/api/chat/profile-picture", description: "Get profile picture [DEPRECATED]", params: "Body: { sessionId, jid }" },
        { category: "Conversas", method: "PUT", path: "/api/chat/read", description: "Mark as read [DEPRECATED]", params: "Body: { sessionId, jid }" },
        { category: "Conversas", method: "POST", path: "/api/chat/send", description: "Send message [DEPRECATED]", params: "Body: { sessionId, jid, message }" },
        { category: "Conversas", method: "GET", path: "/api/chats/by-label/[labelId]", description: "Filter by label [DEPRECATED]", params: "Path: labelId, Query: sessionId" },

        // Contacts
        { category: "Contatos", method: "GET", path: "/api/contacts/[sessionId]", description: "List contacts", params: "Path: sessionId, Query: search" },
        { category: "Contatos", method: "POST", path: "/api/contacts/[sessionId]/[jid]/block", description: "Bloquear contato", params: "Path: sessionId, jid" },
        { category: "Contatos", method: "POST", path: "/api/contacts/[sessionId]/[jid]/unblock", description: "Desbloquear contato", params: "Path: sessionId, jid" },

        // Contacts (Legacy)
        { category: "Contatos", method: "GET", path: "/api/contacts", description: "List contacts [DEPRECATED]", params: "Query: search" },
        { category: "Contatos", method: "POST", path: "/api/contacts/block", description: "Block contact [DEPRECATED]", params: "Body: { sessionId, jid }" },
        { category: "Contatos", method: "POST", path: "/api/contacts/unblock", description: "Unblock contact [DEPRECATED]", params: "Body: { sessionId, jid }" },

        // Labels
        { category: "Etiquetas", method: "GET", path: "/api/labels/[sessionId]", description: "List labels", params: "Path: sessionId" },
        { category: "Etiquetas", method: "POST", path: "/api/labels/[sessionId]", description: "Criar etiqueta", params: "Path: sessionId, Body: { name, color }" },
        { category: "Etiquetas", method: "PUT", path: "/api/labels/[sessionId]/[id]", description: "Atualizar etiqueta", params: "Path: sessionId, id, Body: { name, color }" },
        { category: "Etiquetas", method: "DELETE", path: "/api/labels/[sessionId]/[id]", description: "Excluir etiqueta", params: "Path: sessionId, id" },
        { category: "Etiquetas", method: "GET", path: "/api/labels/[sessionId]/chat-labels/[jid]", description: "Consultar etiquetas da conversa", params: "Path: sessionId, jid" },
        { category: "Etiquetas", method: "PUT", path: "/api/labels/[sessionId]/chat-labels/[jid]", description: "Associar ou remover etiquetas", params: "Path: sessionId, jid, Body: { labelIds[], action }" },

        // Labels (Legacy)
        { category: "Etiquetas", method: "GET", path: "/api/labels", description: "List labels [DEPRECATED]", params: "Query: sessionId" },
        { category: "Etiquetas", method: "POST", path: "/api/labels", description: "Create label [DEPRECATED]", params: "Body: { sessionId, name, color }" },
        { category: "Etiquetas", method: "GET", path: "/api/labels/chat-labels", description: "Get chat labels [DEPRECATED]", params: "Query: sessionId, jid" },
        { category: "Etiquetas", method: "PUT", path: "/api/labels/chat-labels", description: "Update chat labels [DEPRECATED]", params: "Body: { sessionId, jid, labelIds[], action }" },

        // Auto Reply
        { category: "Resposta automática", method: "GET", path: "/api/autoreplies/[sessionId]", description: "List auto replies", params: "Path: sessionId" },
        { category: "Resposta automática", method: "POST", path: "/api/autoreplies/[sessionId]", description: "Criar resposta automática", params: "Path: sessionId, Body: { keyword, response, matchType }" },
        { category: "Resposta automática", method: "GET", path: "/api/autoreplies/[sessionId]/[id]", description: "Get auto reply", params: "Path: sessionId, id" },
        { category: "Resposta automática", method: "PUT", path: "/api/autoreplies/[sessionId]/[id]", description: "Atualizar resposta automática", params: "Path: sessionId, id, Body: { ... }" },
        { category: "Resposta automática", method: "DELETE", path: "/api/autoreplies/[sessionId]/[id]", description: "Excluir resposta automática", params: "Path: sessionId, id" },

        // Auto Reply (Legacy)
        { category: "Resposta automática", method: "GET", path: "/api/autoreplies", description: "List auto replies [DEPRECATED]", params: "Query: sessionId" },
        { category: "Resposta automática", method: "POST", path: "/api/autoreplies", description: "Create auto reply [DEPRECATED]", params: "Body: { sessionId, keyword, ... }" },

        // Scheduler
        { category: "Agendamentos", method: "GET", path: "/api/scheduler/[sessionId]", description: "List scheduled", params: "Path: sessionId" },
        { category: "Agendamentos", method: "POST", path: "/api/scheduler/[sessionId]", description: "Criar agendamento", params: "Path: sessionId, Body: { jid, content, sendAt }" },
        { category: "Agendamentos", method: "GET", path: "/api/scheduler/[sessionId]/[id]", description: "Listar agendamentos", params: "Path: sessionId, id" },
        { category: "Agendamentos", method: "PUT", path: "/api/scheduler/[sessionId]/[id]", description: "Atualizar agendamento", params: "Path: sessionId, id, Body: { ... }" },
        { category: "Agendamentos", method: "DELETE", path: "/api/scheduler/[sessionId]/[id]", description: "Excluir agendamento", params: "Path: sessionId, id" },

        // Scheduler (Legacy)
        { category: "Agendamentos", method: "GET", path: "/api/scheduler", description: "List scheduled [DEPRECATED]", params: "Query: sessionId" },
        { category: "Agendamentos", method: "POST", path: "/api/scheduler", description: "Create scheduled [DEPRECATED]", params: "Body: { sessionId, content, ... }" },

        // Webhooks
        { category: "Webhooks", method: "GET", path: "/api/webhooks/[sessionId]", description: "List webhooks", params: "Path: sessionId" },
        { category: "Webhooks", method: "POST", path: "/api/webhooks/[sessionId]", description: "Criar webhook", params: "Path: sessionId, Body: { name, url, events[] }" },
        { category: "Webhooks", method: "PUT", path: "/api/webhooks/[sessionId]/[id]", description: "Atualizar webhook", params: "Path: sessionId, id, Body: { ... }" },
        { category: "Webhooks", method: "DELETE", path: "/api/webhooks/[sessionId]/[id]", description: "Excluir webhook", params: "Path: sessionId, id" },

        // Webhooks (Legacy)
        { category: "Webhooks", method: "GET", path: "/api/webhooks", description: "List webhooks [DEPRECATED]", params: "Query: sessionId" },
        { category: "Webhooks", method: "POST", path: "/api/webhooks", description: "Create webhook [DEPRECATED]", params: "Body: { sessionId, url, ... }" },

        // Notifications
        { category: "Notificações", method: "GET", path: "/api/notifications", description: "List notifications", params: "-" },
        { category: "Notificações", method: "POST", path: "/api/notifications", description: "Criar notificação", params: "Body: { title, message, ... }" },
        { category: "Notificações", method: "PATCH", path: "/api/notifications/read", description: "Marcar como lida", params: "Body: { ids[] }" },
        { category: "Notificações", method: "DELETE", path: "/api/notifications/delete", description: "Delete notifications", params: "Query: id" },

        // Users
        { category: "Usuários", method: "GET", path: "/api/users", description: "List users", params: "-" },
        { category: "Usuários", method: "POST", path: "/api/users", description: "Criar usuário", params: "Body: { name, email, password }" },
        { category: "Usuários", method: "GET", path: "/api/users/[id]", description: "Get user", params: "Path: id" },
        { category: "Usuários", method: "PATCH", path: "/api/users/[id]", description: "Atualizar usuário", params: "Path: id, Body: { ... }" },
        { category: "Usuários", method: "DELETE", path: "/api/users/[id]", description: "Excluir usuário", params: "Path: id" },
        { category: "Usuários", method: "GET", path: "/api/user/api-key", description: "Consultar chave de API", params: "-" },
        { category: "Usuários", method: "POST", path: "/api/user/api-key", description: "Gerar chave de API", params: "-" },
        { category: "Usuários", method: "DELETE", path: "/api/user/api-key", description: "Revoke API key", params: "-" },

        // System
        { category: "Sistema", method: "GET", path: "/api/settings/system", description: "Consultar configurações do sistema", params: "-" },
        { category: "Sistema", method: "POST", path: "/api/settings/system", description: "Atualizar configurações do sistema", params: "Body: { appName, logoUrl, timezone }" },
        { category: "Sistema", method: "POST", path: "/api/status/[sessionId]/update", description: "Update status", params: "Path: sessionId, Body: { status }" },
        { category: "Sistema", method: "GET", path: "/api/system/check-updates", description: "Verificar atualizações", params: "-" },
    ];


    const categories = ["Todos", ...Array.from(new Set(apiEndpoints.map(e => e.category)))];

    const filteredEndpoints = apiEndpoints.filter(endpoint => {
        const matchesFilter = endpoint.path.toLowerCase().includes(filter.toLowerCase()) ||
            endpoint.description.toLowerCase().includes(filter.toLowerCase());
        const matchesCategory = selectedCategory === "Todos" || endpoint.category === selectedCategory;
        return matchesFilter && matchesCategory;
    });

    const getMethodColor = (method: string) => {
        switch (method) {
            case "GET": return "bg-green-100 text-green-800 border-green-300";
            case "POST": return "bg-blue-100 text-blue-800 border-blue-300";
            case "PUT": return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "PATCH": return "bg-orange-100 text-orange-800 border-orange-300";
            case "DELETE": return "bg-red-100 text-red-800 border-red-300";
            default: return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-600">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                            Documentação da API
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Referência completa de todos os {apiEndpoints.length} endereços da API.
                        </p>
                    </div>
                    <a
                        href="/docs"
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Code className="w-4 h-4" />
                        Abrir documentação Swagger
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>

                {/* Master Documentation Alert */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r shadow-sm mb-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">📘 Documentação do projeto disponível</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>
                                    Para conhecer os detalhes da <strong>Arquitetura do projeto</strong>, <strong>Estrutura do banco de dados</strong>, e <strong>Rotas da interface</strong>, consulte o <a href="/docs/PROJECT_DOCUMENTATION.md" className="font-bold underline hover:text-blue-900">Documentação do projeto</a> no código do projeto.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Links rápidos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a
                            href="/docs"
                            target="_blank"
                            className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                            <Code className="w-10 h-10 text-blue-600 mr-4" />
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-800 group-hover:text-blue-600">Swagger UI</h3>
                                <p className="text-sm text-gray-600">Testes interativos da API</p>
                            </div>
                            <ExternalLink className="w-5 h-5 text-gray-400" />
                        </a>
                        <a
                            href="/api/docs"
                            target="_blank"
                            className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                            <FileText className="w-10 h-10 text-green-600 mr-4" />
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-800 group-hover:text-green-600">Especificação OpenAPI</h3>
                                <p className="text-sm text-gray-600">Especificação JSON</p>
                            </div>
                            <ExternalLink className="w-5 h-5 text-gray-400" />
                        </a>
                        <div className="flex items-center p-4 border rounded-lg bg-gray-50">
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-800">URL base</h3>
                                <p className="text-sm text-gray-600 font-mono break-all">{process.env.NEXT_PUBLIC_API_URL || '/api'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                            <input
                                type="text"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                placeholder="Search endpoints..."
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Endpoints List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parâmetros</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredEndpoints.map((endpoint, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getMethodColor(endpoint.method)}`}>
                                                {endpoint.method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <code className="text-sm text-gray-900 font-mono">{endpoint.path}</code>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-gray-600 max-w-xs break-words">
                                            {endpoint.params || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{endpoint.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                                {endpoint.category}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredEndpoints.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            Nenhuma rota corresponde aos filtros
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-2xl font-bold text-blue-600">{apiEndpoints.length}</div>
                        <div className="text-sm text-gray-600">Total de rotas</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-2xl font-bold text-green-600">{categories.length - 1}</div>
                        <div className="text-sm text-gray-600">Categorias</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-2xl font-bold text-yellow-600">{apiEndpoints.filter(e => e.method === "POST").length}</div>
                        <div className="text-sm text-gray-600">Rotas POST</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-2xl font-bold text-purple-600">{apiEndpoints.filter(e => e.method === "GET").length}</div>
                        <div className="text-sm text-gray-600">Rotas GET</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
