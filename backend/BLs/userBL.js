const userDal = require("../Dals/userDal");

async function createUser({ uid, email, name }) {
  if (!uid) {
    throw new Error("Missing uid");
  }

  if (!name || !name.trim()) {
    throw new Error("Missing name");
  }

  return userDal.createUser({
    uid,
    email,
    name: name.trim(),
  });
}

async function getCurrentUser({ uid }) {
  if (!uid) {
    throw new Error("Missing uid");
  }

  const user = await userDal.getUserById(uid);

  if (!user) {
    throw new Error("User document not found");
  }

  return user;
}

module.exports = {
  createUser,
  getCurrentUser,
};