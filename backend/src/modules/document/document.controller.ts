import { Request,Response } from "express";
import { prisma } from "../../db/prisma";
export const uplaodDocument = async (req:Request ,  res:Response) =>{
    try {
        const file = req.file;

        if(!file){
            return res.status(400).json({message:'No File Uploaded'})
        }
        const document = await prisma.document.create({
            data:{
                fileName:file.originalname,
                fileUrl : file.path,
                status :"PROCESSING",
            },

        })
        res.json({
            message:"File uploaded successfully",
            documentId: document.id,
        })
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({message:'Upload Failed'})
        
    }
}