import express from "express";
import { getLatestVideos } from "../utils/youtube.js";
import { getTwitchFollowers, getInstagramFollowers, getTikTokFollowers } from "../utils/socialMedia.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const videos = await getLatestVideos("UC07hFy4lz8MFezbicHq7LrA", 25);
        // Récupération des stats avec les bons usernames
    const [twitch, instagram, tiktok] = await Promise.allSettled([
      getTwitchFollowers("isaaclrs"),
      getInstagramFollowers("isaaclrs"),
      getTikTokFollowers("isaaclrss") // TikTok avec le bon username
    ]);    
    // Fonction de formatage
    const formatFollowers = (count) => {
      if (count >= 1000000) {
        return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
      } else if (count >= 1000) {
        return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
      }
      return count.toString();
    };
    
    const socialStats = {
      twitch: twitch.status === 'fulfilled' ? { 
        ...twitch.value, 
        formatted: formatFollowers(twitch.value.followers || 0) 
      } : { followers: 0, success: false, formatted: '0' },
      instagram: instagram.status === 'fulfilled' ? { 
        ...instagram.value, 
        formatted: formatFollowers(instagram.value.followers || 0) 
      } : { followers: 0, success: false, formatted: '0' },
      tiktok: tiktok.status === 'fulfilled' ? { 
        ...tiktok.value, 
        formatted: formatFollowers(tiktok.value.followers || 0) 
      } : { followers: 0, success: false, formatted: '0' }
    };
    
    res.render("pages/index.twig", { videos, socialStats });
  } catch (error) {
    res.status(500).send("Erreur lors du chargement des vidéos YouTube.");
  }
});

export default router;
