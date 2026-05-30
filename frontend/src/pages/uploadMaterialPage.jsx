import { useEffect, useState } from "react";
import { API } from "../api";
import messages from "../messages";
import { AttachmentIcon } from "../components/IconsAndButtons";

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileBadge(fileName = "") {
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith(".pdf")) return "PDF";
  if (lowerName.endsWith(".docx") || lowerName.endsWith(".doc")) return "DOC";
  if (lowerName.endsWith(".pptx") || lowerName.endsWith(".ppt")) return "PPT";
  if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) return "XLS";
  if (lowerName.endsWith(".txt")) return "TXT";
  if (lowerName.endsWith(".md")) return "MD";
  if (lowerName.endsWith(".csv")) return "CSV";
  return "FILE";
}

function formatUploadDate(file) {
  const rawDate = file.createdAt || file.uploadedAt || file.created_at;

  if (!rawDate) return "Upload date unavailable";

  const date = new Date(rawDate);

  if (Number.isNaN(date.getTime())) return "Upload date unavailable";

  return date.toLocaleDateString();
}

function UploadMaterialPage() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  async function loadUploadedFiles() {
    try {
      setLoadingList(true);

      const response = await fetch(API.GET_MATERIALS);
      const data = await response.json();

      if (!response.ok) {
        setStatus({
          type: "error",
          text: data.error || messages.general.error,
        });
        return;
      }

      setUploadedFiles(data.files || []);
    } catch (error) {
      setStatus({
        type: "error",
        text: error.message || messages.general.error,
      });
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadUploadedFiles();
  }, []);

  function handleFileChange(event) {
    const filesArray = Array.from(event.target.files || []);
    setSelectedFiles(filesArray);
    setStatus({ type: "", text: "" });
  }

  async function handleUpload() {
    setStatus({ type: "", text: "" });

    if (selectedFiles.length === 0) {
      setStatus({
        type: "error",
        text: messages.upload.noFilesSelected,
      });
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(API.UPLOAD_MATERIALS, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus({
          type: "error",
          text: data.error || messages.upload.uploadError,
        });
        return;
      }

      setStatus({
        type: "success",
        text: messages.upload.uploadSuccess,
      });

      setSelectedFiles([]);
      await loadUploadedFiles();
    } catch (error) {
      setStatus({
        type: "error",
        text: error.message || messages.upload.uploadError,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-[#111111]">
          {messages.upload.title}
        </h2>
        <p className="mt-2 text-gray-500">Manage your study resources</p>
      </header>

      {status.text && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            status.type === "error"
              ? "border border-red-200 bg-red-50 text-red-700"
              : "border border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {status.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-[#111111]">Upload Card</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              {messages.upload.description}
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-[#F7F7F5] p-8 text-center">
            <input
              id="file-upload"
              type="file"
              multiple
              accept=".txt,.md,.json,.csv,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
              onChange={handleFileChange}
              className="hidden"
            />

            <label
              htmlFor="file-upload"
              title={messages.upload.selectFiles}
              className="mx-auto flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
            >
              <AttachmentIcon />
            </label>

            <h4 className="mt-4 text-base font-bold text-[#111111]">
              Drag & Drop Files
            </h4>

            <p className="mt-2 text-sm text-gray-500">
              or choose files from your computer
            </p>

            <label
              htmlFor="file-upload"
              className="mt-5 inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-[#111111] transition hover:bg-gray-50"
            >
              {messages.upload.selectFiles}
            </label>

            <p className="mt-4 text-sm text-gray-500">
              {selectedFiles.length === 0
                ? messages.upload.noFileSelected
                : `${selectedFiles.length} ${
                    selectedFiles.length === 1
                      ? messages.upload.fileSelected
                      : messages.upload.filesSelected
                  }`}
            </p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[#111111]">
                {messages.upload.selectedFiles}
              </h3>

              <ol className="mt-3 space-y-2 text-sm text-gray-700">
                {selectedFiles.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-[#F7F7F5] p-3"
                  >
                    <span className="break-words font-medium">{file.name}</span>
                    <span className="shrink-0 text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={loading || selectedFiles.length === 0}
            className="mt-6 h-11 w-full cursor-pointer rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? messages.upload.uploading : messages.upload.uploadButton}
          </button>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#111111]">
                {messages.upload.uploadedFilesTitle}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Files available for AI learning and retrieval.
              </p>
            </div>

            <button
              type="button"
              onClick={loadUploadedFiles}
              disabled={loadingList}
              className="h-11 cursor-pointer rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-[#111111] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingList ? messages.general.loading : messages.general.refresh}
            </button>
          </div>

          {uploadedFiles.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-[#F7F7F5] p-5 text-sm text-gray-600">
              {messages.upload.emptyList}
            </div>
          ) : (
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-[#F7F7F5] p-4"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-bold text-gray-700 ring-1 ring-gray-200">
                      {getFileBadge(file.originalName)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#111111]">
                        {file.originalName}
                      </p>

                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span>
                          {messages.upload.fileSize}: {formatFileSize(file.size)}
                        </span>
                        <span>
                          {messages.upload.fileType}:{" "}
                          {file.mimeType || "unknown"}
                        </span>
                        <span>{formatUploadDate(file)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 transition hover:bg-white hover:text-[#111111]"
                    title="Actions"
                  >
                    ⋯
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default UploadMaterialPage;