/** Normalize a phone number or preserve an existing WhatsApp identifier. */
export function toWhatsAppJid(input: string): string {
  const value = input.trim();
  if (/^[\w.-]+@(s\.whatsapp\.net|g\.us|lid|broadcast|newsletter)$/.test(value)) return value;
  if (/^\d+@c\.us$/.test(value)) return value.replace("@c.us", "@s.whatsapp.net");
  if (value.includes("@") || /[a-z]/i.test(value)) throw new Error("Número ou identificador do WhatsApp inválido");
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  if (digits.length < 10 || digits.length > 15) throw new Error("Informe o telefone com DDD e código do país");
  return `${digits}@s.whatsapp.net`;
}
