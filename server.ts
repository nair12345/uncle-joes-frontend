import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // API proxy logic
  const API_BASE_URL = process.env.API_BASE_URL || 'https://uncle-joes-api-374670707835.us-central1.run.app';

  app.get("/api/locations", async (req, res) => {
    try {
      const response = await fetch(`${API_BASE_URL}/locations`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Proxy error (locations):", error);
      res.status(500).json({ error: "Failed to fetch locations from backend" });
    }
  });

  app.get("/api/menu", async (req, res) => {
    try {
      const response = await fetch(`${API_BASE_URL}/menu`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Proxy error (menu):", error);
      res.status(500).json({ error: "Failed to fetch menu from backend" });
    }
  });

  app.get("/api/locations/:id", async (req, res) => {
    try {
      const response = await fetch(`${API_BASE_URL}/locations/${req.params.id}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error(`Proxy error (location ${req.params.id}):`, error);
      res.status(500).json({ error: "Failed to fetch location from backend" });
    }
  });

  app.get("/api/menu/:id", async (req, res) => {
    try {
      const response = await fetch(`${API_BASE_URL}/menu/${req.params.id}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error(`Proxy error (menu item ${req.params.id}):`, error);
      res.status(500).json({ error: "Failed to fetch menu item from backend" });
    }
  });

  // Use Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
