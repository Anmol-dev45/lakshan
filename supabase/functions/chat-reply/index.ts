// Supabase Edge Function: chat-reply
// Returns a single follow-up question or reply during multi-turn symptom gathering
// Deploy: supabase functions deploy chat-reply

import { corsHeaders } from '../_shared/cors.ts';
import { CHAT_SYSTEM_PROMPT } from '../_shared/prompts.ts';

const CLAUDE_API = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json() as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
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

    const response = await fetch(CLAUDE_API, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 250,
        system: CHAT_SYSTEM_PROMPT,
        messages: messages.filter((m) => m.content?.trim()),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(
        JSON.stringify({ error: `Claude API error ${response.status}: ${errText}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const data = await response.json();
    const reply: string = data.content?.[0]?.text ?? 'म बुझें। अरु कुनै लक्षण छन्?';

    return new Response(
      JSON.stringify({ reply, usage: data.usage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
