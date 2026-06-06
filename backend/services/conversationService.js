const { db, admin } = require("../firebase");

const DEFAULT_USER_ID = "defaultUser";
const DEFAULT_PROJECT_ID = "defaultProject";

function getFeatureChatsCollection(featureType, projectId = DEFAULT_PROJECT_ID) {
  return db
    .collection("users")
    .doc(DEFAULT_USER_ID)
    .collection("projects")
    .doc(projectId)
    .collection(featureType);
}

async function createChat(featureType, title, projectId = DEFAULT_PROJECT_ID) {
  const chatRef = getFeatureChatsCollection(featureType, projectId).doc();

  await chatRef.set({
    title,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { id: chatRef.id, title };
}

async function addMessageToChat(featureType, chatId, message, projectId = DEFAULT_PROJECT_ID) {
  const chatRef = getFeatureChatsCollection(featureType, projectId).doc(chatId);

  await chatRef.collection("messages").add({
    ...message,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await chatRef.update({
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function getChats(featureType, projectId = DEFAULT_PROJECT_ID) {
  const snapshot = await getFeatureChatsCollection(featureType, projectId)
    .orderBy("updatedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function getChatMessages(featureType, chatId, projectId = DEFAULT_PROJECT_ID) {
  const snapshot = await getFeatureChatsCollection(featureType, projectId)
    .doc(chatId)
    .collection("messages")
    .orderBy("createdAt", "asc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function deleteChat(featureType, chatId, projectId) {
  const chatRef = getFeatureChatsCollection(featureType, projectId).doc(chatId);

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
  deleteChat
};