import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // API proxy logic
  const API_BASE_URL = process.env.API_BASE_URL || 'https://uncle-joes-api-374670707835.us-central1.run.app';

  app.post("/api/login", async (req, res) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Proxy error (login):", error);
      res.status(500).json({ error: "Failed to login via backend" });
    }
  });

  app.get("/api/members/:id/orders", async (req, res) => {
    try {
      const query = new URLSearchParams(req.query as any).toString();
      const url = `${API_BASE_URL}/members/${req.params.id}/orders${query ? `?${query}` : ''}`;
      const response = await fetch(url, {
        headers: req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error(`Proxy error (member orders ${req.params.id}):`, error);
      res.status(500).json({ error: "Failed to fetch member orders" });
    }
  });

  app.get("/api/members/:id/points", async (req, res) => {
    try {
      const query = new URLSearchParams(req.query as any).toString();
      const url = `${API_BASE_URL}/members/${req.params.id}/points${query ? `?${query}` : ''}`;
      const response = await fetch(url, {
        headers: req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error(`Proxy error (member points ${req.params.id}):`, error);
      res.status(500).json({ error: "Failed to fetch member points" });
    }
  });

  app.get("/api/locations", async (req, res) => {
    try {
      const query = new URLSearchParams(req.query as any).toString();
      const url = `${API_BASE_URL}/locations?${query || 'limit=1000'}`;
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Proxy error (locations):", error);
      res.status(500).json({ error: "Failed to fetch locations from backend" });
    }
  });

  app.get("/api/menu", async (req, res) => {
    try {
      const query = new URLSearchParams(req.query as any).toString();
      const url = `${API_BASE_URL}/menu?${query || 'limit=1000'}`;
      const response = await fetch(url);
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

  app.post("/api/orders", async (req, res) => {
    try {
      const headers: Record<string, string> = { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      if (req.headers.authorization) {
        headers['Authorization'] = req.headers.authorization;
      }

      console.log(`[PROXY] Creating order at ${API_BASE_URL}/orders`);
      console.log(`[PROXY] Payload:`, JSON.stringify(req.body, null, 2));

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(req.body)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error(`[PROXY] API Error ${response.status}:`, JSON.stringify(data, null, 2));
        return res.status(response.status).json(data);
      }

      console.log(`[PROXY] Order created successfully:`, JSON.stringify(data, null, 2));
      res.status(response.status).json(data);
    } catch (error) {
      console.error("[PROXY] Connection error (create order):", error);
      res.status(500).json({ error: "Failed to connect to backend", detail: String(error) });
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
