const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const dictionary = new Map(fs.readFileSync(path.join(__dirname, "pt-br.tsv"), "utf8").split(/\r?\n/).filter(Boolean).map((line) => { const i = line.indexOf("|"); return [line.slice(0, i).replaceAll("\\n", "\n"), line.slice(i + 1).replaceAll("\\n", "\n")]; }));
const entities = { sessions: "sessões", session: "sessão", messages: "mensagens", message: "mensagem", contacts: "contatos", groups: "grupos", users: "usuários", user: "usuário", labels: "etiquetas", label: "etiqueta", notifications: "notificações", notification: "notificação", webhook: "webhook", webhooks: "webhooks", "API key": "chave da API", "access list": "lista de acesso", "broadcast detail": "detalhes do disparo", "broadcast history": "histórico de disparos", "favicon config": "configuração do ícone", logs: "registros", metrics: "métricas", "scheduled messages": "mensagens agendadas", "system timezone": "fuso horário", chats: "conversas", "label assignments": "conversas associadas", "media files": "arquivos de mídia", "media:": "mídia:", more: "mais resultados", profile: "perfil", "session details": "detalhes da sessão", "timezones dynamically": "fusos horários", "bot configuration": "configurações do bot", "privacy settings": "configurações de privacidade", "system settings": "configurações do sistema", "auto-replies": "respostas automáticas", "auto-reply": "resposta automática", "profile name": "nome do perfil", status: "status", picture: "foto", "webhook events": "eventos do webhook", files: "arquivos", schedule: "agendamento", "media": "mídia", sticker: "figurinha", "access": "acesso" };
const operations = { fetch: "carregar", load: "carregar", create: "criar", delete: "excluir", update: "atualizar", save: "salvar", send: "enviar", generate: "gerar", assign: "associar", remove: "remover", upload: "enviar", grant: "conceder", revoke: "revogar", test: "testar", check: "verificar", start: "iniciar", register: "cadastrar" };
for (const [noun, translation] of Object.entries(entities)) for (const [verb, action] of Object.entries(operations)) {
  dictionary.set(`Failed to ${verb} ${noun}`, `Não foi possível ${action} ${translation}`);
  dictionary.set(`Error ${verb === "create" ? "creating" : verb === "delete" ? "deleting" : verb === "update" ? "updating" : verb === "save" ? "saving" : verb === "remove" ? "removing" : verb === "assign" ? "assigning" : verb + "ing"} ${noun}`, `Erro ao ${action} ${translation}`);
}
function translate(text, jsx = false) { return dictionary.get(text) || (jsx ? dictionary.get(`jsx:${text}`) : undefined) || text; }
let total = 0;
for (const relative of fs.readdirSync("src", { recursive: true }).filter((f) => /\.tsx?$/.test(f))) {
  const filename = path.join("src", relative);
  const source = fs.readFileSync(filename, "utf8");
  const tree = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, relative.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const edits = [];
  function visit(node) {
    if (ts.isJsxText(node)) {
      const raw = node.getFullText(tree);
      const text = raw.replace(/\s+/g, " ").trim();
      const translated = translate(text, true);
      if (text && translated !== text) edits.push([node.pos, node.end, raw.match(/^\s*/)[0] + translated + raw.match(/\s*$/)[0]]);
    } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const parent = node.parent;
      const protectedNode = ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent) || ts.isImportTypeNode(parent) || ts.isLiteralTypeNode(parent) || (ts.isPropertyAssignment(parent) && parent.name === node);
      const attribute = ts.isJsxAttribute(parent) ? parent.name.getText(tree) : "";
      const protectedAttribute = ["className", "type", "href", "id", "name", "value", "variant", "size", "align", "side", "data-slot", "role"].includes(attribute);
      const value = translate(node.text);
      if (!protectedNode && !protectedAttribute && value !== node.text) edits.push([node.getStart(tree), node.end, JSON.stringify(value)]);
    }
    ts.forEachChild(node, visit);
  }
  visit(tree);
  let result = source;
  for (const [start, end, value] of edits.sort((a, b) => b[0] - a[0])) result = result.slice(0, start) + value + result.slice(end);
  if (edits.length) { fs.writeFileSync(filename, result); total += edits.length; }
}
console.log(`${total} textos traduzidos para pt-BR`);
