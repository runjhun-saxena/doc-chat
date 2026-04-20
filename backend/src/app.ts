import express from "express";
import cors from "cors";
import documentRoutes from './modules/document/document.routes';
import { prisma } from "./db/prisma";
import { parseWithLlamaParse } from "./services/parse.service";
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/documents', documentRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/test-db", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post("/test-parse", async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    const parsed = await parseWithLlamaParse(req.file.buffer, req.file.originalname);
    res.json({ 
      success: true, 
      pagesCount: parsed.length,
      pages: parsed 
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

export default app;