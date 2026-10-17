import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import moment from "moment-timezone";
import cronParser from "cron-parser";
import { toWhatsAppJid } from "@/lib/phone";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; scheduleId: string }> }
) {
    try {
        const { sessionId, scheduleId } = await params;
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Não autenticado", error: "Não autenticado" }, { status: 401 });
        }

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Você não tem acesso a esta sessão", error: "Você não tem acesso a esta sessão" }, { status: 403 });
        }

        const body = await request.json();
        const { jid, content, sendAt, mediaUrl, mediaType, cronExpression, recurrenceRule } = body;

        if (!jid || (!content && !mediaUrl) || !sendAt) {
            return NextResponse.json({ status: false, message: "Missing required fields (JID, Content/Media, SendAt)", error: "Preencha os campos obrigatórios" }, { status: 400 });
        }

        // Fetch system timezone
        // @ts-ignore
        const systemConfig = await prisma.systemConfig.findUnique({ where: { id: "default" } });
        const timezone = systemConfig?.timezone || "America/Fortaleza";

        console.log(`[Scheduler:PUT] Received sendAt: ${sendAt}, using timezone: ${timezone}`);
        const utcDate = moment.tz(sendAt, timezone).toDate();
        if (Number.isNaN(utcDate.getTime())) return NextResponse.json({ error: "Data de envio inválida" }, { status: 400 });
        let normalizedJid: string;
        try {
            normalizedJid = toWhatsAppJid(jid);
            if (cronExpression) cronParser.parse(cronExpression, { tz: timezone });
        } catch { return NextResponse.json({ error: "Destinatário ou expressão de recorrência inválidos" }, { status: 400 }); }
        console.log(`[Scheduler:PUT] Resolved UTC Date: ${utcDate.toISOString()}`);

        const msg = await prisma.scheduledMessage.findUnique({
            where: { id: scheduleId },
            include: { session: true }
        });

        if (!msg) {
            return NextResponse.json({ status: false, message: "Mensagem não encontrada", error: "Mensagem não encontrada" }, { status: 404 });
        }

        // Verify the schedule belongs to this session
        if (msg.session.sessionId !== sessionId) {
            return NextResponse.json({ status: false, message: "Schedule not found in this session", error: "Schedule not found in this session" }, { status: 404 });
        }

        const updated = await prisma.scheduledMessage.update({
            where: { id: scheduleId },
            data: {
                jid: normalizedJid,
                content,
                sendAt: utcDate,
                mediaUrl: mediaUrl || null,
                mediaType: mediaType || null,
                cronExpression: cronExpression !== undefined ? cronExpression : msg.cronExpression,
                recurrenceRule: recurrenceRule !== undefined ? recurrenceRule : msg.recurrenceRule
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Update schedule error:", error);
        return NextResponse.json({ status: false, message: "Erro interno do servidor", error: "Erro interno do servidor" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; scheduleId: string }> }
) {
    try {
        const { sessionId, scheduleId } = await params;

        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Não autenticado", error: "Não autenticado" }, { status: 401 });
        }

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Você não tem acesso a esta sessão", error: "Você não tem acesso a esta sessão" }, { status: 403 });
        }

        const msg = await prisma.scheduledMessage.findUnique({
            where: { id: scheduleId },
            include: { session: true }
        });

        if (!msg) {
            return NextResponse.json({ status: false, message: "Mensagem não encontrada", error: "Mensagem não encontrada" }, { status: 404 });
        }

        // Verify the schedule belongs to this session
        if (msg.session.sessionId !== sessionId) {
            return NextResponse.json({ status: false, message: "Schedule not found in this session", error: "Schedule not found in this session" }, { status: 404 });
        }

        await prisma.scheduledMessage.delete({ where: { id: scheduleId } });
        return NextResponse.json({ status: true, message: "Operação concluída" });

    } catch (error) {
        return NextResponse.json({ status: false, message: "Erro interno do servidor", error: "Erro interno do servidor" }, { status: 500 });
    }
}
