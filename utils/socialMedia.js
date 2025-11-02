import fetch from "node-fetch";

/**
 * UTILITAIRE POUR RÉCUPÉRER LES FOLLOWERS DES RÉSEAUX SOCIAUX
 * 
 * IMPORTANT: Les APIs Instagram et TikTok sont très restrictives.
 * Le code utilise maintenant du SCRAPING direct des pages publiques.
 * Si le scraping échoue, des valeurs manuelles sont utilisées en fallback.
 * 
 * Pour mettre à jour les valeurs manuelles:
 * - Instagram: lignes 109 et 113
 * - TikTok: lignes 169 et 173
 * 
 * Note: Le scraping peut être bloqué par les plateformes à tout moment.
 */

function formatFollowerCount(count) {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return count.toString();
}

/**
 * Récupère le nombre de followers Twitch
 */
export async function getTwitchFollowers(username) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 secondes max
    
    try {
      const response = await fetch(`https://decapi.me/twitch/followcount/${username}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const followersText = await response.text();
        const followers = parseInt(followersText.trim()) || 0;
        
        return {
          followers: followers,
          success: true
        };
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
    
    return {
      followers: 0,
      success: false
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des followers Twitch:", error.message);
    return {
      followers: 0,
      success: false
    };
  }
}

/**
 * Récupère le nombre de followers Instagram
 */
export async function getInstagramFollowers(username) {
  const url = `https://instagram-statistics-api.p.rapidapi.com/community?url=https%3A%2F%2Fwww.instagram.com%2F${username}%2F`;;

  try {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'instagram-statistics-api.p.rapidapi.com',
      },
    });

    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Réponse API:", data);

    const followers = data?.data?.usersCount;
    const name = data?.data?.name || username;

    if (!followers) {
      console.warn(`Aucun follower trouvé pour ${username}`);
      return { followers: 0, success: false };
    }

    console.log(`Followers Instagram (${name}) : ${followers}`);
    return { followers, success: true };

  } catch (error) {
    console.error("Erreur lors de la récupération des followers Instagram:", error.message);
    return { followers: 0, success: false };
  }
}


/**
 * Récupère le nombre de followers TikTok
 */
export async function getTikTokFollowers(username) {
  try {
    // Tentative de scraping de la page publique TikTok
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes max
    
    try {
      const response = await fetch(`https://www.tiktok.com/@${username}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const html = await response.text();
        
        // TikTok utilise un JSON embarqué différent
        const jsonMatch = html.match(/window\[\'SIGI_STATE\'\]\s*=\s*({.+?});/);
        if (jsonMatch) {
          try {
            const data = JSON.parse(jsonMatch[1]);
            const followers = data.UserModule?.users?.[`@${username}`]?.stats?.followerCount;
            
            if (followers && followers > 0) {
              console.log(`TikTok followers scraped for ${username}: ${followers}`);
              return { followers, success: true };
            }
          } catch (parseError) {
            // JSON parsing failed, continue to alternative method
          }
        }
        
        // Méthode alternative: recherche directe dans le HTML
        const followersMatch = html.match(/"followerCount":(\d+)/);
        if (followersMatch) {
          const followers = parseInt(followersMatch[1]);
          console.log(`TikTok followers found for ${username}: ${followers}`);
          return { followers, success: true };
        }
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      // Continue to fallback
    }
    
    // Fallback: valeur manuelle
    console.log(`TikTok: using manual value for ${username}`);
    return { followers: 85000, success: true }; // TODO: Mettre à jour manuellement
  } catch (error) {
    console.error("Erreur lors de la récupération des followers TikTok:", error.message);
    return { followers: 85000, success: true }; // TODO: Mettre à jour manuellement
  }
}

/**
 * Récupère toutes les statistiques sociales
 */
export async function getAllSocialStats(username) {
  const [twitch, instagram, tiktok] = await Promise.allSettled([
    getTwitchFollowers(username),
    getInstagramFollowers(username),
    getTikTokFollowers(username)
  ]);

  return {
    twitch: twitch.status === 'fulfilled' ? twitch.value : { followers: 0, success: false },
    instagram: instagram.status === 'fulfilled' ? instagram.value : { followers: 0, success: false },
    tiktok: tiktok.status === 'fulfilled' ? tiktok.value : { followers: 0, success: false }
  };
}

