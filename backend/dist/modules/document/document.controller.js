"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uplaodDocument = void 0;
const prisma_1 = require("../../db/prisma");
const uplaodDocument = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No File Uploaded' });
        }
        const document = await prisma_1.prisma.document.create({
            data: {
                fileName: file.originalname,
                fileUrl: file.path,
                status: "PROCESSING",
            },
        });
        res.json({
            message: "File uploaded successfully",
            documentId: document.id,
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload Failed' });
    }
};
exports.uplaodDocument = uplaodDocument;
