import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";

import messages from "../messages";
import { AttachmentIcon } from "../components/iconsAndButtons";
import { getMaterials, uploadMaterials, deleteMaterial } from "../services/materialService";
import { formatUploadDate } from "../helpers/dateHelper";
import { formatFileSize, getFileBadge } from "../helpers/fileHelper";
import ConfirmDialog from "../components/ConfirmDialog";

function projectNameFromId(projectId) {
  return projectId
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function UploadMaterialPage() {
  const { projectId } = useParams();
  const location = useLocation();
  const projectName = location.state?.projectName || projectNameFromId(projectId);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [materialToDelete, setMaterialToDelete] = useState(null);

  async function loadUploadedFiles() {
    try {
      setLoadingList(true);
      const files = await getMaterials(projectId);
      setUploadedFiles(files);
    } catch (error) {
      setStatus({ type: "error", text: error.message || messages.general.error });
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    setUploadedFiles([]);
    setStatus({ type: "", text: "" });
    loadUploadedFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  function handleFileChange(event) {
    const filesArray = Array.from(event.target.files || []);
    setSelectedFiles(filesArray);
    setStatus({ type: "", text: "" });
  }

  useEffect(() => {
    if (!status.text) return;
    const timer = setTimeout(() => setStatus({ type: "", text: "" }), 3000);
    return () => clearTimeout(timer);
  }, [status]);

  async function handleUpload() {
    setStatus({ type: "", text: "" });

    if (selectedFiles.length === 0) {
      setStatus({ type: "error", text: messages.upload.noFilesSelected });
      return;
    }

    try {
      setLoading(true);
      await uploadMaterials(projectId, selectedFiles);
      setStatus({ type: "success", text: messages.upload.uploadSuccess });
      setSelectedFiles([]);
      await loadUploadedFiles();
    } catch (error) {
      setStatus({ type: "error", text: error.message || messages.upload.uploadError });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteFile(fileId) {
    try {
      setStatus({ type: "", text: "" });
      await deleteMaterial(projectId, fileId);
      await loadUploadedFiles();
      setStatus({ type: "success", text: "File deleted successfully" });
    } catch (error) {
      setStatus({ type: "error", text: error.message || "Failed to delete file" });
    }
  }

  async function confirmDeleteMaterial() {
    if (!materialToDelete) return;
    await handleDeleteFile(materialToDelete.id);
    setMaterialToDelete(null);
  }

  return (
    <div className="app-page fade-in" style={{ maxWidth: 940 }}>
      <div className="page-head">
        <Link to={`/project/${projectId}`} state={{ projectName }} className="breadcrumb" style={{ marginBottom: "0.9rem" }}>
          <ChevronLeft /> {projectName}
        </Link>
        <p className="page-eyebrow">Study Materials</p>
        <h1 className="page-title">Upload &amp; manage files</h1>
        <p className="page-subtitle">
          Add materials that power your summaries, questions, and AI-based learning.
        </p>
      </div>

      {status.text && (
        <div className={status.type === "error" ? "status-error" : "status-success"} style={{ marginBottom: "1rem" }}>
          {status.text}
        </div>
      )}

      {/* Dropzone */}
      <div className="card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
        <input
          id="file-upload"
          type="file"
          multiple
          accept=".txt,.md,.json,.csv,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <label
          htmlFor="file-upload"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.6rem",
            textAlign: "center",
            padding: "1.6rem 1rem",
            border: "2px dashed var(--border-2)",
            borderRadius: "var(--r-md)",
            background: "var(--bg-inset)",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "var(--r-md)",
              background: "var(--accent-bg)",
              color: "var(--accent-dark)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AttachmentIcon />
          </div>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 700 }}>Choose files to upload</div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 3 }}>
              Supported: txt, md, json, csv, pdf, docx, pptx, xlsx
            </div>
          </div>
        </label>

        {selectedFiles.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "1.1rem 0 0.65rem" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                Selected files ({selectedFiles.length})
              </span>
              <button type="button" onClick={() => setSelectedFiles([])} className="btn btn-ghost btn-sm">
                Clear all
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "0.5rem" }}>
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  style={{
                    position: "relative",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-sm)",
                    background: "var(--bg-raised)",
                    padding: "0.6rem 0.7rem",
                  }}
                >
                  <button
                    onClick={() => setSelectedFiles((prev) => prev.filter((_, i) => i !== index))}
                    title="Remove file"
                    className="modal-close"
                    style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, fontSize: "0.95rem" }}
                  >
                    ×
                  </button>
                  <p style={{ margin: "0 1.2rem 0.2rem 0", fontSize: "0.82rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={file.name}>
                    {file.name}
                  </p>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{formatFileSize(file.size)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <button type="button" onClick={handleUpload} disabled={loading} className="btn btn-primary">
                {loading ? (<><span className="spinner" /> {messages.upload.uploading}</>) : `Upload ${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"}`}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Uploaded files */}
      <section className="card" style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <div>
            <h2 className="section-title">Uploaded files</h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0.2rem 0 0" }}>
              {uploadedFiles.length === 0
                ? "No files have been uploaded yet."
                : `${uploadedFiles.length} file${uploadedFiles.length === 1 ? "" : "s"} available in this project.`}
            </p>
          </div>
          <button type="button" onClick={loadUploadedFiles} disabled={loadingList} className="btn btn-secondary btn-sm">
            {loadingList ? messages.general.loading : messages.general.refresh}
          </button>
        </div>

        {loadingList && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 60 }} />
            ))}
          </div>
        )}

        {!loadingList && uploadedFiles.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3 className="empty-title">No study files yet</h3>
            <p className="empty-text">Select files above and upload them to start using this project.</p>
          </div>
        )}

        {!loadingList && uploadedFiles.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            {uploadedFiles.map((file) => (
              <div key={file.id} className="file-row">
                <div className="file-badge">{getFileBadge(file.originalName)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.9rem", fontWeight: 650, margin: "0 0 0.3rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={file.originalName}>
                    {file.originalName}
                  </p>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    <span className="meta-pill">{formatFileSize(file.size)}</span>
                    <span className="meta-pill">{file.mimeType || "unknown"}</span>
                    {formatUploadDate(file) && <span className="meta-pill">🕑 {formatUploadDate(file)}</span>}
                    {file.chunksCount !== undefined && <span className="meta-pill">{file.chunksCount} chunks</span>}
                  </div>
                </div>
                <button type="button" onClick={() => setMaterialToDelete(file)} className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={!!materialToDelete}
        title="Delete file?"
        message={`Are you sure you want to delete "${materialToDelete?.originalName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteMaterial}
        onCancel={() => setMaterialToDelete(null)}
      />
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export default UploadMaterialPage;
