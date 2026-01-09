export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    const url = new URL(request.url);

    try {
      // Tcheke si AI binding nan egziste
      if (!env.AI) {
        throw new Error("AI binding pa jwenn. Verifye wrangler.toml ou.");
      }

      const blob = await request.blob();
      const arrayBuffer = await blob.arrayBuffer();

      // 1. ANALIZ IMAJ
      if (url.pathname === "/analize-imaj") {
        const input = {
          image: new Uint8Array(arrayBuffer), // Pa itilize [...] spreads pou gwo fichye
          prompt: "Describe this image",
        };
        const response = await env.AI.run("@cf/llava-v1.5-7b-it", input);
        return new Response(JSON.stringify(response), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }

      // 2. AUDIO TO TEXT
      if (url.pathname === "/audio-to-text") {
        const response = await env.AI.run("@cf/openai/whisper", {
          audio: new Uint8Array(arrayBuffer)
        });
        return new Response(JSON.stringify(response), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }

    } catch (e) {
      console.error(e); // Sa ap parèt nan 'wrangler tail' oswa dashboard la
      return new Response(JSON.stringify({ error: e.message }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
};
