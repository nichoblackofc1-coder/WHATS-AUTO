"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import Link from "next/link";

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b px-6 py-4">
        <h1 className="text-xl font-semibold">Documentação interativa da API</h1>
        <p className="text-sm text-slate-600">Use sua sessão do painel ou uma chave de API. Os testes executam operações reais.</p>
        <Link href="/dashboard" className="text-sm text-emerald-700">Voltar ao painel</Link>
      </header>
      <SwaggerUI url="/api/docs" persistAuthorization={false} />
    </main>
  );
}