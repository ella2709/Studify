import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import messages from "../messages";
import { AttachmentIcon } from "../components/iconsAndButtons";
import { getMaterials, uploadMaterials, deleteMaterial, } from "../services/materialService";
import { formatUploadDate } from "../helpers/dateHelper";
import { formatFileSize, getFileBadge } from "../helpers/fileHelper";
import ConfirmDialog from "../components/confirmDialog";
import { useAiAccess } from "../authentication/aiAccessContext.jsx";

function projectNameFromId(projectId) {
  return projectId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function UploadMaterialPage() {
  const { projectId } = useParams();
  const location = useLocation();
  const { isAiBlocked } = useAiAccess();

  const projectName =
    location.state?.projectName || projectNameFromId(projectId);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function loadUploadedFiles() {
    try {
      setLoadingList(true);
      const files = await getMaterials(projectId);
      setUploadedFiles(files);
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
    setUploadedFiles([]);
    setSelectedFiles([]);
    setStatus({ type: "", text: "" });
    loadUploadedFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (isAiBlocked) setSelectedFiles([]);
  }, [isAiBlocked]);

  function handleFileChange(event) {
    if (isAiBlocked) {
      event.target.value = "";
      return;
    }

    const filesArray = Array.from(event.target.files || []);

    setSelectedFiles((previous) => {
      const existingKeys = new Set(
        previous.map(
          (file) => `${file.name}-${file.size}-${file.lastModified}`
        )
      );

      const newFiles = filesArray.filter(
        (file) =>
          !existingKeys.has(
            `${file.name}-${file.size}-${file.lastModified}`
          )
      );

      return [...previous, ...newFiles];
    });

    event.target.value = "";
    setStatus({ type: "", text: "" });
  }

  useEffect(() => {
    if (!status.text) return;

    const timer = setTimeout(
      () => setStatus({ type: "", text: "" }),
      3000
    );

    return () => clearTimeout(timer);
  }, [status]);

  async function handleUpload() {
    if (isAiBlocked) return;

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
      await uploadMaterials(projectId, selectedFiles);
      setStatus({
        type: "success",
        text: messages.upload.uploadSuccess,
      });
      setSelectedFiles([]);
      await loadUploadedFiles();
    } catch (error) {
      if (error.code !== "AI_LIMIT_REACHED") {
        setStatus({
          type: "error",
          text: error.message || messages.upload.uploadError,
        });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteFile(fileId) {
    try {
      setStatus({ type: "", text: "" });
      await deleteMaterial(projectId, fileId);
      await loadUploadedFiles();
      setStatus({
        type: "success",
        text: messages.upload.fileDeleted,
      });
    } catch (error) {
      setStatus({
        type: "error",
        text: error.message || messages.upload.deleteFailed,
      });
    }
  }

  async function confirmDeleteMaterial() {
    if (!materialToDelete) return;

    try {
      setDeleteLoading(true);
      await handleDeleteFile(materialToDelete.id);
      setMaterialToDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div
      className="app-page fade-in"
      style={{ maxWidth: 940, paddingTop: "1rem", paddingBottom: 0 }}
    >
      <div className="page-head">
        <Link
          to={`/project/${projectId}`}
          state={{ projectName }}
          className="breadcrumb"
          style={{ marginBottom: "0.9rem" }}
        >
          <ChevronLeft /> {projectName}
        </Link>

        <p className="page-eyebrow">{messages.pageTitles.material}</p>
        <h1 className="page-title">{messages.upload.manageTitle}</h1>
        <p className="page-subtitle">{messages.pagePurposes.upload}</p>
      </div>

      {isAiBlocked && (
        <div className="alert" style={{ marginBottom: "1rem" }}>
          <div>
            <strong style={{ display: "block", marginBottom: "0.15rem" }}>
              {messages.aiAccess.viewOnlyTitle}
            </strong>
            <span>{messages.aiAccess.uploadMessage}</span>
          </div>
        </div>
      )}

      {status.text && (
        <div
          className={
            status.type === "error" ? "status-error" : "status-success"
          }
          style={{ marginBottom: "1rem" }}
        >
          {status.text}
        </div>
      )}

      <div
        className="card"
        style={{
          padding: "1rem",
          marginBottom: "1rem",
          opacity: isAiBlocked ? 0.72 : 1,
        }}
      >
        <input
          id="file-upload"
          type="file"
          multiple
          disabled={isAiBlocked}
          accept=".txt,.md,.json,.csv,.rtf,.pdf,.docx,.xlsx,.pptx,.js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.h,.hpp,.cs,.sql,.html,.css,.xml,.yaml,.yml,.ipynb"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <label
          htmlFor={isAiBlocked ? undefined : "file-upload"}
          title={
            isAiBlocked ? messages.aiAccess.uploadTooltip : undefined
          }
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.6rem",
            textAlign: "center",
            padding: "1.1rem 1rem",
            border: "2px dashed var(--border-2)",
            borderRadius: "var(--r-md)",
            background: "var(--bg-inset)",
            cursor: isAiBlocked ? "not-allowed" : "pointer",
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
            <div style={{ fontSize: "1rem", fontWeight: 700 }}>
              {isAiBlocked
                ? messages.aiAccess.uploadUnavailableTitle
                : messages.upload.chooseFiles}
            </div>

            <div
              style={{
                fontSize: "0.82rem",
                color: "var(--text-muted)",
                marginTop: 3,
              }}
            >
              {isAiBlocked
                ? messages.aiAccess.uploadUnavailableDescription
                : messages.upload.supportedFiles}
            </div>
          </div>
        </label>

        {!isAiBlocked && selectedFiles.length > 0 && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                margin: "1.1rem 0 0.65rem",
              }}
            >
              <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                {messages.upload.selectedFiles} ({selectedFiles.length})
              </span>

              <button
                type="button"
                onClick={() => setSelectedFiles([])}
                className="btn btn-ghost btn-sm"
              >
                {messages.actions.clearAll}
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(210px, 1fr))",
                gap: "0.5rem",
              }}
            >
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
                    type="button"
                    onClick={() =>
                      setSelectedFiles((previous) =>
                        previous.filter((_, itemIndex) => itemIndex !== index)
                      )
                    }
                    title={messages.upload.removeFile}
                    className="modal-close"
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 22,
                      height: 22,
                      fontSize: "0.95rem",
                    }}
                  >
                    ×
                  </button>

                  <p
                    style={{
                      margin: "0 1.2rem 0.2rem 0",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={file.name}
                  >
                    {file.name}
                  </p>

                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    {formatFileSize(file.size)}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "1rem",
              }}
            >
              <button
                type="button"
                onClick={handleUpload}
                disabled={loading || isAiBlocked}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <span className="spinner" /> {messages.upload.uploading}
                  </>
                ) : (
                  `Upload ${selectedFiles.length} file${
                    selectedFiles.length === 1 ? "" : "s"
                  }`
                )}
              </button>
            </div>
          </>
        )}
      </div>

      <section className="card" style={{ padding: "1rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 className="section-title">
              {messages.upload.uploadedFilesTitle}
            </h2>

            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--text-muted)",
                margin: "0.2rem 0 0",
              }}
            >
              {uploadedFiles.length === 0
                ? messages.upload.uploadedCountEmpty
                : `${uploadedFiles.length} file${
                    uploadedFiles.length === 1 ? "" : "s"
                  } available in this project.`}
            </p>
          </div>

          <button
            type="button"
            onClick={loadUploadedFiles}
            disabled={loadingList}
            className="btn btn-secondary btn-sm"
          >
            {loadingList ? messages.general.loading : messages.general.refresh}
          </button>
        </div>

        {loadingList && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.55rem",
            }}
          >
            {[1, 2, 3].map((item) => (
              <div key={item} className="skeleton" style={{ height: 60 }} />
            ))}
          </div>
        )}

        {!loadingList && uploadedFiles.length === 0 && (
          <div className="empty-state" style={{ padding: "1.5rem 1rem" }}>
            <div className="empty-icon">📄</div>
            <h3 className="empty-title">{messages.upload.noStudyMaterials}</h3>
            <p className="empty-text">
              {isAiBlocked
                ? messages.aiAccess.noExistingMaterials
                : messages.upload.noStudyMaterialsDescription}
            </p>
          </div>
        )}

        {!loadingList && uploadedFiles.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.55rem",
            }}
          >
            {uploadedFiles.map((file) => (
              <div key={file.id} className="file-row">
                <div className="file-badge">
                  {getFileBadge(file.originalName)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 650,
                      margin: "0 0 0.3rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={file.originalName}
                  >
                    {file.originalName}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.4rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span className="meta-pill">
                      {formatFileSize(file.size)}
                    </span>

                    {formatUploadDate(file) && (
                      <span className="meta-pill">
                        🕑 {formatUploadDate(file)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMaterialToDelete(file)}
                  className="btn btn-ghost btn-sm"
                  style={{ flexShrink: 0 }}
                >
                  {messages.actions.delete}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={!!materialToDelete}
        title={messages.upload.deleteFileTitle}
        message={messages.upload.deleteFileMessage(
          materialToDelete?.originalName
        )}
        confirmText={messages.actions.delete}
        cancelText={messages.actions.cancel}
        onConfirm={confirmDeleteMaterial}
        onCancel={() => setMaterialToDelete(null)}
        loading={deleteLoading}
      />
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export default UploadMaterialPage;
