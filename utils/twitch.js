import fetch from "node-fetch";

async function getTwitchAccessToken() {
  if (process.env.TOKEN_TWITCH) {
    console.log("✅ Utilisation du token Twitch du .env");
    return process.env.TOKEN_TWITCH;
  }

  console.log("⚠️ Aucun token dans .env — génération d’un nouveau token...");
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: "POST" }
  );

  if (!res.ok) throw new Error("Erreur lors de la génération du token Twitch");

  const data = await res.json();
  return data.access_token;
}

export async function getLatestTwitchVideos(username, maxResults = 5) {
  try {
    const token = await getTwitchAccessToken();

    // Récupère l’ID utilisateur Twitch
    const userRes = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        "Authorization": `Bearer ${token}`,
      },
    });

    const userData = await userRes.json();
    const userId = userData.data?.[0]?.id;

    if (!userId) throw new Error(`Utilisateur Twitch non trouvé : ${username}`);

    // Récupère les rediffusions (VODs)
    const videosRes = await fetch(
      `https://api.twitch.tv/helix/videos?user_id=${userId}&first=${maxResults}&type=archive`,
      {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID,
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    const videosData = await videosRes.json();
    console.log("📦 Données Twitch API:", videosData);

    const videos = videosData.data.map(video => ({
      id: video.id,
      title: video.title,
      publishedAt: video.created_at,
      thumbnail: video.thumbnail_url.replace("%{width}", "640").replace("%{height}", "360"),
      link: video.url,
      duration: video.duration,
    }));

    console.log(`🎥 ${videos.length} rediffusions Twitch récupérées pour ${username}`);
    return videos;
  } catch (error) {
    console.error("❌ Erreur Twitch VODs:", error.message);
    return [];
  }
}
