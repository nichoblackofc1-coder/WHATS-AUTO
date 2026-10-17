import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateApiKey } from "@/lib/api-auth";

// Get current user's API key
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ status: false, message: "Não autenticado", error: "Não autenticado" }, { status: 401 });

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { apiKey: true }
        });

        return NextResponse.json({ status: true, message: "API key fetched", data: { apiKey: user?.apiKey || null } });
    } catch (error) {
        return NextResponse.json({ status: false, message: "Não foi possível carregar chave da API", error: "Não foi possível carregar chave da API" }, { status: 500 });
    }
}

// Generate new API key
export async function POST() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ status: false, message: "Não autenticado", error: "Não autenticado" }, { status: 401 });

    try {
        const newApiKey = generateApiKey();

        await prisma.user.update({
            where: { id: session.user.id },
            data: { apiKey: newApiKey }
        });

        return NextResponse.json({ status: true, message: "API key generated", data: { apiKey: newApiKey } });
    } catch (error) {
        console.error("Generate API key error:", error);
        return NextResponse.json({ status: false, message: "Não foi possível gerar chave da API", error: "Não foi possível gerar chave da API" }, { status: 500 });
    }
}

// Delete/revoke API key
export async function DELETE() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ status: false, message: "Não autenticado", error: "Não autenticado" }, { status: 401 });

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { apiKey: null }
        });

        return NextResponse.json({ status: true, message: "API key revoked" });
    } catch (error) {
        return NextResponse.json({ status: false, message: "Não foi possível revogar chave da API", error: "Não foi possível revogar chave da API" }, { status: 500 });
    }
}
