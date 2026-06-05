const express = require("express");

const {
  getProjects,
  getProjectById,
  createProject,
} = require("../controllers/projectsController");

const router = express.Router();

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:projectId", getProjectById);

module.exports = router;