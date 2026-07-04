const { db, admin } = require("../config/firebase");

const QUESTIONS_COLLECTION = "askAI";

function getQuestionChatsCollection(userId, projectId) {
  if (!userId) {
    throw new Error("Missing userId");
  }

  if (!projectId) {
    throw new Error("Missing projectId");
  }

  return db
    .collection("users")
    .doc(userId)
    .collection("projects")
    .doc(projectId)
    .collection(QUESTIONS_COLLECTION);
}

async function createChat(title, projectId, userId) {
  const chatRef = getQuestionChatsCollection(userId, projectId).doc();

  await chatRef.set({
    title,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const createdDoc = await chatRef.get();

  return {
    id: createdDoc.id,
    ...createdDoc.data(),
  };
}

async function addMessageToChat(chatId, message, projectId, userId) {
  const chatRef = getQuestionChatsCollection(userId, projectId).doc(chatId);
  const chatDoc = await chatRef.get();

  if (!chatDoc.exists) {
    throw new Error("Chat not found");
  }

  const messageRef = await chatRef.collection("messages").add({
    ...message,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await chatRef.update({
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const createdMessage = await messageRef.get();

  return {
    id: createdMessage.id,
    ...createdMessage.data(),
  };
}

async function getChats(projectId, userId) {
  const snapshot = await getQuestionChatsCollection(userId, projectId)
    .orderBy("updatedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function getChatMessages(chatId, projectId, userId) {
  const chatRef = getQuestionChatsCollection(userId, projectId).doc(chatId);
  const chatDoc = await chatRef.get();

  if (!chatDoc.exists) {
    throw new Error("Chat not found");
  }

  const snapshot = await chatRef
    .collection("messages")
    .orderBy("createdAt", "asc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function deleteChat(chatId, projectId, userId) {
  const chatRef = getQuestionChatsCollection(userId, projectId).doc(chatId);
  const chatDoc = await chatRef.get();

  if (!chatDoc.exists) {
    throw new Error("Chat not found");
  }

  const messagesSnapshot = await chatRef.collection("messages").get();
  const batch = db.batch();

  messagesSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  batch.delete(chatRef);

  await batch.commit();

  return { id: chatId };
}

module.exports = {
  createChat,
  addMessageToChat,
  getChats,
  getChatMessages,
  deleteChat,
};