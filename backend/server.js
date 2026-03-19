const express = require("express");
const cors = require("cors");
const multer = require("multer")
const fs = require("fs");
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}
const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
   const allowedTypes = ['application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

app.use(cors());
app.use(express.json());


// route
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({ success: true, file: req.file });
  } catch (error) {
    res.status(500).json({ error: "Upload failed" });
  }
});




app.get("/", (req, res) => {
  res.send("Server running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});