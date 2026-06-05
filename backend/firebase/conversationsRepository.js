const { db, admin } = require("./firebase");

const DEFAULT_USER_ID = "defaultUser";
const DEFAULT_PROJECT_ID = "defaultProject";

function getConversationChatsCollection(type, projectId = DEFAULT_PROJECT_ID) {
  return db
    .collection("users")
    .doc(DEFAULT_USER_ID)
    .collection("projects")
    .doc(projectId)
    .collection("conversations")
    .doc(type)
    .collection("chats");
}

async function createChat(type, title, projectId = DEFAULT_PROJECT_ID) {
  const chatRef = getConversationChatsCollection(type, projectId).doc();

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

async function addMessageToChat(type, chatId, message, projectId = DEFAULT_PROJECT_ID) {
  const chatRef = getConversationChatsCollection(type, projectId).doc(chatId);

  await chatRef.collection("messages").add({
    ...message,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await chatRef.update({
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function getChats(type, projectId = DEFAULT_PROJECT_ID) {
  const snapshot = await getConversationChatsCollection(type, projectId)
    .orderBy("updatedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function getChatMessages(type, chatId, projectId = DEFAULT_PROJECT_ID) {
  const snapshot = await getConversationChatsCollection(type, projectId)
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