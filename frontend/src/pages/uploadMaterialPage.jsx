import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";

import messages from "../messages";
import { AttachmentIcon } from "../components/iconsAndButtons";
import { getMaterials, uploadMaterials, deleteMaterial} from "../services/materialService";
import { formatUploadDate } from "../helpers/dateHelper";
import {formatFileSize, getFileBadge, removeSelectedFile} from "../helpers/fileHelper";
import ConfirmDialog from "../components/ConfirmDialog";


function ProjectBreadcrumb() {
  const { projectId } = useParams();
  const location = useLocation();
  if (!projectId) return null;
  const name = location.state?.projectName || projectId.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  return (
    <div style={{ marginBottom: "0.75rem" }}>
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
        }}
      >
        <span>‹</span>
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
  const [materialToDelete, setMaterialToDelete] = useState(null);

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

    const timer = setTimeout(() => {
      setStatus({ type: "", text: "" });
    }, 3000); // 3 שניות

    return () => clearTimeout(timer);
 }, [status]);

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
      await uploadMaterials(projectId, selectedFiles);

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

  async function handleDeleteFile(fileId) {
    try {
      setStatus({ type: "", text: "" });

      await deleteMaterial(projectId, fileId);
      await loadUploadedFiles();

      setStatus({
        type: "success",
        text: "File deleted successfully",
      });
    } catch (error) {
      setStatus({
        type: "error",
        text: error.message || "Failed to delete file",
      });
    }
  }

  async function confirmDeleteMaterial() {
  if (!materialToDelete) return;

  await handleDeleteFile(materialToDelete.id);
  setMaterialToDelete(null);
  }


  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <ProjectBreadcrumb />

      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          boxShadow: "var(--shadow-card)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1.25rem 1.5rem 1rem",
            borderBottom: "1px solid var(--border)",
            background:
              "linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-raised) 100%)",
          }}
        >
          <p
            style={{
              margin: "0 0 0.35rem",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--accent)",
            }}
          >
            Study Materials
          </p>

          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "var(--text)",
              margin: "0 0 0.35rem",
              lineHeight: 1.15,
            }}
          >
            Upload and manage files
          </h2>

          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--text-2)",
              margin: 0,
              maxWidth: 620,
              lineHeight: 1.45,
            }}
          >
            Add materials that will be used for summaries, questions, and AI-based learning.
          </p>
        </div>

        <div style={{ padding: "1rem 1.5rem 1.25rem" }}>
          {status.text && (
            <div
              className={status.type === "error" ? "status-error" : "status-success"}
              style={{ marginBottom: "0.875rem" }}
            >
              {status.text}
            </div>
          )}

          <div
            style={{
              border: "2px dashed var(--border)",
              borderRadius: "0.875rem",
              backgroundColor: "var(--bg-raised)",
              padding: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              marginBottom: "0.875rem",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.875rem",
                minWidth: 260,
                flex: 1,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "0.75rem",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-2)",
                  flexShrink: 0,
                }}
              >
                <AttachmentIcon />
              </div>

              <div>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "var(--text)",
                    margin: "0 0 0.15rem",
                  }}
                >
                  Choose files to upload
                </h3>

                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-muted)",
                    margin: 0,
                    lineHeight: 1.35,
                  }}
                >
                  Supported: txt, md, json, csv, pdf, docx, pptx, xlsx.
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                flexWrap: "wrap",
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
                className="btn btn-secondary"
                style={{ cursor: "pointer", padding: "0.5rem 0.875rem" }}
              >
                Select files
              </label>

              <button
                type="button"
                onClick={handleUpload}
                disabled={loading || selectedFiles.length === 0}
                className="btn btn-primary"
                style={{ padding: "0.5rem 0.875rem" }}
              >
                {loading ? messages.upload.uploading : "Upload"}
              </button>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.75rem",
                borderRadius: "0.75rem",
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border)",
              }}
            >
              <p
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  color: "var(--text)",
                  margin: "0 0 0.5rem",
                }}
              >
                Selected files ({selectedFiles.length})
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "0.5rem",
                }}
              >
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: "0.625rem",
                      backgroundColor: "var(--bg-raised)",
                      padding: "0.625rem",
                      position: "relative"
                    }}
                  >
                       <button
                         onClick={() =>
                            setSelectedFiles((prevFiles) =>
                              prevFiles.filter((_, fileIndex) => fileIndex !== index)
                            )
                          }
                          title="Remove file"
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            border: "1px solid var(--border)",
                            backgroundColor: "var(--bg-surface)",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            fontWeight: 700,
                          }}
                        >
                          ×
                      </button>
                    <p
                      style={{
                        margin: "0 0 0.25rem",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: "var(--text)",
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
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              marginBottom: "0.75rem",
              paddingTop: "0.25rem",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "1.0625rem",
                  fontWeight: 800,
                  color: "var(--text)",
                  margin: "0 0 0.15rem",
                }}
              >
                Uploaded files
              </h3>

              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-muted)",
                  margin: 0,
                }}
              >
                {uploadedFiles.length === 0
                  ? "No files have been uploaded yet."
                  : `${uploadedFiles.length} file${
                      uploadedFiles.length === 1 ? "" : "s"
                    } available in this project.`}
              </p>
            </div>

            <button
              type="button"
              onClick={loadUploadedFiles}
              disabled={loadingList}
              className="btn btn-secondary"
              style={{ padding: "0.5rem 0.875rem" }}
            >
              {loadingList ? messages.general.loading : messages.general.refresh}
            </button>
          </div>

          {loadingList && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="skeleton"
                  style={{ height: 58, borderRadius: "0.75rem" }}
                />
              ))}
            </div>
          )}

          {!loadingList && uploadedFiles.length === 0 && (
            <div
              style={{
                borderRadius: "0.875rem",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-raised)",
                padding: "1.25rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>
                📄
              </div>

              <h4
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--text)",
                  margin: "0 0 0.25rem",
                }}
              >
                No study files yet
              </h4>

              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-muted)",
                  margin: 0,
                }}
              >
                Select files above and upload them to start using this project.
              </p>
            </div>
          )}

          {!loadingList && uploadedFiles.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.875rem",
                    padding: "0.75rem 0.875rem",
                    backgroundColor: "var(--bg-raised)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.75rem",
                  }}
                >
                  <div className="file-badge">{getFileBadge(file.originalName)}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        color: "var(--text)",
                        margin: "0 0 0.25rem",
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
                        gap: "0.5rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <span className="project-meta-pill">
                        {formatFileSize(file.size)}
                      </span>

                      <span className="project-meta-pill">
                        {file.mimeType || "unknown"}
                      </span>

                      {formatUploadDate(file) && (
                        <span className="project-meta-pill">
                          {formatUploadDate(file)}
                        </span>
                      )}

                      {file.chunksCount !== undefined && (
                        <span className="project-meta-pill">
                          {file.chunksCount} chunks
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMaterialToDelete(file)}
                    className="btn btn-secondary"
                    style={{
                      fontSize: "0.75rem",
                      padding: "0.35rem 0.65rem",
                      flexShrink: 0,
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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

export default UploadMaterialPage;