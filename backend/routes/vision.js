'use strict';
const express = require('express');
const multer  = require('multer');
const router  = express.Router();
const { client, MODELS } = require('../clients');
const { gptLimiter }     = require('../rateLimiter');

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 },
});

// POST /api/vision  — analyze uploaded medical report or medicine photo
// Multipart: { image, context?, mode? }
// mode: "report" | "medicine" | "general"
router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'image file required' });

  const context  = req.body.context || '';
  const mode     = req.body.mode || 'report';
  const mimeType = req.file.mimetype;
  const b64Image = req.file.buffer.toString('base64');

  const prompts = {
    report: `You are a clinical medical report interpreter for patients in rural Nepal.
Analyze this medical report image and respond with a JSON object:
{
  "report_type": "e.g. CBC, Urinalysis, X-Ray",
  "metrics": [
    { "name": "TEST NAME", "value": "result", "unit": "unit", "status": "normal|high|low|attention", "explanation": "plain language explanation in Nepali/English" }
  ],
  "overall_summary": "1-2 sentence plain language summary",
  "doctor_note": "advice for next steps",
  "disclaimer": "यो जानकारी केवल शैक्षिक उद्देश्यको लागि हो।"
}
Do NOT diagnose. Explain each value in plain language.`,

    medicine: `You are a medicine identification assistant for rural Nepal.
Analyze this medicine/tablet/package image and respond with a JSON object:
{
  "identified": true,
  "name": "Medicine name",
  "local_name": "Nepali name if known",
  "type": "Tablet/Syrup/Injection/etc",
  "strength": "e.g. 500mg",
  "uses": "what it treats in plain Nepali/English",
  "usage_instructions": ["instruction 1", "instruction 2"],
  "precautions": ["precaution 1", "precaution 2"],
  "disclaimer": "सधैं चिकित्सकको सल्लाह लिनुहोस्।"
}
If the medicine cannot be identified, set identified: false and explain why.`,

    general: `You are a clinical image assessment assistant.
Patient context: ${context || 'none provided'}
Describe observable clinical features only: color, size, pattern, texture.
Do not diagnose. Describe observations only.
End with: 'Please consult a licensed doctor for proper evaluation.'`,
  };

  const textPrompt = prompts[mode] || prompts.general;

  try {
    await gptLimiter.wait();
    const response = await client.chat.completions.create({
      model:      MODELS.gpt,
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${b64Image}`, detail: 'high' },
          },
          { type: 'text', text: textPrompt },
        ],
      }],
    });

    const raw = response.choices[0].message.content;
    // Try to parse JSON response, fallback to raw text
    let result;
    try {
      const match = raw.replace(/```json|```/g, '').trim().match(/\{[\s\S]*\}/);
      result = match ? JSON.parse(match[0]) : { raw_response: raw };
    } catch {
      result = { raw_response: raw };
    }

    res.json({ mode, result });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
