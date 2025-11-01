import express from "express";
import { getLatestVideosRSS } from "../utils/youtube.js"; // si tu utilises ta fonction YouTube

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const videos = await getLatestVideosRSS("UC07hFy4lz8MFezbicHq7LrA", 10);
    res.render("pages/index.twig", { videos });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors du chargement des vidéos YouTube.");
  }
});

export default router;
