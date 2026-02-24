import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function extractTag(source: string, tagName: string): string {
  const match = source.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`));
  return match?.[1]?.trim() ?? "";
}

function decodeXml(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'");
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.get("/api/social/youtube-latest", async (req, res) => {
    try {
      const channelId = String(req.query.channelId ?? "").trim();
      const max = Math.min(Number(req.query.max ?? 6) || 6, 12);

      if (!channelId) {
        res.status(400).json({ error: "channelId is required" });
        return;
      }

      const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
      const response = await fetch(feedUrl);
      if (!response.ok) {
        res.status(502).json({ error: "Failed to fetch YouTube feed" });
        return;
      }

      const xml = await response.text();
      const entries = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g))
        .slice(0, max)
        .map((match) => {
          const entry = match[1];
          const id = extractTag(entry, "yt:videoId") || extractTag(entry, "id");
          const title = decodeXml(extractTag(entry, "title"));
          const publishedAt = extractTag(entry, "published");
          const link = extractTag(entry, "link") || "";
          const linkFromHref = entry.match(/<link[^>]*href="([^"]+)"/)?.[1] ?? "";
          const videoUrl = linkFromHref || `https://www.youtube.com/watch?v=${id}`;
          const thumbnail = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

          return { id, title, publishedAt, url: videoUrl, thumbnail };
        })
        .filter((item) => item.id && item.title);

      res.json({ channelId, items: entries });
    } catch (error) {
      res.status(500).json({ error: "Unexpected error", detail: String(error) });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
