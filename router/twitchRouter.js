import express from "express";
import { getLatestTwitchVideos } from "../utils/twitch.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const twitchVods = await getLatestTwitchVideos("isaaclrs", 6);

    res.render("pages/index.twig", { twitchVods });
  } catch (error) {
    console.error("❌ Erreur route Twitch:", error.message);
    res.status(500).send("Erreur lors du chargement des rediffusions Twitch.");
  }
});

export default router;
