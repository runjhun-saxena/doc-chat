import { Request, Response } from "express";
import { put } from "@vercel/blob";
import { prisma } from "../../db/prisma";
import { parseWithLlamaParse } from "../../services/parse.service";

export const uploadDocument = async (req: Request, res: Response) => {
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

export const testParse = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log(`[TEST] Parsing file: ${file.originalname}`);
    const pages = await parseWithLlamaParse(file.buffer, file.originalname);

    res.json({
      status: 'success',
      fileName: file.originalname,
      pagesExtracted: pages.length,
      fileSize: file.size,
      pages: pages.map((p) => ({
        pageNumber: p.pageNumber,
        textLength: p.text.length,
        preview: p.text.substring(0, 150),
      })),
    });
  } catch (error: any) {
    console.error('[TEST] Parse failed:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      cause: error.cause ? String(error.cause) : undefined,
    });
  }
};