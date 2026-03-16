'use strict';
const express = require('express');
const multer  = require('multer');
const fs      = require('fs');
const path    = require('path');
const router  = express.Router();
const { client, MODELS } = require('../clients');
const { sttLimiter }     = require('../rateLimiter');

const upload = multer({
  dest: path.join(__dirname, '../uploads/'),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    // Accept any audio/* or raw binary from mobile recorders
    cb(null, file.mimetype.startsWith('audio/') || file.mimetype === 'application/octet-stream');
  },
});

// POST /api/voice/transcribe  — audio file → transcript text
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'audio file required' });

  // Rename to add proper extension based on mimetype
  const extMap = {
    'audio/mpeg': '.mp3', 'audio/wav': '.wav', 'audio/mp4': '.mp4',
    'audio/webm': '.webm', 'audio/ogg': '.ogg', 'audio/m4a': '.m4a',
    'audio/x-m4a': '.m4a',
  };
  const ext = extMap[req.file.mimetype] || '.webm';
  const newPath = req.file.path + ext;
  fs.renameSync(req.file.path, newPath);

  try {
    await sttLimiter.wait();
    const transcript = await client.audio.transcriptions.create({
      model:           MODELS.stt,
      file:            fs.createReadStream(newPath),
      language:        req.body.language || 'ne',
      response_format: 'json',
    });
    fs.unlinkSync(newPath);
    res.json({ text: transcript.text });
  } catch (err) {
    if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
