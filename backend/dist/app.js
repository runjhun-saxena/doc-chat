"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const document_routes_1 = __importDefault(require("./modules/document/document.routes"));
const prisma_1 = require("./db/prisma");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/documents', document_routes_1.default);
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});
app.get("/test-db", async (req, res) => {
    const users = await prisma_1.prisma.user.findMany();
    res.json(users);
});
exports.default = app;
