import express from "express";
import { getInstagramFollowers } from "../utils/socialMedia.js";

const router = express.Router();

router.get("/api/instagram/:username", async (req, res) => {
  const { username } = req.params;
  const result = await getInstagramFollowers(username);

  if (result.success) {
    res.json({ username, followers: result.followers });
  } else {
    res.status(500).json({ error: "Impossible de récupérer les followers Instagram." });
  }
});

export default router;
