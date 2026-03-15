// Supabase Edge Function: diagnose
// Proxies the Claude API call for full symptom analysis (avoids exposing API key to browser)
// Deploy: supabase functions deploy diagnose
// Secret:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { corsHeaders } from '../_shared/cors.ts';
import { DIAGNOSIS_SYSTEM_PROMPT } from '../_shared/prompts.ts';

const CLAUDE_API = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, session_id } = await req.json() as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
      session_id?: string;
    };

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured on server' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Filter out any system messages and append final analysis trigger
    const claudeMessages = messages
      .filter((m) => m.content?.trim())
      .concat({
        role: 'user',
        content: 'Based on everything described above, provide the full medical risk analysis JSON now.',
      });

    // Call Claude with retry on rate limit
    let attempts = 0;
    let response: Response | null = null;

    while (attempts < 3) {
      response = await fetch(CLAUDE_API, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1500,
          system: DIAGNOSIS_SYSTEM_PROMPT,
          messages: claudeMessages,
        }),
      });

      if (response.status === 429 || response.status === 529) {
        attempts++;
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempts)));
        continue;
      }
      break;
    }

    if (!response || !response.ok) {
      const errText = await response?.text();
      return new Response(
        JSON.stringify({ error: `Claude API error: ${response?.status} — ${errText}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const claudeData = await response.json();
    const rawText: string = claudeData.content?.[0]?.text ?? '';

    // Extract JSON from response (guard against any accidental markdown wrapping)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: 'Claude did not return valid JSON', raw: rawText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const diagnosis = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({
        diagnosis,
        session_id: session_id ?? crypto.randomUUID(),
        usage: claudeData.usage,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
