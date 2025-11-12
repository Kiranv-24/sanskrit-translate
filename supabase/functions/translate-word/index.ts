import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { word, sourceLang, targetLang } = await req.json();
    const LDFY_API_KEY = Deno.env.get('LDFY_API_KEY');

    if (!LDFY_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://ldfy.cc/translation/language/translate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LDFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: word,
        sourceLang: sourceLang || 'sa',
        targetLang,
        type: '2',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Word translation error:', data);
      return new Response(
        JSON.stringify({ error: 'Translation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in translate-word function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
