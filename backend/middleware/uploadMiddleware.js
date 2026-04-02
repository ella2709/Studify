const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "text/plain",
      "text/markdown",
      "application/json",
      "text/csv",
    ];

    const allowedExtensions = [".txt", ".md", ".json", ".csv"];
    const lowerName = file.originalname.toLowerCase();
    const isAllowedExtension = allowedExtensions.some((ext) =>
      lowerName.endsWith(ext)
    );

    if (allowedMimeTypes.includes(file.mimetype) || isAllowedExtension) {
      return cb(null, true);
    }

    cb(new Error("Only txt, md, json, csv files are allowed right now"));
  },
});

module.exports = upload;