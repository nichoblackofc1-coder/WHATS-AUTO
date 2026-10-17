import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { readMediaFile } from "@/lib/media-storage";

// GET: Download media from message
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; messageId: string }> }
) {
    const { sessionId, messageId } = await params;
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Não autenticado", error: "Não autenticado" }, { status: 401 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Você não tem acesso a esta sessão", error: "Você não tem acesso a esta sessão" }, { status: 403 });
        }

        // Find message in database
        const dbSession = await prisma.session.findUnique({ where: { sessionId }, select: { id: true } });
        if (!dbSession) return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
        const message = await prisma.message.findFirst({
            where: { sessionId: dbSession.id, OR: [{ id: messageId }, { keyId: messageId }] },
        });

        if (!message) {
            return NextResponse.json({ status: false, message: "Mensagem não encontrada", error: "Mensagem não encontrada" }, { status: 404 });
        }

        if (!message.mediaUrl) {
            return NextResponse.json({ status: false, message: "A mensagem não tem mídia", error: "A mensagem não tem mídia" }, { status: 404 });
        }

        // If mediaUrl is a local path, return it
        // If it's external URL, redirect to it
        if (message.mediaUrl.startsWith('http')) {
            return NextResponse.redirect(message.mediaUrl);
        }

        // For local files, read and return
        const fileName = path.basename(message.mediaUrl);
        const fileBuffer = await readMediaFile(fileName);
        if (!fileBuffer) {
            return NextResponse.json({ status: false, message: "Arquivo de mídia não encontrado", error: "Arquivo de mídia não encontrado" }, { status: 404 });
        }

        const mimeType = message.type === 'IMAGE' ? 'image/jpeg'
            : message.type === 'VIDEO' ? 'video/mp4'
            : message.type === 'AUDIO' ? 'audio/mpeg'
            : message.type === 'DOCUMENT' ? 'application/pdf'
            : 'application/octet-stream';

        // Extract filename from path
        return new NextResponse(new Uint8Array(fileBuffer), {
            headers: {
                'Content-Type': mimeType,
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
        });

    } catch (error) {
        console.error("Download media error:", error);
        return NextResponse.json({ status: false, message: "Não foi possível baixar a mídia", error: "Não foi possível baixar a mídia" }, { status: 500 });
    }
}
