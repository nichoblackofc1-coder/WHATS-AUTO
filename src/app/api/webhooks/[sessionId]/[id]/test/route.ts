import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { testWebhook } from "@/lib/webhook";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; id: string }> }
) {
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json({ status: false, message: "Não autenticado", error: "Não autenticado" }, { status: 401 });
    }

    const { sessionId, id } = await params;

    const hasAccess = await canAccessSession(user.id, user.role, sessionId);
    if (!hasAccess) {
        return NextResponse.json({ status: false, message: "Você não tem acesso a esta sessão", error: "Você não tem acesso a esta sessão" }, { status: 403 });
    }

    // Resolve session by either CUID or WhatsApp sessionId
    const session = await prisma.session.findFirst({
        where: {
            OR: [
                { id: sessionId },
                { sessionId: sessionId }
            ]
        },
        select: { id: true }
    });

    if (!session) {
        return NextResponse.json({ status: false, message: "Sessão não encontrada", error: "Sessão não encontrada" }, { status: 404 });
    }

    // Verify webhook access
    const webhook = await prisma.webhook.findFirst({
        where: {
            id,
            OR: [
                { sessionId: session.id },
                { sessionId: null, userId: user.id }
            ]
        }
    });

    if (!webhook) {
        return NextResponse.json({ status: false, message: "Webhook not found", error: "Webhook not found" }, { status: 404 });
    }

    const result = await testWebhook(webhook.id, webhook.url, webhook.secret);

    return NextResponse.json({
        status: true,
        message: result.success ? "Webhook test successful" : "Webhook test failed",
        data: result
    });
}
