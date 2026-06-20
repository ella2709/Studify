const { db, admin } = require("../config/firebase");

function getFeatureChatsCollection(featureType, projectId, userId) {
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
    .collection(featureType);
}

async function createChat(featureType, title, projectId, userId) {
  const chatRef = getFeatureChatsCollection(
    featureType,
    projectId,
    userId
  ).doc();

  await chatRef.set({
    title,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { id: chatRef.id, title };
}

async function addMessageToChat(featureType, chatId, message, projectId, userId) {
  const chatRef = getFeatureChatsCollection(
    featureType,
    projectId,
    userId
  ).doc(chatId);

  await chatRef.collection("messages").add({
    ...message,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await chatRef.update({
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function getChats(featureType, projectId, userId) {
  const snapshot = await getFeatureChatsCollection(
    featureType,
    projectId,
    userId
  )
    .orderBy("updatedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function getChatMessages(featureType, chatId, projectId, userId) {
  const snapshot = await getFeatureChatsCollection(
    featureType,
    projectId,
    userId
  )
    .doc(chatId)
    .collection("messages")
    .orderBy("createdAt", "asc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function deleteChat(featureType, chatId, projectId, userId) {
  const chatRef = getFeatureChatsCollection(
    featureType,
    projectId,
    userId
  ).doc(chatId);

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