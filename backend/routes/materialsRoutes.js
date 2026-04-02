const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const {
  uploadMaterials,
  getMaterials,
  getMaterialById,
} = require("../controllers/materialsController");

const router = express.Router();

router.post("/upload", upload.array("files", 10), uploadMaterials);
router.get("/", getMaterials);
router.get("/:id", getMaterialById);

module.exports = router;