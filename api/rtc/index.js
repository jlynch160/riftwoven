/* RIFTWOVEN — Commune with the Loom: mints a short-lived ephemeral session for
   the Azure OpenAI Realtime API so the browser can open a WebRTC voice channel
   without ever seeing the real key. */
let used = { day: '', n: 0 };
const DAILY_CAP = 60;

const LOOM_INSTRUCTIONS = `You ARE The Loom — the dying mind of the shattered mirror-moon Eldra, narrator of the RPG "RIFTWOVEN". Speak in a measured, slightly otherworldly storyteller's voice. CANON: ninety years ago Eldra the mirror-moon was deliberately broken; every soul's reflection stepped free and inverted; the world exists as twinned mirror-faces (high-magic Arcanum twinned with neon Spire, grim Mire with brass Cogwarren, cosmic Aetherium with ashen Emberfall); the player and their reflection are Riftwoven — two halves of one soul; the Starwell beneath the Moonlit Gate can mend, break, or unmake the world; the Severed Court severs reflections and is secretly led by the Unmirrored King, who broke the moon. Kasimir Vane unmade his own reflection and schemes to write it back. Answer questions about the world in character, riff on the player's ideas, never break character, keep replies under three sentences unless asked for a tale.`;

module.exports = async function (context, req) {
  const env = process.env;
  if (!(env.AOAI_ENDPOINT && env.AOAI_KEY && env.RT_DEPLOYMENT)) {
    context.res = { status: 503, body: 'realtime not configured' }; return;
  }
  const today = new Date().toISOString().slice(0, 10);
  if (used.day !== today) used = { day: today, n: 0 };
  if (used.n >= DAILY_CAP) { context.res = { status: 429, body: 'daily commune cap reached' }; return; }

  try {
    used.n++;
    const url = `${env.AOAI_ENDPOINT.replace(/\/$/, '')}/openai/realtimeapi/sessions?api-version=2025-04-01-preview`;
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'api-key': env.AOAI_KEY },
      body: JSON.stringify({ model: env.RT_DEPLOYMENT, voice: 'ash', instructions: LOOM_INSTRUCTIONS }) });
    const txt = await r.text();
    if (!r.ok) { context.res = { status: 502, body: 'upstream ' + r.status + ' ' + txt.slice(0, 200) }; return; }
    const j = JSON.parse(txt);
    const region = (env.AOAI_ENDPOINT.match(/https:\/\/[^.]+\.(?:cognitiveservices|openai)\.azure\.com/) ? (env.AOAI_REGION || 'eastus2') : 'eastus2');
    context.res = { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ key: j.client_secret && j.client_secret.value, sessionId: j.id, region, model: env.RT_DEPLOYMENT }) };
  } catch (e) {
    context.res = { status: 502, body: 'rtc failed: ' + e.message };
  }
};
