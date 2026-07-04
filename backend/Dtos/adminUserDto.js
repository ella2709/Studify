function toAdminUserDto(doc, authUser = null) {
  const data = doc.data() || {};

  return {
    uid: doc.id,
    name: data.name || authUser?.displayName || "",
    email: data.email || authUser?.email || "",
    role: data.role || "student",
    status: data.status || "active",
    isBlocked: data.isBlocked === true,
    isDeleted: data.isDeleted === true,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
    lastLoginAt: data.lastLoginAt || null,
  };
}

module.exports = {
  toAdminUserDto,
};