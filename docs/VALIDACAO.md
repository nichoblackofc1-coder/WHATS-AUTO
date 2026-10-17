# Validação da publicação — 16/10/2026

- `npm run build`: compilação de produção, validação TypeScript e geração de páginas concluídas.
- `npx tsc --noEmit`: aprovado após as alterações no servidor.
- `node scripts/smoke-test.cjs`: 9 verificações aprovadas, incluindo páginas públicas, proteção de dashboard/APIs e rejeição de socket sem autenticação.
- `node scripts/verify-authenticated.cjs`: 25 verificações aprovadas (20 páginas do painel, 4 APIs de leitura e conexão WebSocket autenticada). Esse script usa a configuração local e emite em memória um token temporário de um administrador existente; não valida a senha nem o fluxo de login pelo navegador. Execute somente em uma instalação local de confiança.
- O servidor foi testado com `WHATSAPP_ENABLED=false`, sem carregar contas WhatsApp ou iniciar agendamentos.

## Limites da validação

Envios reais de mensagens, campanhas, recorrências, chamadas de webhooks e integrações externas não foram executados. A imagem Docker foi ajustada, mas não construída neste ambiente, que não possui Docker disponível. A validação HTTP não verifica toda interação visual no navegador.

O lint inicial identificou 295 erros preexistentes, principalmente `any`, comentários TypeScript e regras de estilo/efeitos React. Esses itens não foram ocultados nem desativados; permanecem para uma revisão de qualidade específica.

## Correções

Removidos monitoramento externo automático e credenciais embutidas; banco configurável por ambiente; Compose alinhado com PostgreSQL; execução de produção compatível com Windows; Webpack para evitar a falha local do Turbopack; exportação inválida na página de etiquetas corrigida; segredo obrigatório em produção; chaves API geradas com aleatoriedade criptográfica; autenticação e autorização nas salas WebSocket; agendador único iniciado pelo servidor e recorrências com o fuso configurado.

A senha de banco presente no histórico anterior deve ser trocada no provedor. Publicar o repositório não provisiona um servidor ou domínio; veja `PUBLICACAO.md`.
