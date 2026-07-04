const { formatFirestoreDate } = require("../utils/dateUtils");

class QuestionChatDto {
  constructor({ id, title, createdAt, updatedAt }) {
    this.id = id;
    this.title = title;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

class QuestionMessageDto {
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

function questionChatDto(chat) {
  return new QuestionChatDto({
    id: chat.id,
    title: chat.title,
    createdAt: formatFirestoreDate(chat.createdAt),
    updatedAt: formatFirestoreDate(chat.updatedAt),
  });
}

function questionMessageDto(message) {
  return new QuestionMessageDto({
    id: message.id,
    role: message.role,
    type: message.type || "text",
    content: message.content || "",
    sources: message.sources || [],
    file: message.file || null,
    createdAt: formatFirestoreDate(message.createdAt),
  });
}

module.exports = {
  questionChatDto,
  questionMessageDto,
};