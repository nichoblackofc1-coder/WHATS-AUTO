"use server";

import { prisma } from "@/lib/prisma";
import { ChatService } from "@/modules/whatsapp/chat.service";
import { getAuthenticatedUserForAction } from "@/lib/server-action-auth";
import { canAccessSession } from "@/lib/api-auth";
import { headers } from "next/headers";
import { forwardGateway, usesGatewayWorker } from "@/lib/gateway-queue";

async function sendViaWorker(path: string, body: string | FormData) {
    const incoming = await headers();
    const requestHeaders = new Headers();
    requestHeaders.set("cookie", incoming.get("cookie") || "");
    if (typeof body === "string") requestHeaders.set("content-type", "application/json");
    const response = await forwardGateway(new Request(`https://${incoming.get("host")}${path}`, { method: "POST", headers: requestHeaders, body }));
    const result = await response.json();
    return response.ok ? { success: true, error: undefined } : { success: false, error: result.error || result.message || "Não foi possível enviar a mensagem" };
}

const CHAT_PAGE_SIZE = parseInt(process.env.NEXT_PUBLIC_CHAT_PAGE_SIZE || "50", 10);

// Fetch chat list with cursor-based pagination & search
export async function getChatsStatus(
    sessionId: string,
    limit = CHAT_PAGE_SIZE,
    before?: string,
    search?: string
) {
    const user = await getAuthenticatedUserForAction();
    if (!user) throw new Error("Não autenticado");

    const canAccess = await canAccessSession(user.id, user.role, sessionId);
    if (!canAccess) throw new Error("Acesso negado");

    const session = await prisma.session.findUnique({
        where: { sessionId },
        select: { id: true }
    });

    if (!session) throw new Error("Sessão não encontrada");

    return await ChatService.getChatsList(session.id, limit, before, search);
}

// Fetch messages for a specific chat with cursor pagination
export async function getChatMessages(
    sessionId: string,
    jid: string,
    limit = 50,
    before?: string
) {
    const user = await getAuthenticatedUserForAction();
    if (!user) throw new Error("Não autenticado");

    const canAccess = await canAccessSession(user.id, user.role, sessionId);
    if (!canAccess) throw new Error("Acesso negado");

    const session = await prisma.session.findUnique({
        where: { sessionId },
        select: { id: true }
    });

    if (!session) throw new Error("Sessão não encontrada");

    const { messages, hasMore } = await ChatService.getMessages(session.id, jid, limit, before);

    return {
        messages: messages.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp instanceof Date
                ? msg.timestamp.toISOString()
                : String(msg.timestamp)
        })),
        hasMore
    };
}

// Send a basic text message
export async function sendChatMessage(sessionId: string, jid: string, text: string, quotedMessageId?: string) {
    const user = await getAuthenticatedUserForAction();
    if (!user) throw new Error("Não autenticado");

    const canAccess = await canAccessSession(user.id, user.role, sessionId);
    if (!canAccess) throw new Error("Acesso negado");

    try {
        if (usesGatewayWorker()) return await sendViaWorker(`/api/messages/${encodeURIComponent(sessionId)}/${encodeURIComponent(jid)}/send`, JSON.stringify({ message: { text }, quotedMessageId }));
        await ChatService.sendTextMessage(sessionId, jid, { text }, undefined, quotedMessageId);
        return { success: true, error: undefined };
    } catch (error: any) {
        return { success: false, error: error.message || "Não foi possível enviar a mensagem" };
    }
}

// Upload and Send Media
export async function sendMediaMessage(formData: FormData) {
    const user = await getAuthenticatedUserForAction();
    if (!user) throw new Error("Não autenticado");

    const sessionId = formData.get("sessionId") as string;
    const jid = formData.get("jid") as string;
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const caption = formData.get("caption") as string || "";

    if (!sessionId || !jid || !file || !type) {
        throw new Error("Preencha os campos obrigatórios");
    }

    const canAccess = await canAccessSession(user.id, user.role, sessionId);
    if (!canAccess) throw new Error("Acesso negado");

    try {
        if (usesGatewayWorker()) return await sendViaWorker(`/api/messages/${encodeURIComponent(sessionId)}/${encodeURIComponent(jid)}/media`, formData);
        const buffer = Buffer.from(await file.arrayBuffer());

        await ChatService.sendMediaMessage(
            sessionId,
            jid,
            buffer,
            type,
            file.type,
            file.name,
            caption
        );

        return { success: true, error: undefined };
    } catch (error: any) {
        console.error("Media send error:", error);
        return { success: false, error: error.message || "Não foi possível enviar a mídia" };
    }
}
