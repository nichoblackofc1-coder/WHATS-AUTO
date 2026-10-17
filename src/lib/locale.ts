const labels: Record<string, string> = {
  CONNECTED: "Conectado", DISCONNECTED: "Desconectado", CONNECTING: "Conectando", STOPPED: "Parado", LOGGED_OUT: "Desconectado", ZOMBIE: "Reconexão necessária",
  PENDING: "Pendente", SENT: "Enviado", DELIVERED: "Entregue", READ: "Lido", FAILED: "Falhou", COMPLETED: "Concluído", PROCESSING: "Processando", RUNNING: "Em execução", CANCELLED: "Cancelado",
  SUPERADMIN: "Administrador", OWNER: "Proprietário", STAFF: "Colaborador", TEXT: "Texto", IMAGE: "Imagem", VIDEO: "Vídeo", AUDIO: "Áudio", DOCUMENT: "Documento", STICKER: "Figurinha", LOCATION: "Localização", CONTACT: "Contato",
  image: "Imagem", video: "Vídeo", audio: "Áudio", document: "Documento", sticker: "Figurinha", EXACT: "Correspondência exata", CONTAINS: "Contém", REGEX: "Expressão regular", ALL: "Todos", GROUP: "Grupo", PRIVATE: "Privado",
};
export function formatLabel(value: unknown): string {
  const text = String(value ?? "");
  return labels[text] || text;
}
