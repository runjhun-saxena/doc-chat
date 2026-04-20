import { Router } from "express";
import { upload } from "./document.upload";
import { uploadDocument, testParse } from "./document.controller";

const router = Router();

router.post("/upload", upload.single("file"), uploadDocument);
router.post("/test-parse", upload.single("file"), testParse);

export default router;