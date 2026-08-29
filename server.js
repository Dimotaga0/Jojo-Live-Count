const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

const CHANNEL_ID = "UCVwPQ0VmXRZ1ZhZMhPyhoTg";

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/youtube-stats", async (req, res) => {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      return res.status(500).json({
        error: "Clé API YouTube manquante."
      });
    }

    const youtubeUrl = new URL(
      "https://www.googleapis.com/youtube/v3/channels"
    );

    youtubeUrl.searchParams.set("part", "statistics");
    youtubeUrl.searchParams.set("id", CHANNEL_ID);
    youtubeUrl.searchParams.set("key", process.env.YOUTUBE_API_KEY);

    const youtubeResponse = await fetch(youtubeUrl);
    const data = await youtubeResponse.json();

    if (!youtubeResponse.ok || !data.items?.[0]) {
      console.error("Erreur YouTube API :", data);

      return res.status(youtubeResponse.status || 500).json({
        error: "Impossible de récupérer les statistiques YouTube."
      });
    }

    const statistics = data.items[0].statistics;

    res.set("Cache-Control", "public, max-age=60");

    res.json({
      views: Number(statistics.viewCount),
      videos: Number(statistics.videoCount),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erreur serveur :", error);

    res.status(500).json({
      error: "Erreur interne du serveur."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Jojo Subscriber Count lancé sur le port ${PORT}`);
});