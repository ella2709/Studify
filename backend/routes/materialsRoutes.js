const express = require("express");
const authHelper = require("../helpers/authHelper");
const upload = require("../helpers/uploadMaterialHelper");

const {
  uploadMaterials,
  getMaterials,
  getMaterialById,
  removeMaterial,
} = require("../controllers/materialsController");

const router = express.Router();

router.use(authHelper);

router.post("/upload", upload.array("files", 10), uploadMaterials);
router.get("/", getMaterials);
router.get("/:id", getMaterialById);
router.delete("/:id", removeMaterial);

module.exports = router;