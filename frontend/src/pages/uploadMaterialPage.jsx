import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
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
  const n = fileName.toLowerCase();
  if (n.endsWith(".pdf")) return "PDF";
  if (n.endsWith(".docx") || n.endsWith(".doc")) return "DOC";
  if (n.endsWith(".pptx") || n.endsWith(".ppt")) return "PPT";
  if (n.endsWith(".xlsx") || n.endsWith(".xls")) return "XLS";
  if (n.endsWith(".txt")) return "TXT";
  if (n.endsWith(".md")) return "MD";
  if (n.endsWith(".csv")) return "CSV";
  return "FILE";
}

function formatUploadDate(file) {
  const rawDate = file.createdAt || file.uploadedAt || file.created_at;
  if (!rawDate) return "";

  // Firestore Timestamp: { _seconds, _nanoseconds } (Admin SDK) or { seconds, nanoseconds }
  if (typeof rawDate === "object" && !(rawDate instanceof Date)) {
    const secs = rawDate._seconds ?? rawDate.seconds;
    if (typeof secs === "number") return new Date(secs * 1000).toLocaleDateString();
    return "";
  }

  const date = rawDate instanceof Date ? rawDate : new Date(rawDate);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
}

function ProjectBreadcrumb() {
  const { projectId } = useParams();
  const location = useLocation();
  if (!projectId) return null;
  const name =
    location.state?.projectName ||
    projectId.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <Link
        to={`/project/${projectId}`}
        state={{ projectName: name }}
        style={{
          fontSize: "0.875rem",
          color: "var(--text-muted)",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.375rem",
          transition: "color 0.14s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {name}
      </Link>
    </div>
  );
}

function UploadMaterialPage() {
  const { projectId } = useParams();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  async function loadUploadedFiles() {
    try {
      setLoadingList(true);
      const url = projectId
        ? `${API.GET_MATERIALS}?projectId=${encodeURIComponent(projectId)}`
        : API.GET_MATERIALS;
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) {
        setStatus({ type: "error", text: data.error || messages.general.error });
        return;
      }
      setUploadedFiles(data.files || []);
    } catch (error) {
      setStatus({ type: "error", text: error.message || messages.general.error });
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    setUploadedFiles([]);
    loadUploadedFiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  function handleFileChange(event) {
    const filesArray = Array.from(event.target.files || []);
    setSelectedFiles(filesArray);
    setStatus({ type: "", text: "" });
  }

  async function handleUpload() {
    setStatus({ type: "", text: "" });
    if (selectedFiles.length === 0) {
      setStatus({ type: "error", text: messages.upload.noFilesSelected });
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));
      const uploadUrl = projectId
        ? `${API.UPLOAD_MATERIALS}?projectId=${encodeURIComponent(projectId)}`
        : API.UPLOAD_MATERIALS;
      const response = await fetch(uploadUrl, { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) {
        setStatus({ type: "error", text: data.error || messages.upload.uploadError });
        return;
      }
      setStatus({ type: "success", text: messages.upload.uploadSuccess });
      setSelectedFiles([]);
      await loadUploadedFiles();
    } catch (error) {
      setStatus({ type: "error", text: error.message || messages.upload.uploadError });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <ProjectBreadcrumb />

      {/* Page header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h2 style={{ fontSize: "1.625rem", fontWeight: 700, color: "var(--text)", margin: "0 0 0.375rem" }}>
          {messages.upload.title}
        </h2>
        <p style={{ fontSize: "0.9375rem", color: "var(--text-2)", margin: 0 }}>
          Manage your study resources
        </p>
      </div>

      {/* Status banner */}
      {status.text && (
        <div
          className={status.type === "error" ? "status-error" : "status-success"}
          style={{ marginBottom: "1.25rem" }}
        >
          {status.text}
        </div>
      )}

      <div className="upload-layout">
        {/* ── Upload card ── */}
        <section
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            padding: "1.5rem",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--text)", margin: "0 0 0.375rem" }}>
            Upload Files
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--text-2)", margin: "0 0 1.25rem", lineHeight: 1.5 }}>
            {messages.upload.description}
          </p>

          {/* Drop zone */}
          <div
            style={{
              border: "2px dashed var(--border)",
              borderRadius: "0.875rem",
              backgroundColor: "var(--bg-raised)",
              padding: "2rem 1.5rem",
              textAlign: "center",
              marginBottom: "1.125rem",
            }}
          >
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
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 52,
                height: 52,
                borderRadius: "0.875rem",
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border)",
                cursor: "pointer",
                color: "var(--text-2)",
                boxShadow: "var(--shadow-sm)",
                transition: "background-color 0.14s",
                marginBottom: "0.875rem",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-muted)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface)")}
            >
              <AttachmentIcon />
            </label>
            <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text)", margin: "0 0 0.25rem" }}>
              Drag &amp; Drop Files
            </p>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: "0 0 1rem" }}>
              or choose from your computer
            </p>
            <label htmlFor="file-upload" className="btn btn-secondary" style={{ cursor: "pointer" }}>
              {messages.upload.selectFiles}
            </label>
          </div>

          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: selectedFiles.length > 0 ? "0.875rem" : "1.125rem" }}>
            {selectedFiles.length === 0
              ? "No files selected"
              : `${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"} selected`}
          </p>

          {selectedFiles.length > 0 && (
            <div style={{ marginBottom: "1.125rem" }}>
              <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)", margin: "0 0 0.5rem" }}>
                {messages.upload.selectedFiles}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.5rem 0.75rem",
                      backgroundColor: "var(--bg-raised)",
                      borderRadius: "0.5rem",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text)", wordBreak: "break-all" }}>
                      {file.name}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", flexShrink: 0 }}>
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={loading || selectedFiles.length === 0}
            className="btn btn-primary"
            style={{ width: "100%" }}
          >
            {loading ? messages.upload.uploading : messages.upload.uploadButton}
          </button>
        </section>

        {/* ── Uploaded files list ── */}
        <section
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            padding: "1.5rem",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.125rem" }}>
            <div>
              <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--text)", margin: "0 0 0.25rem" }}>
                {messages.upload.uploadedFilesTitle}
              </h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0 }}>
                Files available for AI learning and retrieval.
              </p>
            </div>
            <button
              type="button"
              onClick={loadUploadedFiles}
              disabled={loadingList}
              className="btn btn-secondary"
              style={{ fontSize: "0.875rem", padding: "0.4375rem 1rem" }}
            >
              {loadingList ? messages.general.loading : messages.general.refresh}
            </button>
          </div>

          {loadingList && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 72, borderRadius: "0.875rem" }} />
              ))}
            </div>
          )}

          {!loadingList && uploadedFiles.length === 0 && (
            <div
              style={{
                padding: "2rem",
                borderRadius: "0.875rem",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-raised)",
                fontSize: "0.9375rem",
                color: "var(--text-muted)",
                textAlign: "center",
              }}
            >
              {messages.upload.emptyList}
            </div>
          )}

          {!loadingList && uploadedFiles.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "0.875rem 1rem",
                    backgroundColor: "var(--bg-raised)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.875rem",
                  }}
                >
                  <div className="file-badge">{getFileBadge(file.originalName)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text)", margin: "0 0 0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {file.originalName}
                    </p>
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                        {messages.upload.fileSize}: {formatFileSize(file.size)}
                      </span>
                      <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                        {messages.upload.fileType}: {file.mimeType || "unknown"}
                      </span>
                      {formatUploadDate(file) && (
                        <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                          {formatUploadDate(file)}
                        </span>
                      )}
                    </div>
                  </div>
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
