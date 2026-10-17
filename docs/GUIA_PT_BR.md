# Guia do WA-AKG

Gerencie contas do WhatsApp, conversas, contatos, respostas automáticas e agendamentos em um único painel.

## Primeiros passos

### Entrar no painel

Acesse a página de login e informe o e-mail e a senha da sua conta. Cada usuário acessa suas sessões e as sessões compartilhadas com ele. Administradores também podem gerenciar usuários e configurações globais.

### Conectar o WhatsApp

Abra **Sessões / QR Code**, crie uma sessão e clique em **Iniciar sessão**. No telefone, abra o WhatsApp, entre em **Dispositivos conectados** e leia o QR Code. Também é possível usar um código de conexão quando disponível.

Selecione a sessão na barra superior antes de abrir contatos, conversas ou automações. Se o serviço estiver iniciando, aguarde a atualização do status.

## Conversas e contatos

### Abrir uma conversa

Na página **Conversas**, selecione um contato ou inicie uma conversa com um telefone. Números brasileiros podem ser informados com DDD, por exemplo `(88) 98125-7878`. Para números internacionais, inclua o código do país. Identificadores de grupos e LID são preservados.

### Enviar mensagens e mídias

Digite a mensagem e pressione Enter. Use Shift+Enter para uma quebra de linha. É possível responder, copiar, excluir mensagens e anexar imagens, vídeos, áudios ou documentos. Na publicação Vercel, mantenha os arquivos enviados abaixo de 4 MB.

Envios exigem uma sessão conectada. Se uma operação demorar, confira a conversa antes de repetir para evitar mensagens duplicadas. A interface publicada atualiza os dados periodicamente.

### Organizar com etiquetas

Crie etiquetas coloridas na página **Etiquetas** e associe conversas. Os contatos e históricos já sincronizados ficam disponíveis para consulta mesmo quando a sessão está desconectada.

## Automações

### Respostas automáticas

Crie uma palavra-chave, escolha o tipo de correspondência e escreva a resposta ou informe uma mídia. Defina se a regra responde a conversas privadas, grupos ou ambos. Expressões regulares devem ser válidas.

### Agendamentos

Informe o destinatário, texto ou mídia, data e hora. Use um envio único ou uma recorrência. O horário considera o fuso configurado no sistema. Novas instalações usam `America/Fortaleza` como padrão.

Agendamentos são executados pelo serviço contínuo do WhatsApp. Uma sessão desconectada precisa ser reconectada para enviar mensagens.

### Disparos em massa

Selecione os destinatários e configure os intervalos de envio. Acompanhe o resultado no histórico. O controle de frequência não garante proteção contra restrições do WhatsApp. Confira o histórico antes de repetir uma campanha com resposta demorada.

## Integrações por API

### Autenticação

As APIs aceitam a sessão do painel ou uma chave no cabeçalho `X-API-Key`. Gere a chave pela interface, mantenha-a em segredo e não a inclua em URLs ou código público. Gerar outra chave invalida a anterior.

```sh
curl https://SEU_DOMINIO/api/sessions -H "X-API-Key: SUA_CHAVE"
```

### Rotas principais

| Método | Rota | Finalidade |
| --- | --- | --- |
| GET | `/api/sessions` | Listar sessões acessíveis |
| POST | `/api/sessions` | Criar uma sessão |
| POST | `/api/sessions/{sessao}/start` | Conectar uma sessão |
| GET | `/api/contacts/{sessao}` | Consultar contatos |
| GET | `/api/chat/{sessao}` | Consultar conversas |
| POST | `/api/messages/{sessao}/{jid}/send` | Enviar mensagem |
| POST | `/api/messages/{sessao}/{jid}/media` | Enviar mídia por formulário |
| GET | `/api/scheduler/{sessao}` | Consultar agendamentos |
| POST | `/api/scheduler/{sessao}` | Agendar mensagem |
| GET | `/api/webhooks/{sessao}` | Consultar webhooks |

Consulte a especificação em `/api/docs` e os testes interativos em `/swagger` para os campos de cada rota. Preserve nomes técnicos como `sessionId`, `jid`, `message` e os estados retornados pela API.

### Webhooks

Cadastre uma URL HTTPS, selecione os eventos e configure um segredo de assinatura quando necessário. Consulte os registros de entrega para verificar a resposta do servidor de destino. O botão **Testar** envia uma solicitação real à URL cadastrada.

## Administração e funcionamento

### Usuários e acesso compartilhado

Administradores gerenciam usuários. Proprietários podem compartilhar suas sessões. Revogar o acesso impede novas consultas e operações do usuário naquela sessão.

### Serviço do WhatsApp

Na Vercel, um processo contínuo mantém as conexões e executa os agendamentos. As funções do painel encaminham as operações autenticadas por uma fila criptografada no PostgreSQL. Apenas uma instância mantém as sessões ativas.

O serviço usa as variáveis de produção `DATABASE_URL` e `AUTH_SECRET`. Credenciais de conexão e mídias novas ficam no banco, permanecendo disponíveis após reinícios. O armazenamento e o processamento seguem as cotas do seu provedor.

### Solução de problemas

- **Não autenticado:** entre novamente na sua conta.
- **Sessão desconectada:** abra a sessão e reconecte pelo telefone.
- **Serviço iniciando:** aguarde a atualização do status. Administradores podem verificar os logs do processo contínuo na Vercel.
- **Operação demorada:** confira o histórico antes de repetir um envio.
- **Arquivo antigo não encontrado:** mídias que existiam apenas em outra máquina não são transferidas automaticamente para a hospedagem.
