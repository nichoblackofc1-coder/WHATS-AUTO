import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { fireSentWebhook } from "@/lib/webhook";
import Sticker from "wa-sticker-formatter";

// POST: Send sticker from image
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; jid: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Não autenticado", error: "Não autenticado" }, { status: 401 });
        }

        const { sessionId, jid } = await params;
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
             return NextResponse.json({ status: false, message: "Selecione um arquivo", error: "Selecione um arquivo" }, { status: 400 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Você não tem acesso a esta sessão", error: "Você não tem acesso a esta sessão" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance?.socket) {
            return NextResponse.json({ status: false, message: "Session not ready", error: "Session not ready" }, { status: 503 });
        }

        const decodedJid = decodeURIComponent(jid);

        // Convert File to Buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        const pack = formData.get("pack") as string || "WA-AKG";
        const author = formData.get("author") as string || user.name || "User";
        const type = (formData.get("type") as string) || "full";
        const quality = parseInt(formData.get("quality") as string) || 50;

        // Create Sticker
        const sticker = new Sticker(buffer, {
            pack,
            author,
            type: type as any,
            categories: ["🤩", "🎉"] as any,
            quality,
            background: "transparent"
        });

        const stickerBuffer = await sticker.toBuffer();

        const sendResult = await instance.socket.sendMessage(decodedJid, { sticker: stickerBuffer });

        // Fire webhook for sent message (non-blocking)
        fireSentWebhook(sessionId, decodedJid, { type: 'sticker' }, sendResult).catch(() => {});

        return NextResponse.json({ status: true, message: "Operação concluída" });

    } catch (e) {
        console.error("Sticker error", e);
        return NextResponse.json({ status: false, message: "Não foi possível criar figurinha", error: "Não foi possível criar figurinha" }, { status: 500 });
    }
}
