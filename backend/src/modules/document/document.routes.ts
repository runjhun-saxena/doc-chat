import { Router } from "express";
import { upload } from "./document.upload";
import { uplaodDocument } from "./document.controller";

const router =Router()

router.post("/upload",upload.single("file"),uplaodDocument)
export default router ;