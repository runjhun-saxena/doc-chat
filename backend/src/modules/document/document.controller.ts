import { Request, Response } from "express";
import { put } from "@vercel/blob";
import { prisma } from "../../db/prisma";

export const uplaodDocument = async (req: Request, res: Response) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No File Uploaded' });
        }

        // Upload to Vercel Blob
const blob = await put(file.originalname, file.buffer, {
    access: 'public',
    addRandomSuffix: true,
});

        // Save to database
        const document = await prisma.document.create({
            data: {
                fileName: file.originalname,
                fileUrl: blob.url,
                status: "PROCESSING",
            },
        });

        res.json({
            message: "File uploaded successfully",
            documentId: document.id,
            fileUrl: blob.url,
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload Failed' });
    }
};