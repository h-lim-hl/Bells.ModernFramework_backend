const express = require("express");
const router = express.Router();
const multer = require("multer"); // for file buffer
const filetype = require("file-type") // for file checking
const uploadImageService = required("../service/uploadImageService");

const storage = multer.memoryStorage();
const upload = multer({ "storage": storage });

const allowedFileTypes = ['jpg', 'jpeg', 'png', 'gif'];
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

router.post("/imageUpload", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ "message": "No file uploaded." });

  const { ext, mime } = await filetype.fromBuffer(file.buffer);
  if (!allowedFileTypes.includes(ext)) return res.status(400).json({ "message": "Invalid file type." });
  if (!allowedMimeTypes.includes(mime)) return res.status(400).json({ "message": "Bad file." });

  try {
    const imageUrl = await uploadImageService.uploadImage(file.buffer, file.filename);
    res.status(200).json({ "imageUrl": imageUrl });
  } catch (err) {
    res.status(500).json({ "message": err.message });
  }
});

module.exports = router;