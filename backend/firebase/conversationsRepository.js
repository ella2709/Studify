const { db, admin } = require("./firebase");

const DEFAULT_USER_ID = "defaultUser";
const DEFAULT_PROJECT_ID = "defaultProject";

function getConversationChatsCollection(type) {
  return db
    .collection("users")
    .doc(DEFAULT_USER_ID)
    .collection("projects")
    .doc(DEFAULT_PROJECT_ID)
    .collection("conversations")
    .doc(type)
    .collection("chats");
}

async function createChat(type, title) {
  const chatRef = getConversationChatsCollection(type).doc();

  await chatRef.set({
    title,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    id: chatRef.id,
    title,
  };
}

async function addMessageToChat(type, chatId, message) {
  const chatRef = getConversationChatsCollection(type).doc(chatId);

  await chatRef.collection("messages").add({
    ...message,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await chatRef.update({
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function getChats(type) {
  const snapshot = await getConversationChatsCollection(type)
    .orderBy("updatedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function getChatMessages(type, chatId) {
  const snapshot = await getConversationChatsCollection(type)
    .doc(chatId)
    .collection("messages")
    .orderBy("createdAt", "asc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

module.exports = {
  createChat,
  addMessageToChat,
  getChats,
  getChatMessages,
};