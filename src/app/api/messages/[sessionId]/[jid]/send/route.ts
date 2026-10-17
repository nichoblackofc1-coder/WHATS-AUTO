import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { ChatService } from "@/modules/whatsapp/chat.service";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string, jid: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Não autenticado", error: "Não autenticado" }, { status: 401 });
        }

        const { sessionId, jid: rawJid } = await params;
        const jid = decodeURIComponent(rawJid);

        const body = await request.json();
        const { message, mentions, quotedMessageId } = body;

        if (!message) {
            return NextResponse.json({ status: false, message: "Informe a mensagem", error: "Informe a mensagem" }, { status: 400 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Você não tem acesso a esta sessão", error: "Você não tem acesso a esta sessão" }, { status: 403 });
        }

        // Send Message using ChatService
        const result = await ChatService.sendTextMessage(sessionId, jid, message, mentions, quotedMessageId);

        return NextResponse.json({ status: true, message: "Mensagem enviada", data: result });
    } catch (error: any) {
        console.error("Send message error:", error);
        const errorMsg = error?.message || "Não foi possível enviar mensagem";
        return NextResponse.json({ status: false, message: errorMsg, error: errorMsg }, { status: 500 });
    }
}
