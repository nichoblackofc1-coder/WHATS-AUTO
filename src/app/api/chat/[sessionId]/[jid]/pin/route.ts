import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// PUT: Pin or unpin a chat
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; jid: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Não autenticado", error: "Não autenticado" }, { status: 401 });
        }

        const { sessionId, jid } = await params;
        const body = await request.json();
        const { pin } = body;

        if (pin === undefined) {
            return NextResponse.json({ status: false, message: "pin (boolean) is required", error: "pin (boolean) is required" }, { status: 400 });
        }

        const decodedJid = decodeURIComponent(jid);

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Você não tem acesso a esta sessão", error: "Você não tem acesso a esta sessão" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance?.socket) {
            return NextResponse.json({ status: false, message: "Session not ready", error: "Session not ready" }, { status: 503 });
        }

        // Pin or unpin chat
        await instance.socket.chatModify(
            {
                pin: pin,
                lastMessages: []
            },
            decodedJid
        );

        return NextResponse.json({
            success: true,
            message: pin ? "Chat pinned successfully" : "Chat unpinned successfully"
        });

    } catch (error) {
        console.error("Pin chat error:", error);
        return NextResponse.json({ status: false, message: "Failed to pin/unpin chat", error: "Failed to pin/unpin chat" }, { status: 500 });
    }
}
