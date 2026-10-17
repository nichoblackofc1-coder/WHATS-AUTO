# Validação da publicação — 16/10/2026

## Revisão funcional e português do Brasil

- Interface, validações, estados e erros principais traduzidos para pt-BR, com guia de uso em português em `/docs`.
- Chat corrigido para PostgreSQL com busca parametrizada; telefones brasileiros recebem código 55 e JIDs de grupos/LID são preservados nas URLs.
- Download de mídias corrigido para usar o identificador de banco da sessão e armazenamento persistente.
- Testes `scripts/test-core.ts`: números, grupos, criptografia autenticada, roteamento, consultas PostgreSQL, busca e paginação aprovados.
- Testes `scripts/test-gateway.ts`: APIs autenticadas pela fila, rejeição de acesso sem autenticação e mídia persistente aprovados. O arquivo temporário de teste foi removido.
- Os 34 testes básicos e de páginas autenticadas passaram após as alterações. A ponte foi testada com `WHATSAPP_ENABLED=false`, sem envios reais.
- O agendador respeita o fuso configurado e não inicia em builds ou em funções do painel. Sessões paradas não são retomadas automaticamente.

O resultado operacional do serviço contínuo também deve ser verificado na Vercel após o deploy; passar no build não substitui essa verificação.

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
