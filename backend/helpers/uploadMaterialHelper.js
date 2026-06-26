const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    file.originalname = Buffer.from(file.originalname, "latin1").toString("utf8");

    const allowedMimeTypes = [
      "text/plain",
      "text/markdown",
      "application/json",
      "text/csv",
    ];

    const allowedExtensions = [
  ".txt", ".md", ".json", ".csv", ".rtf",
  ".pdf", ".docx", ".xlsx", ".pptx",
  ".js", ".jsx", ".ts", ".tsx",
  ".py", ".java", ".c", ".cpp", ".h", ".hpp",
  ".cs", ".sql", ".html", ".css",
  ".xml", ".yaml", ".yml", ".ipynb",
  ];
    const lowerName = file.originalname.toLowerCase();
    const isAllowedExtension = allowedExtensions.some((ext) =>
      lowerName.endsWith(ext)
    );

    if (allowedMimeTypes.includes(file.mimetype) || isAllowedExtension) {
      return cb(null, true);
    }

    cb(new Error("This file type is not supported."));
  },
});

module.exports = upload;