export default {
  async fetch(request, env) {
    // Jere CORS (Preflight request)
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    try {
      // 1. ANALIZ IMAJ
      if (url.pathname === "/analize-imaj" && request.method === "POST") {
        const blob = await request.blob();
        const arrayBuffer = await blob.arrayBuffer();
        
        const input = {
          image: [...new Uint8Array(arrayBuffer)],
          prompt: "Describe this image in English and Kreyòl",
          max_tokens: 512
        };

        const response = await env.AI.run("@cf/llava-v1.5-7b-it", input);
        return new Response(JSON.stringify(response), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }

      // 2. AUDIO TO TEXT
      if (url.pathname === "/audio-to-text" && request.method === "POST") {
        const blob = await request.blob();
        const arrayBuffer = await blob.arrayBuffer();
        
        const input = {
          audio: [...new Uint8Array(arrayBuffer)]
        };

        const response = await env.AI.run("@cf/openai/whisper", input);
        return new Response(JSON.stringify(response), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
};
