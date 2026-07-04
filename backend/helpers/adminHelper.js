const { db } = require("../config/firebase");

async function checkAdmin(req, res, next) {
  try {
    const uid = req.user?.uid;

    if (!uid) {
      return res.status(401).json({ error: "Missing userId" });
    }

    const adminDoc = await db.collection("users").doc(uid).get();

    if (!adminDoc.exists) {
      return res.status(403).json({ error: "Admin user record not found" });
    }

    const adminData = adminDoc.data();

    if (adminData.role !== "admin") {
      return res.status(403).json({ error: "Admin access only" });
    }

    if (adminData.isBlocked === true || adminData.status === "blocked") {
      return res.status(403).json({ error: "Admin account is blocked" });
    }

    next();
  } catch (err) {
    console.error("CHECK ADMIN ERROR:", err);
    return res.status(500).json({ error: "Failed to verify admin permissions" });
  }
}

module.exports = checkAdmin;