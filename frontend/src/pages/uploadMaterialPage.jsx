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
    <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-800">
        {messages.upload.title}
      </h2>
      <p className="mt-3 text-slate-600">
        {messages.upload.description}
      </p>

      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
        <label className="mb-3 block text-sm font-semibold text-slate-700">
          {messages.upload.selectFiles}
        </label>

        <div className="flex items-center gap-4">
          <input
            id="file-upload"
            type="file"
            multiple
            accept=".txt,.md,.json,.csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <label
            htmlFor="file-upload"
            title={messages.upload.selectFiles}
            className="inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <AttachmentIcon />
          </label>

          <span className="text-sm text-slate-500">
            {selectedFiles.length === 0
              ? messages.upload.noFileSelected
              : `${selectedFiles.length} ${
                  selectedFiles.length === 1
                    ? messages.upload.fileSelected
                    : messages.upload.filesSelected
                }`}
          </span>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-slate-700">
              {messages.upload.selectedFiles}
            </h3>

            <ol className="mt-3 list-decimal space-y-2 pr-5 text-sm text-slate-700">
              {selectedFiles.map((file, index) => (
                <li key={`${file.name}-${index}`} className="break-words">
                  <span className="font-medium">{file.name}</span>
                  <span className="mr-2 text-slate-500">
                    ({formatFileSize(file.size)})
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
          className="mt-6 cursor-pointer rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? messages.upload.uploading : messages.upload.uploadButton}
        </button>
      </div>

      {status.text && (
        <div
          className={`mt-5 rounded-xl px-4 py-3 text-sm ${
            status.type === "error"
              ? "border border-red-200 bg-red-50 text-red-700"
              : "border border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {status.text}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">
            {messages.upload.uploadedFilesTitle}
          </h3>

          <button
            type="button"
            onClick={loadUploadedFiles}
            disabled={loadingList}
            className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingList ? messages.general.loading : messages.general.refresh}
          </button>
        </div>

        {uploadedFiles.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            {messages.upload.emptyList}
          </div>
        ) : (
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="break-words text-sm font-semibold text-slate-800">
                  {file.originalName}
                </p>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>
                    {messages.upload.fileSize}: {formatFileSize(file.size)}
                  </span>
                  <span>
                    {messages.upload.fileType}: {file.mimeType || "unknown"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadMaterialPage;