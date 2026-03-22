"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const document_upload_1 = require("./document.upload");
const document_controller_1 = require("./document.controller");
const router = (0, express_1.Router)();
router.post("/upload", document_upload_1.upload.single("file"), document_controller_1.uplaodDocument);
exports.default = router;
