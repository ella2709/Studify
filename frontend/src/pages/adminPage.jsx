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
        action: null,
    });

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

    function openConfirmDialog({ title, message, confirmText, action }) {
        setConfirmDialog({
            open: true,
            title,
            message,
            confirmText,
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

        await confirmDialog.action();
        closeConfirmDialog();
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
        return <div style={styles.page}>{messages.general.loading}</div>;
    }

    if (!isAdmin) {
        return (
            <div style={styles.page}>
                <h1 style={styles.title}>{messages.errors.accessDenied}</h1>
                <p style={styles.subtitle}>{messages.errors.adminOnly}</p>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>{messages.pageTitles.admin}</h1>
                    <p style={styles.subtitle}>{messages.pagePurposes.admin}</p>
                </div>

                <button style={styles.refreshButton} onClick={loadUsers}>
                    Refresh
                </button>
            </div>

            {error && <div style={styles.error}>{error}</div>}
            {success && <div style={styles.success}>{success}</div>}

            <div style={styles.card}>
                {usersLoading ? (
                    <div style={styles.empty}>{messages.general.loadingUsers}</div>
                ) : users.length === 0 ? (
                    <div style={styles.empty}>{messages.general.noUsers}</div>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Name</th>
                                <th style={styles.th}>Email</th>
                                <th style={styles.th}>Role</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => {
                                const isBlocked = user.isBlocked || user.status === messages.actions.blocked;
                                const isDeleted = user.isDeleted || user.status === messages.actions.deleted;
                                const busy = actionLoadingUid === user.uid;

                                return (
                                    <tr key={user.uid}>
                                        <td style={styles.td}>
                                            <div style={styles.name}>{user.name || "No name"}</div>
                                            <div style={styles.uid}>{user.uid}</div>
                                        </td>

                                        <td style={styles.td}>{user.email || "-"}</td>

                                        <td style={styles.td}>
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
                                                style={styles.select}
                                            >
                                                <option value="student">{messages.roles.student}</option>
                                                <option value="admin">{messages.roles.admin}</option>
                                            </select>
                                        </td>

                                        <td style={styles.td}>
                                            <span
                                                style={{
                                                    ...styles.badge,
                                                    ...(isDeleted
                                                        ? styles.deletedBadge
                                                        : isBlocked
                                                            ? styles.blockedBadge
                                                            : styles.activeBadge),
                                                }}
                                            >
                                                {isDeleted ? messages.badges.deleted : isBlocked ? messages.actions.blocked : messages.actions.active}
                                            </span>
                                        </td>

                                        <td style={styles.td}>
                                            <div style={styles.actions}>
                                                {isBlocked ? (
                                                    <button
                                                        style={styles.actionButton}
                                                        disabled={busy || isDeleted}
                                                        onClick={() =>
                                                            openConfirmDialog({
                                                                title: messages.actionsTitle.unblock,
                                                                message: messages.confirmationMessages.unblock,
                                                                confirmText: "Unblock",
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
                                                        style={styles.actionButton}
                                                        disabled={busy || isDeleted}
                                                        onClick={() =>
                                                            openConfirmDialog({
                                                                title: messages.actionsTitle.block,
                                                                message: messages.confirmationMessages.block,
                                                                confirmText: "Block",
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
                                                    style={styles.actionButton}
                                                    disabled={busy || isDeleted}
                                                    onClick={() =>
                                                        openConfirmDialog({
                                                            title: messages.actionsTitle.resetData,
                                                            message: messages.confirmationMessages.resetData,
                                                            confirmText: "Reset data",
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
                                                    style={styles.dangerButton}
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
                onCancel={closeConfirmDialog}
                onConfirm={handleConfirmAction}
            />
        </div>
    );
}

const styles = {
    page: {
        width: "100%",
        minHeight: "100%",
        padding: "2rem",
        background:
            "radial-gradient(circle at top left, rgba(89, 122, 255, 0.08), transparent 35%), #f8fafc",
    },
    header: {
        maxWidth: 1180,
        margin: "0 auto 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
    },
    title: {
        margin: 0,
        fontSize: "2rem",
        color: "#0f172a",
    },
    subtitle: {
        margin: "0.35rem 0 0",
        color: "#64748b",
    },
    refreshButton: {
        border: "1px solid #dbe3ef",
        background: "#ffffff",
        borderRadius: "999px",
        padding: "0.65rem 1rem",
        cursor: "pointer",
        fontWeight: 700,
    },
    card: {
        maxWidth: 1180,
        margin: "0 auto",
        background: "#ffffff",
        border: "1px solid #e5eaf2",
        borderRadius: "1.25rem",
        boxShadow: "0 20px 50px rgba(15, 23, 42, 0.06)",
        overflow: "auto",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        minWidth: 980,
    },
    th: {
        textAlign: "left",
        padding: "1rem",
        fontSize: "0.8rem",
        color: "#64748b",
        borderBottom: "1px solid #e5eaf2",
        background: "#f8fafc",
    },
    td: {
        padding: "1rem",
        borderBottom: "1px solid #eef2f7",
        verticalAlign: "middle",
        color: "#1e293b",
    },
    name: {
        fontWeight: 700,
    },
    uid: {
        marginTop: "0.25rem",
        fontSize: "0.75rem",
        color: "#94a3b8",
        maxWidth: 190,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    select: {
        border: "1px solid #dbe3ef",
        borderRadius: "0.7rem",
        padding: "0.5rem 0.65rem",
        background: "#fff",
    },
    badge: {
        display: "inline-flex",
        borderRadius: "999px",
        padding: "0.35rem 0.65rem",
        fontSize: "0.78rem",
        fontWeight: 700,
    },
    activeBadge: {
        background: "#dcfce7",
        color: "#166534",
    },
    blockedBadge: {
        background: "#fee2e2",
        color: "#991b1b",
    },
    deletedBadge: {
        background: "#e2e8f0",
        color: "#475569",
    },
    actions: {
        display: "flex",
        flexWrap: "wrap",
        gap: "0.45rem",
    },
    actionButton: {
        border: "1px solid #dbe3ef",
        background: "#ffffff",
        borderRadius: "0.65rem",
        padding: "0.48rem 0.7rem",
        cursor: "pointer",
        fontWeight: 650,
    },
    deleteButton: {
        border: "1px solid #fecaca",
        background: "#fff7f7",
        color: "#b91c1c",
        borderRadius: "0.65rem",
        padding: "0.48rem 0.7rem",
        cursor: "pointer",
        fontWeight: 650,
    },
    dangerButton: {
        border: "1px solid #991b1b",
        background: "#991b1b",
        color: "#ffffff",
        borderRadius: "0.65rem",
        padding: "0.48rem 0.7rem",
        cursor: "pointer",
        fontWeight: 650,
    },
    empty: {
        padding: "2rem",
        color: "#64748b",
    },
    error: {
        maxWidth: 1180,
        margin: "0 auto 1rem",
        color: "#b91c1c",
        fontWeight: 700,
    },
    success: {
        maxWidth: 1180,
        margin: "0 auto 1rem",
        color: "#166534",
        fontWeight: 700,
    },
};