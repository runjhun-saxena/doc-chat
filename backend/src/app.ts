import express from "express";
import cors from "cors";
import documentRoutes from './modules/document/document.routes';
import { prisma } from "./db/prisma";

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

export default app;