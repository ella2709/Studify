const adminDal = require("../Dals/adminDal");

function validateUid(uid) {
  if (!uid) {
    throw new Error("Missing user uid");
  }
}

async function getAllUsers() {
  return adminDal.getAllUsers();
}

async function getUserById({ uid }) {
  validateUid(uid);

  const user = await adminDal.getUserById(uid);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

async function updateUserRole({ uid, role, currentAdminUid }) {
  validateUid(uid);

  if (!role) {
    throw new Error("Missing role");
  }

  if (!["admin", "student"].includes(role)) {
    throw new Error("Invalid role");
  }

  if (uid === currentAdminUid && role !== "admin") {
    throw new Error("Admin cannot remove admin role from itself");
  }

  return adminDal.updateUserRole(uid, role);
}

async function blockUser({ uid, currentAdminUid }) {
  validateUid(uid);

  if (uid === currentAdminUid) {
    throw new Error("Admin cannot block itself");
  }

  return adminDal.blockUser(uid);
}

async function unblockUser({ uid }) {
  validateUid(uid);

  return adminDal.unblockUser(uid);
}


async function hardDeleteUser({ uid, currentAdminUid }) {
  validateUid(uid);

  if (uid === currentAdminUid) {
    throw new Error("Admin cannot delete itself");
  }

  await adminDal.hardDeleteUser(uid);

  return { uid };
}

async function resetUserSystemData({ uid, currentAdminUid }) {
  validateUid(uid);

  if (uid === currentAdminUid) {
    throw new Error("Admin cannot reset its own system data from admin panel");
  }

  await adminDal.deleteUserSystemData(uid);

  return { uid };
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  blockUser,
  unblockUser,
  hardDeleteUser,
  resetUserSystemData,
};