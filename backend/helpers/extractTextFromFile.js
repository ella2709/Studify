const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const XLSX = require("xlsx");
const pptxParser = require("node-pptx-parser");

const TEXT_BASED_EXTENSIONS = [
  ".txt", ".md", ".json", ".csv", ".rtf",
  ".js", ".jsx", ".ts", ".tsx",
  ".py", ".java", ".c", ".cpp", ".h", ".hpp",
  ".cs", ".sql", ".html", ".css",
  ".xml", ".yaml", ".yml", ".ipynb",
];

async function extractTextFromFile(file) {
  const extension = path.extname(file.originalname).toLowerCase();

  if (TEXT_BASED_EXTENSIONS.includes(extension)) {
    return file.buffer.toString("utf8");
  }

  if (extension === ".pdf") {
    const data = await pdfParse(file.buffer);
    return data.text;
  }

  if (extension === ".docx") {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  if (extension === ".xlsx") {
    const workbook = XLSX.read(file.buffer, { type: "buffer" });

    let text = "";

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      text += `Sheet: ${sheetName}\n`;
      text += XLSX.utils.sheet_to_csv(sheet);
      text += "\n\n";
    });

    return text;
  }

  if (extension === ".pptx") {
    const slides = await pptxParser.parse(file.buffer);

    if (Array.isArray(slides)) {
      return slides
        .map((slide, index) => {
          if (typeof slide === "string") {
            return `Slide ${index + 1}:\n${slide}`;
          }

          return `Slide ${index + 1}:\n${JSON.stringify(slide)}`;
        })
        .join("\n\n");
    }

    return String(slides || "");
  }

  throw new Error("This file type is not supported.");
}

module.exports = {
  extractTextFromFile,
};