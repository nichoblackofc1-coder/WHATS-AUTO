import "../src/server/env";
import assert from "node:assert/strict";
import { toWhatsAppJid } from "../src/lib/phone";
import { encryptGateway, decryptGateway, needsGateway } from "../src/lib/gateway-queue";
import { ChatService } from "../src/modules/whatsapp/chat.service";
import { prisma } from "../src/lib/prisma";

async function main() {
  assert.equal(toWhatsAppJid("(88) 98125-7878"), "5588981257878@s.whatsapp.net");
  assert.equal(toWhatsAppJid("+55 88 98125-7878"), "5588981257878@s.whatsapp.net");
  assert.equal(toWhatsAppJid("120363999@g.us"), "120363999@g.us");
  assert.equal(toWhatsAppJid("123456@lid"), "123456@lid");
  assert.equal(toWhatsAppJid("628123456789@s.whatsapp.net"), "628123456789@s.whatsapp.net");
  assert.equal(toWhatsAppJid("5588981257878@c.us"), "5588981257878@s.whatsapp.net");
  assert.throws(() => toWhatsAppJid("abc"));
  const request = { path: "/api/sessions", method: "GET", headers: { cookie: "private" }, body: null };
  const encrypted = encryptGateway(request);
  assert.ok(!encrypted.includes("private"));
  assert.deepEqual(decryptGateway(encrypted), request);
  const corrupted = Buffer.from(encrypted, "base64"); corrupted[30] ^= 1;
  assert.throws(() => decryptGateway(corrupted.toString("base64")));
  assert.equal(needsGateway("/api/messages/session/jid/send", "POST"), true);
  assert.equal(needsGateway("/api/sessions/session/start", "POST"), true);
  assert.equal(needsGateway("/api/sessions", "POST"), true);
  assert.equal(needsGateway("/api/sessions", "GET"), false);
  assert.equal(needsGateway("/api/contacts/session", "GET"), false);
  assert.equal(needsGateway("/api/media/private.jpg", "GET"), false);
  console.log("PASS identificação brasileira, grupos, LID, criptografia e roteamento");
  if (process.env.TEST_DATABASE === "true") {
    const session = await prisma.session.findFirst({ select: { id: true } });
    assert.ok(session, "Uma sessão existente é necessária para a regressão PostgreSQL");
    const chats = await ChatService.getChatsList(session.id, 5);
    assert.ok(chats.length <= 5);
    assert.equal(new Set(chats.map(chat => chat.jid)).size, chats.length);
    const noMatches = await ChatService.getChatsList(session.id, 5, undefined, "' OR 1=1 -- nonexistent");
    assert.equal(noMatches.length, 0);
    const oldChats = await ChatService.getChatsList(session.id, 5, "2000-01-01T00:00:00Z");
    assert.equal(oldChats.length, 0);
    if (chats[0]) {
      const result = await ChatService.getMessages(session.id, chats[0].jid, 5);
      assert.ok(result.messages.length <= 5);
    }
    console.log("PASS consultas PostgreSQL, busca parametrizada, paginação e leitura de mensagens");
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
