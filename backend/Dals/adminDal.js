const { db, admin } = require("../config/firebase");
const { toAdminUserDto } = require("../Dtos/adminUserDto");

const USERS_COLLECTION = "users";
const VALID_ROLES = ["admin", "student"];

function usersCollection() {
  return db.collection(USERS_COLLECTION);
}

async function getAllUsers() {
  const snapshot = await usersCollection().orderBy("createdAt", "desc").get();

  return snapshot.docs.map((doc) => toAdminUserDto(doc));
}

async function getUserById(uid) {
  const userDoc = await usersCollection().doc(uid).get();

  if (!userDoc.exists) {
    return null;
  }

  return toAdminUserDto(userDoc);
}

async function createUserProfileIfMissing({ uid, email, name }) {
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

async function updateUserRole(uid, role) {
  if (!VALID_ROLES.includes(role)) {
    throw new Error("Invalid role");
  }

  const userRef = usersCollection().doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new Error("User not found");
  }

  await userRef.update({
    role,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const updatedDoc = await userRef.get();
  return toAdminUserDto(updatedDoc);
}

async function blockUser(uid) {
  const userRef = usersCollection().doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new Error("User not found");
  }

  await admin.auth().updateUser(uid, {
    disabled: true,
  });

  await userRef.update({
    isBlocked: true,
    status: "blocked",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const updatedDoc = await userRef.get();
  return toAdminUserDto(updatedDoc);
}

async function unblockUser(uid) {
  const userRef = usersCollection().doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new Error("User not found");
  }

  await admin.auth().updateUser(uid, {
    disabled: false,
  });

  await userRef.update({
    isBlocked: false,
    status: "active",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const updatedDoc = await userRef.get();
  return toAdminUserDto(updatedDoc);
}



async function hardDeleteUser(uid) {
  await deleteUserSystemData(uid);

  await usersCollection().doc(uid).delete();

  try {
    await admin.auth().deleteUser(uid);
  } catch (err) {
    if (err.code !== "auth/user-not-found") {
      throw err;
    }
  }
}

async function deleteCollectionRecursively(collectionRef, batchSize = 100) {
  const snapshot = await collectionRef.limit(batchSize).get();

  if (snapshot.empty) {
    return;
  }

  const batch = db.batch();

  for (const doc of snapshot.docs) {
    const subCollections = await doc.ref.listCollections();

    for (const subCollection of subCollections) {
      await deleteCollectionRecursively(subCollection, batchSize);
    }

    batch.delete(doc.ref);
  }

  await batch.commit();

  if (snapshot.size === batchSize) {
    await deleteCollectionRecursively(collectionRef, batchSize);
  }
}

async function deleteUserSystemData(uid) {
  const userRef = usersCollection().doc(uid);

  const subCollections = await userRef.listCollections();

  for (const subCollection of subCollections) {
    await deleteCollectionRecursively(subCollection);
  }

  await userRef.set(
    {
      systemDataResetAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

module.exports = {
  getAllUsers,
  getUserById,
  createUserProfileIfMissing,
  updateUserRole,
  blockUser,
  unblockUser,
  hardDeleteUser,
  deleteUserSystemData,
};