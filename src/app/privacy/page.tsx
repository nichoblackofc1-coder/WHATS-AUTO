import Link from "next/link";
import { ArrowLeft, Lock, Shield } from "lucide-react";

export const metadata = {
    title: "Privacy Policy | WA-AKG",
    description: "Privacy Policy for WA-AKG self-hosted WhatsApp Gateway. Zero-tracking architecture, data ownership, and security practices.",
    openGraph: {
        title: "Privacy Policy | WA-AKG",
        description: "Privacy Policy for WA-AKG self-hosted WhatsApp Gateway.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Privacy Policy | WA-AKG",
        description: "Privacy Policy for WA-AKG self-hosted WhatsApp Gateway.",
    },
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden py-24 selection:bg-primary/30 selection:text-primary-foreground">
            {/* Ambient background glows */}
            <div className="fixed top-0 right-1/4 translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 left-1/4 -translate-x-1/2 translate-y-1/2 w-[30rem] h-[30rem] bg-emerald-500/5 dark:bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

            <div className="container max-w-4xl px-4 mx-auto relative z-10">

                <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors group">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Voltar ao início
                </Link>

                <div className="glass-panel p-8 md:p-12 rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-blue-500/10 rounded-2xl">
                            <Shield className="h-8 w-8 text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">Política de privacidade</h1>
                            <p className="text-muted-foreground mt-2">Vigência: {new Date().toLocaleDateString("pt-BR")}</p>
                        </div>
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80 prose-p:leading-relaxed">

                        <p className="lead text-lg text-muted-foreground mb-8">
                            Seus dados pertencem a você. Esta política descreve como as informações são tratadas ao usar esta central do WhatsApp de código aberto.
                        </p>

                        <h2 className="flex items-center gap-2 mt-8 text-2xl border-b pb-2">
                            <Lock className="h-6 w-6 text-blue-500" />
                            1. Arquitetura sem rastreamento
                        </h2>
                        <p>
                            Como o WA-AKG foi desenvolvido para <strong>hospedagem própria</strong>, o processamento dos dados ocorre na infraestrutura em que a aplicação é instalada.
                        </p>
                        <ul>
                            <li><strong>Sem telemetria centralizada:</strong> Os criadores do WA-AKG não recebem telemetria nem relatórios sobre suas conversas no WhatsApp.</li>
                            <li><strong>Controle dos dados:</strong> Seus contatos, mensagens, agendamentos e respostas automáticas permanecem no banco configurado na sua instalação.</li>
                        </ul>

                        <h2 className="mt-8 text-2xl border-b pb-2">2. Dados processados na sua instalação</h2>
                        <p>
                            Ao instalar a aplicação, os seguintes dados são processados:
                        </p>
                        <ul>
                            <li><strong>Credenciais de autenticação:</strong> As senhas do painel são protegidas com bcrypt antes de serem armazenadas no banco da sua instalação.</li>
                            <li><strong>Sessões do WhatsApp:</strong> O WA-AKG se conecta ao WhatsApp Web. As credenciais necessárias para manter a conexão são armazenadas no banco da sua instalação.</li>
                            <li><strong>Registros de comunicação:</strong> As mensagens enviadas e recebidas são registradas no banco da sua instalação para oferecer histórico e integração por webhooks.</li>
                        </ul>

                        <h2 className="mt-8 text-2xl border-b pb-2">3. Proteção das suas informações</h2>
                        <p>
                            A proteção dos dados depende do ambiente de hospedagem. Recomendamos:
                        </p>
                        <ul>
                            <li>Publicar a aplicação atrás de um proxy com <strong>criptografia SSL/TLS</strong> (HTTPS).</li>
                            <li>Proteger o servidor com firewall e autenticação SSH por chave.</li>
                            <li>Manter o sistema operacional e o Node.js atualizados.</li>
                        </ul>

                        <h2 className="mt-8 text-2xl border-b pb-2">4. Integrações com terceiros</h2>
                        <p>
                            O WA-AKG utiliza a biblioteca <code>@whiskeysockets/baileys</code> para se comunicar com os servidores do WhatsApp por WebSocket. O uso do WhatsApp continua sujeito à política de privacidade da Meta.
                        </p>

                        <div className="mt-12 p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                            <p className="font-semibold mb-2">Precisa de mais detalhes?</p>
                            <p className="text-sm text-muted-foreground mb-0">Para esclarecer dúvidas sobre os dados ou auditar o código, visite nosso <Link href="https://github.com/mrifqidaffaaditya/WA-AKG">Repositório no GitHub</Link>.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
