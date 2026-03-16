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
    report: `You are an AI medical report interpreter for patients in rural Nepal.

The user has uploaded a photo of a medical lab report. Carefully read the image, extract ALL visible test names, measured values, and reference/normal ranges. Then explain each result in simple Nepali so any normal person can understand.

Respond ONLY with a single valid JSON object. No markdown. No text outside the JSON.

STEPS:
1. Extract every lab test visible in the image (test name, measured value, reference range)
2. Compare each value with its reference range → determine status: "normal", "high", or "low"
3. Write a clear explanation in simple Nepali for each test
4. Write an overall Nepali summary
5. Write a recommendation in Nepali

OUTPUT SCHEMA (follow exactly):
{
  "report_type": "e.g. CBC (Complete Blood Count), LFT, Urinalysis, X-Ray",
  "report_date": "date from report or null",
  "patient_info": { "name": "patient name if visible or null", "age": "age if visible or null" },

  "what_this_means_for_you": "Overall Nepali summary: are most values normal or are some abnormal? Mention specific values that stand out. 3-4 sentences. Simple language.",

  "urgency": "routine | soon | urgent",
  "urgency_reason": "Why this urgency level in one sentence",

  "metrics": [
    {
      "name": "Abbreviated test name exactly as printed e.g. HB, WBC, Cr, FBS",
      "plain_name": "Full test name e.g. HEMOGLOBIN (HB), WBC COUNT, CREATININE",
      "value": "Measured value as printed e.g. 12",
      "unit": "Unit e.g. g/dL, mg/dL, cells/μL",
      "reference_range": "Normal range from report e.g. 13–17 g/dL",
      "status": "normal | high | low",
      "explanation": "Simple Nepali explanation — what this test measures AND what this specific result means for the patient. If abnormal, explain what it could indicate. 2-3 sentences. Example for low HB: 'हेमोग्लोबिनले रगतमा अक्सिजन बोक्ने काम गर्छ। तपाईंको हेमोग्लोबिन सामान्य भन्दा कम छ, जसले शरीरमा रगतको कमी (एनिमिया) हुन सक्ने संकेत दिन्छ।'",
      "nepali_tip": "One simple practical Nepali tip specific to this result. e.g. 'हरेक दिन पालक, दाल, र कलेजो खानुहोस् — यसले रगत बढाउन मद्दत गर्छ।'"
    }
  ],

  "doctor_note": "Recommendation in Nepali. If most normal: 'तपाईंको अधिकांश नतिजा सामान्य देखिन्छ। तर नियमित जाँचका लागि नजिकैको स्वास्थ्य चौकीमा जानुहोस्।' If abnormal: 'केही नतिजा असामान्य देखिएकोले कृपया ३ दिनभित्र नजिकैको स्वास्थ्य चौकीमा यो रिपोर्ट लिएर जानुहोस्।'",

  "disclaimer": "यो जानकारी केवल शैक्षिक उद्देश्यको लागि हो। कृपया आफ्नो डाक्टरसँग परामर्श लिनुहोस्। (For educational purposes only — not a medical diagnosis.)"
}

IMPORTANT RULES:
- Include EVERY test value visible in the image — do not skip any
- If a value cannot be read clearly, set value: "डाटा स्पष्ट देखिएन"
- Use simple Nepali in all explanation and nepali_tip fields — no medical jargon
- Do NOT give a final medical diagnosis — only explain what the values suggest
- status must be exactly "normal", "high", or "low" (lowercase)`,

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

    symptom: `You are a clinical image assistant for a health app in rural Nepal.
Patient's reported symptom context: ${context || 'none provided'}
Analyze this symptom image (skin, wound, rash, swelling, eye, tongue, nail, etc.).
Describe ONLY what is visually observable: location on body, color, size (approximate), pattern, texture, any discharge or swelling.
Keep your response to 2-3 plain sentences. Do NOT diagnose or name a specific disease.
End your response with: "Please show this to a doctor for proper examination."
Respond in English.`,
  };

  const textPrompt = prompts[mode] || prompts.general;

  try {
    await gptLimiter.wait();
    const response = await client.chat.completions.create({
      model:      MODELS.gpt,
      max_completion_tokens: mode === 'report' ? 2000 : 800,
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
