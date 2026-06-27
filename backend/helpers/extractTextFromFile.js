const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const XLSX = require("xlsx");
const AdmZip = require("adm-zip");

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
  const zip = new AdmZip(file.buffer);
  const entries = zip.getEntries();

  let text = "";

  entries.forEach((entry) => {
    if (
      entry.entryName.startsWith("ppt/slides/slide") &&
      entry.entryName.endsWith(".xml")
    ) {
      const xml = entry.getData().toString("utf8");

      const matches = xml.match(/<a:t>(.*?)<\/a:t>/g) || [];

      matches.forEach((match) => {
        const cleanText = match
          .replace("<a:t>", "")
          .replace("</a:t>", "")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'");

        text += cleanText + "\n";
      });

      text += "\n";
    }
  });

  if (!text.trim()) {
    throw new Error("Could not extract text from this PowerPoint file.");
  }

  return text;
}

  throw new Error("This file type is not supported.");
}

module.exports = {
  extractTextFromFile,
};