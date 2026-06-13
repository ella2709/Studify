const express = require("express");
const authHelper = require("../helpers/authHelper");

const {
  getProjects,
  getProjectById,
  createProject,
} = require("../controllers/projectController");


const router = express.Router();

router.use(authHelper);

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:projectId", getProjectById);

module.exports = router;