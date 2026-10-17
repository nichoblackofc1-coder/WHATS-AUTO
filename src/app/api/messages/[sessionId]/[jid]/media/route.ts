
import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { ChatService } from "@/modules/whatsapp/chat.service";

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
        const type = formData.get("type") as string; // image, video, audio, document
        const caption = formData.get("caption") as string || "";

        if (!file) {
             return NextResponse.json({ status: false, message: "Selecione um arquivo", error: "Selecione um arquivo" }, { status: 400 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Você não tem acesso a esta sessão", error: "Você não tem acesso a esta sessão" }, { status: 403 });
        }

        const decodedJid = decodeURIComponent(jid);

        // WhatsApp Channel (Newsletter) strictly enforces JPEG format for images
        // Sending PNGs or other formats will cause the Mobile client to crash/fail to load.
        if (decodedJid.includes('@newsletter') && type === 'image' && file.type !== 'image/jpeg') {
            return NextResponse.json(
                {
                    status: false,
                    message: "Os canais do WhatsApp aceitam apenas imagens JPG/JPEG. Converta a imagem antes de enviar.",
                    error: "Unsupported media format for Newsletter"
                },
                { status: 400 }
            );
        }
        const buffer = Buffer.from(await file.arrayBuffer());

        // Send via ChatService
        const sent = await ChatService.sendMediaMessage(
             sessionId,
             decodedJid,
             buffer,
             type,
             file.type,
             file.name,
             caption
        );

        return NextResponse.json({ status: true, message: "Operação concluída", data: sent });

    } catch (e) {
        console.error("Media send error", e);
        return NextResponse.json({ status: false, message: "Não foi possível enviar mídia", error: "Não foi possível enviar mídia" }, { status: 500 });
    }
}
