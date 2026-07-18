import express from "express";
import cors from "cors";
import { config, validateConfig } from "./config.js";
import { searchItems } from "./services/amazonClient.js";

validateConfig();

const app = express();

app.use(
  cors({
    origin: "*"
  })
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/search", async (req, res) => {
  const keyword = String(req.query.keyword || "").trim();
  const category = String(req.query.category || "").trim();
  const page = parseInt(String(req.query.page || "1"), 10) || 1;

  if (!keyword) {
    return res.status(400).json({ error: "keyword is required" });
  }

  try {
    const items = await searchItems({ keyword, page, category });
    res.json({ items });
  } catch (error) {
    console.error("[Aliza Backend] /api/search error", error?.response?.data || error);
    res.status(502).json({ error: "Failed to fetch products from Amazon API" });
  }
});

app.listen(config.port, () => {
  console.log(`[Aliza Backend] Listening on port ${config.port}`);
});

