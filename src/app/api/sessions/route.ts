import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, getAccessibleSessions } from "@/lib/api-auth";

export const dynamic = 'force-dynamic';

// GET: Fetch sessions (filtered by user role)
export async function GET(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Não autenticado", error: "Não autenticado" }, { status: 401 });
        }

        // Get sessions based on user role
        const sessions = await getAccessibleSessions(user.id, user.role);
        return NextResponse.json({ status: true, message: "Sessions retrieved successfully", data: sessions });
    } catch (error) {
        console.error("Get sessions error:", error);
        return NextResponse.json({ status: false, message: "Não foi possível carregar sessões", error: "Não foi possível carregar sessões" }, { status: 500 });
    }
}

// POST: Create new session (always for the authenticated user)
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Não autenticado", error: "Não autenticado" }, { status: 401 });
        }

        const body = await request.json();
        const { name, sessionId } = body;

        if (!name) {
            return NextResponse.json({ status: false, message: "Informe o nome da sessão", error: "Informe o nome da sessão" }, { status: 400 });
        }

        // Create session for the authenticated user
        const session = await waManager.createSession(user.id, name, sessionId);
        return NextResponse.json({ status: true, message: "Sessão criada com sucesso", data: session });
    } catch (error) {
        console.error("Create session error:", error);
        return NextResponse.json({ status: false, message: "Não foi possível criar sessão", error: "Não foi possível criar sessão" }, { status: 500 });
    }
}
