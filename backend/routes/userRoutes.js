const express = require("express");
const authHelper = require("../helpers/authHelper");
const {createUser, getCurrentUser} = require("../controllers/userController");

const router = express.Router();

router.use(authHelper);

router.post("/profile", createUser);
router.get("/me", getCurrentUser);

module.exports = router;