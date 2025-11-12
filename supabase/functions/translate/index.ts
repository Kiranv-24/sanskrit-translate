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
    const { text, sourceLang, targetLang } = await req.json();
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
        text,
        sourceLang: sourceLang || 'sa',
        targetLang,
        type: '2', // Google translation engine
      }),
    });

    const data = await response.json();

    // Check the code field in the JSON response
    if (data.code === 401) {
      return new Response(
        JSON.stringify({ error: 'API key not validated. Please check your LDFY_API_KEY.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (data.code === 402) {
      return new Response(
        JSON.stringify({ error: 'Insufficient account balance' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (data.code === 429) {
      return new Response(
        JSON.stringify({ error: 'Request rate exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (data.code !== 200) {
      console.error('Translation API error:', data);
      return new Response(
        JSON.stringify({ error: data.msg || 'Translation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in translate function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
