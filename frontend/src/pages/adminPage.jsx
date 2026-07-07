import { useEffect, useState } from "react";
import {
    getAdminUsers,
    updateUserRole,
    blockUser,
    unblockUser,
    hardDeleteUser,
    resetUserData,
} from "../services/adminService";
import { useAuth } from "../authentication/authContext";
import ConfirmDialog from "../components/confirmDialog";
import messages from "../messages";

export default function AdminPage() {
    const { isAdmin, loading } = useAuth();
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [actionLoadingUid, setActionLoadingUid] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        title: "",
        message: "",
        confirmText: "Confirm",
        loadingText: "",
        action: null,
    });

    const [confirmLoading, setConfirmLoading] = useState(false);


    async function loadUsers() {
        try {
            setUsersLoading(true);
            setError("");

            const data = await getAdminUsers();
            setUsers(data);
        } catch (err) {
            setError(err.message || "Failed to load users");
        } finally {
            setUsersLoading(false);
        }
    }

    function openConfirmDialog({ title, message, confirmText, loadingText, action }) {
        setConfirmDialog({
            open: true,
            title,
            message,
            confirmText,
            loadingText,
            action,
        });
    }

    function closeConfirmDialog() {
        setConfirmDialog((prev) => ({
            ...prev,
            open: false,
            action: null,
        }));
    }

    async function handleConfirmAction() {
        if (!confirmDialog.action) return;

        try {
            setConfirmLoading(true);
            await confirmDialog.action();
            closeConfirmDialog();
        } finally {
            setConfirmLoading(false);
        }
    }

    useEffect(() => {
        if (!loading && isAdmin) {
            loadUsers();
        }
    }, [loading, isAdmin]);

    async function runAction(uid, action, successMessage) {
        try {
            setActionLoadingUid(uid);
            setError("");
            setSuccess("");

            await action();
            setSuccess(successMessage);
            await loadUsers();
        } catch (err) {
            setError(err.message || "Action failed");
        } finally {
            setActionLoadingUid(null);
        }
    }

    if (loading) {
        return (
            <div className="app-page fade-in">
                <p style={{ color: "var(--text-muted)" }}>{messages.general.loading}</p>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="app-page fade-in">
                <h1 className="page-title">{messages.errors.accessDenied}</h1>
                <p className="page-subtitle">{messages.errors.adminOnly}</p>
            </div>
        );
    }

    return (
        <div className="app-page fade-in">
            <header
                style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                    marginBottom: "1.5rem",
                }}
            >
                <div>
                    <p className="page-eyebrow">Administration</p>
                    <h1 className="page-title">{messages.pageTitles.admin}</h1>
                    <p className="page-subtitle">{messages.pagePurposes.admin}</p>
                </div>

                <button className="btn btn-secondary" onClick={loadUsers}>
                    Refresh
                </button>
            </header>

            {error && (
                <div className="status-error" style={{ marginBottom: "1rem" }}>
                    {error}
                </div>
            )}
            {success && (
                <div className="status-success" style={{ marginBottom: "1rem" }}>
                    {success}
                </div>
            )}

            <div className="card" style={{ overflow: "auto" }}>
                {usersLoading ? (
                    <div
                        style={{
                            padding: "3rem 1.5rem",
                            textAlign: "center",
                            color: "var(--text-muted)",
                        }}
                    >
                        {messages.general.loadingUsers}
                    </div>
                ) : users.length === 0 ? (
                    <div className="empty-state" style={{ margin: "1.5rem" }}>
                        <div className="empty-icon">👥</div>
                        <h3 className="empty-title">No users found</h3>
                        <p className="empty-text">{messages.general.noUsers}</p>
                    </div>
                ) : (
                    <table style={tableStyles.table}>
                        <thead>
                            <tr>
                                <th style={tableStyles.th}>User</th>
                                <th style={tableStyles.th}>Email</th>
                                <th style={tableStyles.th}>Role</th>
                                <th style={tableStyles.th}>Status</th>
                                <th style={tableStyles.th}>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => {
                                const isBlocked = user.isBlocked || user.status === messages.actions.blocked;
                                const isDeleted = user.isDeleted || user.status === messages.actions.deleted;
                                const busy = actionLoadingUid === user.uid;

                                const badgeClass = isDeleted
                                    ? "badge badge-neutral"
                                    : isBlocked
                                        ? "badge"
                                        : "badge badge-success";

                                const blockedBadgeStyle = isBlocked && !isDeleted
                                    ? {
                                        background: "var(--error-bg)",
                                        color: "var(--error-txt)",
                                        border: "1px solid var(--error-bdr)",
                                    }
                                    : {};

                                return (
                                    <tr key={user.uid} style={tableStyles.trHover}>
                                        <td style={tableStyles.td}>
                                            <div style={{ fontWeight: 700, color: "var(--text)" }}>
                                                {user.name || "No name"}
                                            </div>
                                            <div style={tableStyles.uid}>{user.uid}</div>
                                        </td>

                                        <td style={tableStyles.td}>
                                            {user.email || "—"}
                                        </td>

                                        <td style={tableStyles.td}>
                                            <select
                                                value={user.role || "student"}
                                                disabled={busy || isDeleted}
                                                onChange={(e) =>
                                                    runAction(
                                                        user.uid,
                                                        () => updateUserRole(user.uid, e.target.value),
                                                        "User role updated successfully"
                                                    )
                                                }
                                                className="select-base"
                                                style={{ width: "auto", padding: "0.38rem 2.2rem 0.38rem 0.65rem", fontSize: "0.82rem" }}
                                            >
                                                <option value="student">{messages.roles.student}</option>
                                                <option value="admin">{messages.roles.admin}</option>
                                            </select>
                                        </td>

                                        <td style={tableStyles.td}>
                                            <span className={badgeClass} style={blockedBadgeStyle}>
                                                {isDeleted
                                                    ? messages.badges.deleted
                                                    : isBlocked
                                                        ? messages.actions.blocked
                                                        : messages.actions.active}
                                            </span>
                                        </td>

                                        <td style={tableStyles.td}>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                                                {isBlocked ? (
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        disabled={busy || isDeleted}
                                                        onClick={() =>
                                                            openConfirmDialog({
                                                                title: messages.actionsTitle.unblock,
                                                                message: messages.confirmationMessages.unblock,
                                                                confirmText: "Unblock",
                                                                loadingText: "Unblocking...",
                                                                action: () =>
                                                                    runAction(
                                                                        user.uid,
                                                                        () => unblockUser(user.uid),
                                                                        "User unblocked successfully"
                                                                    ),
                                                            })
                                                        }
                                                    >
                                                        {messages.actions.unblock}
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        disabled={busy || isDeleted}
                                                        onClick={() =>
                                                            openConfirmDialog({
                                                                title: messages.actionsTitle.block,
                                                                message: messages.confirmationMessages.block,
                                                                confirmText: "Block",
                                                                loadingText: "Blocking...",
                                                                action: () =>
                                                                    runAction(
                                                                        user.uid,
                                                                        () => blockUser(user.uid),
                                                                        "User blocked successfully"
                                                                    ),
                                                            })
                                                        }
                                                    >
                                                        {messages.actions.block}
                                                    </button>
                                                )}

                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    disabled={busy || isDeleted}
                                                    onClick={() =>
                                                        openConfirmDialog({
                                                            title: messages.actionsTitle.resetData,
                                                            message: messages.confirmationMessages.resetData,
                                                            confirmText: "Reset data",
                                                            loadingText: "Resetting data...",
                                                            action: () =>
                                                                runAction(
                                                                    user.uid,
                                                                    () => resetUserData(user.uid),
                                                                    messages.successMessages.resetData
                                                                ),
                                                        })
                                                    }
                                                >
                                                    {messages.actions.resetData}
                                                </button>

                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    disabled={busy}
                                                    onClick={() =>
                                                        openConfirmDialog({
                                                            title: messages.actionsTitle.delete,
                                                            message: messages.confirmationMessages.delete,
                                                            confirmText: "Delete",
                                                            action: () =>
                                                                runAction(
                                                                    user.uid,
                                                                    () => hardDeleteUser(user.uid),
                                                                    messages.successMessages.deleted
                                                                ),
                                                        })
                                                    }
                                                >
                                                    {messages.actions.delete}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            <ConfirmDialog
                open={confirmDialog.open}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmText={confirmDialog.confirmText}
                cancelText="Cancel"
                loadingText={confirmDialog.loadingText}
                onCancel={closeConfirmDialog}
                onConfirm={handleConfirmAction}
                loading={confirmLoading}
            />
        </div>
    );
}

const tableStyles = {
    table: {
        width: "100%",
        borderCollapse: "collapse",
        minWidth: 920,
    },
    th: {
        textAlign: "left",
        padding: "0.85rem 1.1rem",
        fontSize: "0.72rem",
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-raised)",
    },
    trHover: {
        borderBottom: "1px solid var(--border)",
    },
    td: {
        padding: "0.9rem 1.1rem",
        borderBottom: "1px solid var(--border)",
        verticalAlign: "middle",
        color: "var(--text-2)",
        fontSize: "0.9rem",
    },
    uid: {
        marginTop: "0.2rem",
        fontSize: "0.72rem",
        color: "var(--text-muted)",
        maxWidth: 190,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
};
