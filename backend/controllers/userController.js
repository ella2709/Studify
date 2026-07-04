const userBL = require("../BLs/userBL");

async function createUser(req, res) {
  try {
    const uid = req.user?.uid;
    const email = req.user?.email;

    if (!uid) {
      return res.status(401).json({ error: "Missing userId" });
    }

    const user = await userBL.createUser({
      uid,
      email,
      name: req.body.name,
    });

    res.status(201).json({ user });
  } catch (err) {
    console.error("CREATE USER PROFILE ERROR:", err);

    res.status(500).json({
      error: err?.message || "Failed to create user profile",
    });
  }
}

async function getCurrentUser(req, res) {
  try {
    const uid = req.user?.uid;

    if (!uid) {
      return res.status(401).json({ error: "Missing userId" });
    }

    const user = await userBL.getCurrentUser({ uid });

    res.json({ user });
  } catch (err) {
    console.error("GET CURRENT USER ERROR:", err);

    res.status(500).json({
      error: err?.message || "Failed to get current user",
    });
  }
}

module.exports = {
  createUser,
  getCurrentUser,
};