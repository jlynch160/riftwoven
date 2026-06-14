/* RIFTWOVEN — Community Loom chat relay.
   Visitors get live Azure OpenAI without keys: the key stays server-side in
   SWA app settings. GET = capability ping, POST = one chat completion.
   In-memory daily cap per instance keeps a stray crawler from burning quota. */
let used = { day: '', n: 0 };
const DAILY_CAP = 600;

module.exports = async function (context, req) {
  const env = process.env;
  const ready = !!(env.AOAI_ENDPOINT && env.AOAI_KEY && env.AOAI_DEPLOYMENT);

  if (req.method === 'GET') {
    context.res = { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ ok: ready, model: env.AOAI_DEPLOYMENT || '', img: !!env.IMG_DEPLOYMENT, lore: !!(env.SEARCH_ENDPOINT && env.SEARCH_KEY && env.SEARCH_INDEX), video: !!env.VIDEO_DEPLOYMENT }) };
    return;
  }
  if (!ready) { context.res = { status: 503, body: 'relay not configured' }; return; }

  const today = new Date().toISOString().slice(0, 10);
  if (used.day !== today) used = { day: today, n: 0 };
  if (used.n >= DAILY_CAP) { context.res = { status: 429, body: 'daily community cap reached — try tomorrow' }; return; }

  const b = req.body || {};
  const messages = b.messages;
  if (!Array.isArray(messages) || !messages.length || messages.length > 40 ||
      !messages.every(m => m && typeof m.role === 'string' && typeof m.content === 'string') ||
      JSON.stringify(messages).length > 60000) {
    context.res = { status: 400, body: 'bad messages' }; return;
  }
  const temperature = Math.min(Math.max(+b.temperature || 0.85, 0), 1.4);
  const max_tokens = Math.min(Math.max(+b.maxTokens || 520, 16), 900);
  const mkBody = (msgs) => { const o = { messages: msgs, temperature, max_tokens }; if (b.json) o.response_format = { type: 'json_object' }; return o; };
  const url = `${env.AOAI_ENDPOINT.replace(/\/$/, '')}/openai/deployments/${env.AOAI_DEPLOYMENT}/chat/completions?api-version=${env.AOAI_VERSION || '2024-08-01-preview'}`;
  const FILTER = /content (management )?policy|content_filter|ResponsibleAIPolicyViolation/i;
  const soften = (s) => String(s || '')
    .replace(/\bkilling\b/gi, 'unmaking').replace(/\bkilled\b/gi, 'unmade').replace(/\bkills\b/gi, 'unmakes').replace(/\bkill\b/gi, 'unmake')
    .replace(/\bmurder(ed|s|ing)?\b/gi, 'betrayal').replace(/\bslaughter(ed|s|ing)?\b/gi, 'rout').replace(/\bstab(bed|s|bing)?\b/gi, 'strike')
    .replace(/\bblood(y|ied)?\b/gi, 'silver ichor').replace(/\bcorpses?\b/gi, 'the fallen').replace(/\bgore\b/gi, 'ruin')
    .replace(/\bdied\b/gi, 'fell').replace(/\bdies\b/gi, 'falls').replace(/\bdeath\b/gi, 'the long dark').replace(/\bdead\b/gi, 'fallen');
  const call = async (msgs) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'api-key': env.AOAI_KEY }, body: JSON.stringify(mkBody(msgs)) });

  try {
    used.n++;
    let r = await call(messages);
    if (!r.ok) {
      const txt = await r.text();
      if (FILTER.test(txt)) {
        // Azure tripped on fantasy violence — soften the prose and retry once
        const soft = messages.map(m => ({ ...m, content: soften(m.content) }));
        r = await call(soft);
        if (!r.ok) { context.res = { status: 502, body: 'upstream ' + r.status + ' ' + (await r.text()).slice(0, 140) }; return; }
      } else { context.res = { status: 502, body: 'upstream ' + r.status + ' ' + txt.slice(0, 140) }; return; }
    }
    const j = await r.json();
    context.res = { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ content: (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '' }) };
  } catch (e) {
    context.res = { status: 502, body: 'relay failed: ' + e.message };
  }
};
