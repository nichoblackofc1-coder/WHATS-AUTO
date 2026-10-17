import { auth } from "@/lib/auth";
import { gatewayIsOnline, usesGatewayWorker } from "@/lib/gateway-queue";

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Não autenticado" }, { status: 401 });
  const online = usesGatewayWorker() ? await gatewayIsOnline() : process.env.WHATSAPP_ENABLED !== "false";
  return Response.json({ online, transport: usesGatewayWorker() ? "polling" : "socket", message: online ? "Serviço WhatsApp disponível" : "O serviço WhatsApp está iniciando ou indisponível" });
}
