import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Não autenticado", error: "Não autenticado" }, { status: 401 });
        }

        // @ts-ignore
        const config = await prisma.systemConfig.findUnique({
            where: { id: "default" }
        });

        return NextResponse.json({ status: true, message: "System config fetched", data: config || { appName: "WA-AKG", faviconUrl: "/favicon.ico" } });
    } catch (error) {
        return NextResponse.json({ status: false, message: "Failed to fetch settings", error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        // @ts-ignore
        const user = await getAuthenticatedUser(req);
        if (!user || user.role !== "SUPERADMIN") {
            return NextResponse.json({ status: false, message: "Não autenticado", error: "Não autenticado" }, { status: 401 });
        }

        const body = await req.json();
        const { appName, logoUrl, faviconUrl, timezone, enableRegistration } = body;
        if (timezone !== undefined) {
            try { new Intl.DateTimeFormat("pt-BR", { timeZone: timezone }).format(); }
            catch { return NextResponse.json({ error: "Fuso horário inválido" }, { status: 400 }); }
        }
        if (enableRegistration !== undefined && typeof enableRegistration !== "boolean") return NextResponse.json({ error: "Configuração de cadastro inválida" }, { status: 400 });
        if (appName !== undefined && (typeof appName !== "string" || !appName.trim())) return NextResponse.json({ error: "Informe o nome da aplicação" }, { status: 400 });

        // @ts-ignore
        const config = await prisma.systemConfig.upsert({
            where: { id: "default" },
            update: { appName, logoUrl, faviconUrl, timezone, enableRegistration },
            create: { id: "default", appName, logoUrl: logoUrl || "", faviconUrl: faviconUrl || "/favicon.ico", timezone: timezone || "America/Fortaleza", enableRegistration: enableRegistration ?? true }
        });

        return NextResponse.json({ status: true, message: "System settings updated", data: config });
    } catch (error) {
        return NextResponse.json({ status: false, message: "Failed to update settings", error: "Failed to update settings" }, { status: 500 });
    }
}
