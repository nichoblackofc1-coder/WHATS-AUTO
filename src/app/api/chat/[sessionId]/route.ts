import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { ChatService } from "@/modules/whatsapp/chat.service";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await params;

    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Não autenticado", error: "Não autenticado" }, { status: 401 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Você não tem acesso a esta sessão", error: "Acesso negado" }, { status: 403 });
        }

        // Get the database Session ID (cuid) from the sessionId string
        const session = await prisma.session.findUnique({
            where: { sessionId },
            select: { id: true }
        });

        if (!session) {
            return NextResponse.json({ status: false, message: "Sessão não encontrada", error: "Sessão não encontrada" }, { status: 404 });
        }

        const dbSessionId = session.id;

        // Fetch chats using the new ChatService
        const chatList = await ChatService.getChatsList(session.id);

        return NextResponse.json({ status: true, message: "Chats fetched successfully", data: chatList });
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json({ status: false, message: "Não foi possível carregar conversas", error: "Não foi possível carregar conversas" }, { status: 500 });
    }
}
