import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const username = "isaaclrs";

async function testTwitch() {
  try {
    console.log("🔑 Client ID:", process.env.TWITCH_CLIENT_ID);
    console.log("🧾 Token:", process.env.TOKEN_TWITCH?.slice(0, 10) + "...");

    const userRes = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        "Authorization": `Bearer ${process.env.TOKEN_TWITCH}`,
      },
    });

    const userData = await userRes.json();
    console.log("👤 userData:", userData);

    const userId = userData.data?.[0]?.id;
    if (!userId) throw new Error("Utilisateur non trouvé");

    const videosRes = await fetch(
      `https://api.twitch.tv/helix/videos?user_id=${userId}&first=6&type=archive`,
      {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID,
          "Authorization": `Bearer ${process.env.TOKEN_TWITCH}`,
        },
      }
    );

    const videosData = await videosRes.json();
    console.log("📦 videosData:", videosData);

  } catch (err) {
    console.error("❌ Erreur:", err.message);
  }
}

testTwitch();
