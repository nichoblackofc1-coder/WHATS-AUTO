import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { createGroupSchema } from "@/lib/validations";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// POST: Create a new group
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Não autenticado", error: "Não autenticado" }, { status: 401 });
        }

        const { sessionId } = await params;
        const body = await request.json();

        // Inject sessionId into body for validation using existing schema
        const payload = { ...body, sessionId };

        const parseResult = createGroupSchema.safeParse(payload);
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.flatten() }, { status: 400 });
        }

        const { subject, participants } = parseResult.data;

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Você não tem acesso a esta sessão", error: "Você não tem acesso a esta sessão" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance?.socket) {
            return NextResponse.json({ status: false, message: "Session not ready", error: "Session not ready" }, { status: 503 });
        }

        const group = await instance.socket.groupCreate(subject, participants);

        return NextResponse.json({ status: true, message: "Operação concluída", data: { group } });

    } catch (e) {
        console.error("Create group error", e);
        return NextResponse.json({ status: false, message: "Failed to create group", error: "Failed to create group" }, { status: 500 });
    }
}
