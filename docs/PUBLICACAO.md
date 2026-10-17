# Publicação

Este sistema precisa de um processo Node.js permanente, PostgreSQL e disco persistente para `data/`. GitHub hospeda o código; GitHub Pages não executa este servidor, WebSockets ou as sessões WhatsApp.

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
