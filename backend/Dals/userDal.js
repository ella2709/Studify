const { db, admin } = require("../config/firebase");
const { toAdminUserDto } = require("../Dtos/adminUserDto");

function usersCollection() {
  return db.collection("users");
}

async function createUser({ uid, email, name }) {
  const userRef = usersCollection().doc(uid);
  const userDoc = await userRef.get();

  if (userDoc.exists) {
    return toAdminUserDto(userDoc);
  }

  await userRef.set({
    name: name || "",
    email: email || "",
    role: "student",
    status: "active",
    isBlocked: false,
    isDeleted: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const createdDoc = await userRef.get();
  return toAdminUserDto(createdDoc);
}

async function getUserById(uid) {
  const userDoc = await db.collection("users").doc(uid).get();

  if (!userDoc.exists) {
    return null;
  }

  return toAdminUserDto(userDoc);
}

module.exports = {
  createUser,
  getUserById
};