const adminBL = require("../BLs/adminBL");

function getCurrentAdminUid(req) {
  return req.user?.uid || null;
}

async function getAllUsers(req, res) {
  try {
    const users = await adminBL.getAllUsers();

    res.json({ users });
  } catch (err) {
    console.error("GET ADMIN USERS ERROR:", err);

    res.status(500).json({
      error: err?.message || "Failed to get users",
    });
  }
}

async function getUserById(req, res) {
  try {
    const user = await adminBL.getUserById({
      uid: req.params.uid,
    });

    res.json({ user });
  } catch (err) {
    console.error("GET ADMIN USER ERROR:", err);

    res.status(500).json({
      error: err?.message || "Failed to get user",
    });
  }
}

async function updateUserRole(req, res) {
  try {
    const user = await adminBL.updateUserRole({
      uid: req.params.uid,
      role: req.body.role,
      currentAdminUid: getCurrentAdminUid(req),
    });

    res.json({
      message: "User role updated successfully",
      user,
    });
  } catch (err) {
    console.error("UPDATE USER ROLE ERROR:", err);

    res.status(400).json({
      error: err?.message || "Failed to update user role",
    });
  }
}

async function blockUser(req, res) {
  try {
    const user = await adminBL.blockUser({
      uid: req.params.uid,
      currentAdminUid: getCurrentAdminUid(req),
    });

    res.json({
      message: "User blocked successfully",
      user,
    });
  } catch (err) {
    console.error("BLOCK USER ERROR:", err);

    res.status(400).json({
      error: err?.message || "Failed to block user",
    });
  }
}

async function unblockUser(req, res) {
  try {
    const user = await adminBL.unblockUser({
      uid: req.params.uid,
    });

    res.json({
      message: "User unblocked successfully",
      user,
    });
  } catch (err) {
    console.error("UNBLOCK USER ERROR:", err);

    res.status(400).json({
      error: err?.message || "Failed to unblock user",
    });
  }
}


async function hardDeleteUser(req, res) {
  try {
    await adminBL.hardDeleteUser({
      uid: req.params.uid,
      currentAdminUid: getCurrentAdminUid(req),
    });

    res.json({
      message: "User permanently deleted successfully",
    });
  } catch (err) {
    console.error("HARD DELETE USER ERROR:", err);

    res.status(400).json({
      error: err?.message || "Failed to permanently delete user",
    });
  }
}

async function resetUserSystemData(req, res) {
  try {
    await adminBL.resetUserSystemData({
      uid: req.params.uid,
      currentAdminUid: getCurrentAdminUid(req),
    });

    res.json({
      message: "User system data reset successfully",
    });
  } catch (err) {
    console.error("RESET USER DATA ERROR:", err);

    res.status(400).json({
      error: err?.message || "Failed to reset user system data",
    });
  }
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