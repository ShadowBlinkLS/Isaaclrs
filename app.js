import express from "express";
import dotenv from "dotenv";
import youtubeRouter from "./router/youtubeRouter.js";
import instagramRouter from "./router/instagramRouter.js";
import twig from "twig";

const app = express();
dotenv.config();
console.log("Clé API chargée :", process.env.RAPIDAPI_KEY ? "✅ OK" : "❌ Pas trouvée");

// Configuration Twig
twig.cache(false); // Désactiver le cache en développement
app.engine("twig", twig.__express);
app.set("view engine", "twig");
app.set("views", "./views");

// Dossier public pour tes fichiers statiques (CSS, JS, images…)
app.use(express.static("./public"));

// Routes
app.use(instagramRouter);
app.use(youtubeRouter);


// Démarrage du serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur en ligne sur http://localhost:${PORT}`);
});
