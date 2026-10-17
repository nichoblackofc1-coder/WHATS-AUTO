"use client";
import { useEffect, useState } from "react";
import { usesPolling } from "@/lib/realtime-client";

export function GatewayStatus() {
  const [online, setOnline] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    async function check() {
      try {
        const response = await fetch("/api/gateway/status", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (active) setOnline(data.online);
      } catch { if (active) setOnline(false); }
    }
    check();
    const timer = setInterval(check, 15000);
    return () => { active = false; clearInterval(timer); };
  }, []);
  if (!usesPolling || online !== false) return null;
  return <div role="status" className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-100">O serviço do WhatsApp está iniciando ou indisponível. Você pode consultar conversas e contatos salvos. Aguarde antes de enviar mensagens.</div>;
}
