const express = require("express");
const authHelper = require("../helpers/authHelper");
const {getProjects, getProjectById, createProject, deleteProject, renameProject} = require("../controllers/projectsController");

const router = express.Router();

router.use(authHelper);

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:projectId", getProjectById);
router.delete("/:projectId", deleteProject);
router.patch("/:projectId", renameProject);

module.exports = router;