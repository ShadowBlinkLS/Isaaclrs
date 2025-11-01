import express from "express";
import youtubeRouter from "./router/youtubeRouter.js";

const app = express();

// Dossier public pour tes fichiers statiques (CSS, JS, images…)
app.use(express.static("./public"));

// Routes
app.use(youtubeRouter);

// Démarrage du serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur en ligne sur http://localhost:${PORT}`);
});
