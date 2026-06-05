class ChatDto {
  constructor({ id, title, createdAt, updatedAt }) {
    this.id = id;
    this.title = title;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

class MessageDto {
  constructor({ id, role, type, content, sources, file, createdAt }) {
    this.id = id;
    this.role = role;
    this.type = type;
    this.content = content;
    this.sources = sources;
    this.file = file;
    this.createdAt = createdAt;
  }
}

function formatDate(value) {
  if (!value) return null;

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  return value;
}

function toChatDto(chat) {
  return new ChatDto({
    id: chat.id,
    title: chat.title,
    createdAt: formatDate(chat.createdAt),
    updatedAt: formatDate(chat.updatedAt),
  });
}

function toMessageDto(message) {
  return new MessageDto({
    id: message.id,
    role: message.role,
    type: message.type || "text",
    content: message.content || "",
    sources: message.sources || [],
    file: message.file || null,
    createdAt: formatDate(message.createdAt),
  });
}

module.exports = {
  toChatDto,
  toMessageDto,
};

