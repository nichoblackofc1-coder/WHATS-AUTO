import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json({ status: false, message: "Não autenticado", error: "Não autenticado" }, { status: 401 });
    }

    const { sessionId } = await params;

    // Verify access to session
    const hasAccess = await canAccessSession(user.id, user.role, sessionId);
    if (!hasAccess) {
        return NextResponse.json({ status: false, message: "Você não tem acesso a esta sessão", error: "Você não tem acesso a esta sessão" }, { status: 403 });
    }

    try {
        // Resolve session string ID to internal ID if needed, or just look up webhooks
        // We need the internal ID to query the Webhook table
        const session = await prisma.session.findUnique({
            where: { sessionId: sessionId },
            select: { id: true }
        });

        if (!session) {
            return NextResponse.json({ status: false, message: "Sessão não encontrada", error: "Sessão não encontrada" }, { status: 404 });
        }

        const webhooks = await prisma.webhook.findMany({
            where: {
                OR: [
                    { sessionId: session.id }, // Specific to this session (anyone who created it)
                    { sessionId: null, userId: user.id } // User's own global webhooks
                ]
            },
            include: {
                session: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ status: true, message: "Webhooks retrieved successfully", data: webhooks });
    } catch (error) {
        console.error("Fetch webhooks error:", error);
        return NextResponse.json({ status: false, message: "Não foi possível carregar webhooks", error: "Não foi possível carregar webhooks" }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json({ status: false, message: "Não autenticado", error: "Não autenticado" }, { status: 401 });
    }

    const { sessionId } = await params;

    const hasAccess = await canAccessSession(user.id, user.role, sessionId);
    if (!hasAccess) {
        return NextResponse.json({ status: false, message: "Você não tem acesso a esta sessão", error: "Você não tem acesso a esta sessão" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { name, url, secret, events } = body;

        if (!name || !url || !events || events.length === 0) {
            return NextResponse.json({ status: false, message: "Informe nome, URL e pelo menos um evento", error: "Informe nome, URL e pelo menos um evento" }, { status: 400 });
        }

        const session = await prisma.session.findUnique({
            where: { sessionId: sessionId },
            select: { id: true }
        });

        if (!session) {
            return NextResponse.json({ status: false, message: "Sessão não encontrada", error: "Sessão não encontrada" }, { status: 404 });
        }

        const webhook = await prisma.webhook.create({
            data: {
                userId: user.id,
                name,
                url,
                secret: secret || null,
                sessionId: session.id, // Strictly link to this session
                events,
                isActive: true
            }
        });

        return NextResponse.json({ status: true, message: "Webhook created successfully", data: webhook });
    } catch (error: any) {
        console.error("Create webhook error detailed:", error);
        return NextResponse.json({ status: false, message: "Não foi possível criar webhook", error: "Não foi possível criar webhook", details: error.message }, { status: 500 });
    }
}
