import fetch from "node-fetch";
import { parseStringPromise } from "xml2js";

/**
 * Convertit une durée ISO 8601 (ex: PT5M32S) en secondes
 */
function isoToSeconds(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = parseInt(match?.[1] || 0);
  const minutes = parseInt(match?.[2] || 0);
  const seconds = parseInt(match?.[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * 🔹 Méthode 1 — API YouTube officielle
 */
export async function getLatestVideosAPI(channelId, maxResults = 10) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ Clé API YouTube manquante — fallback RSS");
    return null;
  }

  try {
    // Playlist "uploads" d’une chaîne YouTube : UU + channelId sans "UC"
    const playlistId = `UU${channelId.slice(2)}`;
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=${maxResults}&key=${apiKey}`
    );

    if (!res.ok) throw new Error(`API YouTube: ${res.statusText}`);
    const data = await res.json();

    // Récupère toutes les durées des vidéos
    const videoIds = data.items.map(v => v.contentDetails.videoId).join(",");
    const durationsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`
    );
    const durationsData = await durationsRes.json();

    const durationsMap = new Map(
      durationsData.items.map(v => [v.id, v.contentDetails.duration])
    );

    // Filtrer les shorts (vidéos < 60s)
    const videos = data.items
      .filter(v => {
        const iso = durationsMap.get(v.contentDetails.videoId);
        return isoToSeconds(iso) > 60;
      })
      .map(v => ({
        id: v.contentDetails.videoId,
        title: v.snippet.title,
        publishedAt: v.snippet.publishedAt,
        thumbnail: v.snippet.thumbnails.high.url,
        link: `https://www.youtube.com/watch?v=${v.contentDetails.videoId}`,
      }));

    console.log(`✅ ${videos.length} vidéos récupérées via API YouTube`);
    return videos;
  } catch (error) {
    console.error("❌ Erreur API YouTube:", error.message);
    return null;
  }
}

/**
 * 🔹 Méthode 2 — Fallback via flux RSS public
 */
export async function getLatestVideosRSS(channelId, maxResults = 25) {
  try {
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const res = await fetch(url);
    const xml = await res.text();
    const json = await parseStringPromise(xml);

    const entries = json.feed.entry
      .filter(entry => !entry.link[0].$.href.includes("/shorts/"))
      .slice(0, maxResults)
      .map(entry => ({
        id: entry["yt:videoId"][0],
        title: entry.title[0],
        publishedAt: entry.published[0],
        thumbnail: `https://i.ytimg.com/vi/${entry["yt:videoId"][0]}/hqdefault.jpg`,
        link: entry.link[0].$.href,
      }));

    console.log(`📺 ${entries.length} vidéos récupérées via RSS`);
    return entries;
  } catch (error) {
    console.error("❌ Erreur RSS YouTube:", error.message);
    return [];
  }
}

/**
 * 🔹 Fonction principale — essaie d’abord l’API, sinon fallback RSS
 */
export async function getLatestVideos(channelId, maxResults = 25) {
  const apiVideos = await getLatestVideosAPI(channelId, maxResults);
  if (apiVideos && apiVideos.length > 0) return apiVideos;
  return await getLatestVideosRSS(channelId, maxResults);
}
