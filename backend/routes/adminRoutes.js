const express = require("express");
const authHelper = require("../helpers/authHelper");
const checkAdmin = require("../helpers/adminHelper");

const {
  getAllUsers,
  getUserById,
  updateUserRole,
  blockUser,
  unblockUser,
  hardDeleteUser,
  resetUserSystemData,
} = require("../controllers/adminController");

const router = express.Router();

router.use(authHelper);
router.use(checkAdmin);

router.get("/users", getAllUsers);
router.get("/users/:uid", getUserById);

router.patch("/users/:uid/role", updateUserRole);
router.patch("/users/:uid/block", blockUser);
router.patch("/users/:uid/unblock", unblockUser);

router.delete("/users/:uid/permanent", hardDeleteUser);
router.delete("/users/:uid/system-data", resetUserSystemData);

module.exports = router;