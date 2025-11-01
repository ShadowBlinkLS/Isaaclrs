import fetch from "node-fetch";
import { parseStringPromise } from "xml2js";

/**
 * Récupère les dernières vidéos d'une chaîne YouTube publique
 */
export async function getLatestVideosRSS(channelId, maxResults = 10) {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const res = await fetch(url);
  const xml = await res.text();
  const json = await parseStringPromise(xml);

  const entries = json.feed.entry.slice(0, maxResults).map(entry => ({
    id: entry["yt:videoId"][0],
    title: entry.title[0],
    publishedAt: entry.published[0],
    thumbnail: `https://i.ytimg.com/vi/${entry["yt:videoId"][0]}/hqdefault.jpg`,
    link: entry.link[0].$.href,
  }));

  return entries;
}
