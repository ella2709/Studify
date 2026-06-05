const express = require("express");
const upload = require("../helpers/uploadMaterialHelper");
const { uploadMaterials, getMaterials, getMaterialById, removeMaterial } = require("../controllers/materialsController");

const router = express.Router();

router.post("/upload", upload.array("files", 10), uploadMaterials);
router.get("/", getMaterials);
router.get("/:id", getMaterialById);
router.delete("/:id", removeMaterial);

module.exports = router;