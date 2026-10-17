import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import moment from "moment-timezone";
import cronParser from "cron-parser";
import { toWhatsAppJid } from "@/lib/phone";

// GET: List Scheduled Messages
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;

        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Não autenticado", error: "Não autenticado" }, { status: 401 });
        }

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Você não tem acesso a esta sessão", error: "Você não tem acesso a esta sessão" }, { status: 403 });
        }

        const session = await prisma.session.findUnique({
            where: { sessionId: sessionId },
            select: { id: true }
        });

        if (!session) {
            return NextResponse.json({ status: false, message: "Sessão não encontrada", error: "Sessão não encontrada" }, { status: 404 });
        }

        const url = new URL(request.url);
        const tab = url.searchParams.get("tab") || "pending";

        const whereClause: any = { sessionId: session.id };
        let orderByClause: any = { sendAt: 'asc' };

        if (tab === "history") {
            whereClause.status = { in: ["SENT", "FAILED"] };
            orderByClause = { sendAt: 'desc' };
        } else {
            whereClause.status = "PENDING";
        }

        const messages = await prisma.scheduledMessage.findMany({
            where: whereClause,
            include: { session: true },
            orderBy: orderByClause
        });

        return NextResponse.json({ status: true, message: "Scheduled messages retrieved successfully", data: messages });

    } catch (error) {
        return NextResponse.json({ status: false, message: "Erro interno do servidor", error: "Erro interno do servidor" }, { status: 500 });
    }
}

// POST: Create Scheduled Message
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;

        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Não autenticado", error: "Não autenticado" }, { status: 401 });
        }

        const body = await request.json();
        const { jid, content, sendAt, mediaUrl, mediaType, cronExpression, recurrenceRule } = body;

        if (!jid || (!content && !mediaUrl) || !sendAt) {
            return NextResponse.json({ status: false, message: "Missing required fields (JID, Content/Media, SendAt)", error: "Preencha os campos obrigatórios" }, { status: 400 });
        }

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Você não tem acesso a esta sessão", error: "Você não tem acesso a esta sessão" }, { status: 403 });
        }

        const session = await prisma.session.findUnique({
            where: { sessionId: sessionId },
            select: { id: true }
        });

        if (!session) {
            return NextResponse.json({ status: false, message: "Sessão não encontrada", error: "Sessão não encontrada" }, { status: 404 });
        }

        // Fetch system timezone
        // @ts-ignore
        const systemConfig = await prisma.systemConfig.findUnique({ where: { id: "default" } });
        const timezone = systemConfig?.timezone || "America/Fortaleza";

        console.log(`[Scheduler:POST] Received sendAt: ${sendAt}, using timezone: ${timezone}`);
        const utcDate = moment.tz(sendAt, timezone).toDate();
        if (Number.isNaN(utcDate.getTime())) return NextResponse.json({ error: "Data de envio inválida" }, { status: 400 });
        let normalizedJid: string;
        try {
            normalizedJid = toWhatsAppJid(jid);
            if (cronExpression) cronParser.parse(cronExpression, { tz: timezone });
        } catch { return NextResponse.json({ error: "Destinatário ou expressão de recorrência inválidos" }, { status: 400 }); }
        console.log(`[Scheduler:POST] Resolved UTC Date: ${utcDate.toISOString()}`);

        const scheduled = await prisma.scheduledMessage.create({
            data: {
                sessionId: session.id,
                jid: normalizedJid,
                content,
                mediaUrl,
                mediaType,
                cronExpression,
                recurrenceRule,
                sendAt: utcDate,
                status: "PENDING"
            }
        });

        return NextResponse.json({ status: true, message: "Message scheduled successfully", data: scheduled });

    } catch (error) {
        console.error("Schedule error:", error);
        return NextResponse.json({ status: false, message: "Erro interno do servidor", error: "Erro interno do servidor" }, { status: 500 });
    }

}

