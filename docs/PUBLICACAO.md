# Publicação

Este sistema precisa de um processo Node.js permanente, PostgreSQL e disco persistente para `data/`. GitHub hospeda o código; GitHub Pages não executa este servidor, WebSockets ou as sessões WhatsApp.

## Vercel com serviço contínuo

O `vercel.json` publica o painel Next.js e um Daemon chamado `whatsapp`, construído pelo `Dockerfile.worker`. Configure `DATABASE_URL` e `AUTH_SECRET` como segredos do ambiente Production. O processo contínuo recebe as mesmas variáveis de produção.

O worker cria apenas as tabelas auxiliares `GatewayJob` e `GatewayMedia`, sem alterar usuários, mensagens ou credenciais existentes. Uma reserva no banco impede duas instâncias de manter a mesma conta conectada durante atualizações. O painel encaminha operações para uma fila criptografada; as rotas continuam verificando o usuário e o acesso à sessão. Conversas e notificações são atualizadas por consultas periódicas.

As mídias novas ficam no PostgreSQL para sobreviver a reinícios. Arquivos antigos que existiam somente na máquina local não são enviados automaticamente. Arquivos enviados pela Vercel devem ficar abaixo de 4 MB. O processamento e o armazenamento usam as cotas da conta; consulte o painel do provedor para acompanhar o consumo.

Depois de publicar, verifique se o Daemon está ativo e se `/api/gateway/status`, com uma sessão autenticada, retorna `online: true`. Sessões anteriormente conectadas são retomadas. Sessões paradas ou desconectadas manualmente exigem iniciar novamente pelo painel. Agendamentos existentes podem ser enviados quando suas sessões estiverem conectadas.

## Servidor com Docker

1. Clone o repositório e copie `.env.example` para `.env`.
2. Configure `POSTGRES_PASSWORD` (use uma senha hexadecimal), `AUTH_SECRET` (32 bytes aleatórios), `BASE_URL` e `NEXTAUTH_URL` com o domínio HTTPS final. Configure `PORT` com a porta desejada no host. Não reutilize credenciais dos exemplos.
3. Configure `ADMIN_EMAIL` e `ADMIN_PASSWORD` para criar o administrador inicial.
4. Execute `docker compose up -d --build`.
5. Configure um proxy HTTPS apontando para a porta da aplicação, com suporte a WebSocket no caminho `/api/socket/io`. Não exponha o banco publicamente.
6. Faça backup do banco e dos volumes `app_data` e `uploads_data`. Conecte o WhatsApp pelo painel.

O Compose usa seu próprio PostgreSQL. Para um banco externo, altere a configuração `DATABASE_URL` do serviço `app` e retire sua dependência de `db`. Não copie sessões locais nem o banco de produção para a imagem.

## Execução sem Docker

Use Node.js 22 ou superior. Configure `DATABASE_URL` e `AUTH_SECRET` no ambiente ou no `.env`, então execute:

```sh
npm ci --legacy-peer-deps
npm run db:push
npm run build
npm run make-admin -- admin@exemplo.com SENHA_FORTE
npm start
```

`db:push` altera o esquema do banco: faça backup antes de atualizar uma instalação existente. Use um gerenciador de processos para reiniciar o serviço em caso de falha.

## Credenciais

Uma credencial de banco estava gravada no código anterior. Ela foi removida dos arquivos atuais, mas deve ser trocada no provedor, pois versões antigas permanecem no histórico Git. Nunca publique `.env`, chaves, backups, mídias ou sessões do WhatsApp.

## Verificação

Execute `npx tsc --noEmit` e `npm run build`. Com o servidor iniciado, `node scripts/smoke-test.cjs` verifica páginas públicas e bloqueio de APIs e dashboard sem autenticação. Esses testes não enviam mensagens nem validam integrações externas pagas.

Para validar a interface sem conectar contas WhatsApp nem executar agendamentos, defina `WHATSAPP_ENABLED=false` ao iniciar. Remova essa opção para a operação normal. A aplicação ativa pode executar agendamentos existentes ao iniciar.
