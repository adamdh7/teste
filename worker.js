export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. ANALIZ IMAJ (Image-to-Text)
    if (url.pathname === "/analize-imaj" && request.method === "POST") {
      const blob = await request.blob();
      const input = {
        image: [...new Uint8Array(await blob.arrayBuffer())],
        prompt: "Describe this image in detail",
      };
      const response = await env.AI.run("@cf/llava-v1.5-7b-it", input);
      return new Response(JSON.stringify(response), { headers: { "Content-Type": "application/json" } });
    }

    // 2. AUDIO TO TEXT (Whisper)
    if (url.pathname === "/audio-to-text" && request.method === "POST") {
      const blob = await request.blob();
      const input = {
        audio: [...new Uint8Array(await blob.arrayBuffer())],
      };
      const response = await env.AI.run("@cf/openai/whisper", input);
      return new Response(JSON.stringify(response), { headers: { "Content-Type": "application/json" } });
    }

    // 3. TEXT TO AUDIO (Speech)
    if (url.pathname === "/text-to-audio" && request.method === "POST") {
      const { text } = await request.json();
      const response = await env.AI.run("@cf/farspeak/ai-voice", { text });
      // Modèl sa a bay yon 'stream' odyo dirèkteman
      return new Response(response, { headers: { "Content-Type": "audio/wav" } });
    }

    return new Response("Tanpri itilize yon chemen valid (/analize-imaj, /audio-to-text, /text-to-audio)", { status: 400 });
  },
};
