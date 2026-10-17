import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

export async function PUT(
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

    try {
        const body = await request.json();
        const { name, url, secret, events, isActive } = body;

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

        // Verify ownership and session context
        const existing = await prisma.webhook.findFirst({
            where: {
                id,
                OR: [
                    { sessionId: session.id },
                    { sessionId: null, userId: user.id }
                ]
            }
        });

        if (!existing) {
            return NextResponse.json({ status: false, message: "Webhook not found", error: "Webhook not found" }, { status: 404 });
        }

        const webhook = await prisma.webhook.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(url !== undefined && { url }),
                ...(secret !== undefined && { secret }),
                ...(events !== undefined && { events }),
                ...(isActive !== undefined && { isActive })
            }
        });

        return NextResponse.json(webhook);
    } catch (error) {
        console.error("Update webhook error:", error);
        return NextResponse.json({ status: false, message: "Não foi possível atualizar webhook", error: "Não foi possível atualizar webhook" }, { status: 500 });
    }
}

export async function DELETE(
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

    try {
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

        const existing = await prisma.webhook.findFirst({
            where: {
                id,
                OR: [
                    { sessionId: session.id },
                    { sessionId: null, userId: user.id }
                ]
            }
        });

        if (!existing) {
            return NextResponse.json({ status: false, message: "Webhook not found", error: "Webhook not found" }, { status: 404 });
        }

        await prisma.webhook.delete({ where: { id } });

        return NextResponse.json({ status: true, message: "Operação concluída" });
    } catch (error) {
        console.error("Delete webhook error:", error);
        return NextResponse.json({ status: false, message: "Não foi possível excluir webhook", error: "Não foi possível excluir webhook" }, { status: 500 });
    }
}
