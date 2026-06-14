/* RIFTWOVEN — Community Loom image relay (gpt-image-1).
   Images cost real money, so the daily cap is tight and prompts are bounded. */
let used = { day: '', n: 0 };
const DAILY_CAP = 80;
const SIZES = ['1024x1024', '1536x1024', '1024x1536'];
const QUALITIES = ['low', 'medium', 'high'];

module.exports = async function (context, req) {
  const env = process.env;
  if (!(env.AOAI_ENDPOINT && env.AOAI_KEY && env.IMG_DEPLOYMENT)) {
    context.res = { status: 503, body: 'image relay not configured' }; return;
  }
  const today = new Date().toISOString().slice(0, 10);
  if (used.day !== today) used = { day: today, n: 0 };
  if (used.n >= DAILY_CAP) { context.res = { status: 429, body: 'daily image cap reached' }; return; }

  const b = req.body || {};
  if (typeof b.prompt !== 'string' || b.prompt.length < 8 || b.prompt.length > 2400) {
    context.res = { status: 400, body: 'bad prompt' }; return;
  }
  const size = SIZES.includes(b.size) ? b.size : '1024x1024';
  const quality = QUALITIES.includes(b.quality) ? b.quality : 'medium';
  const url = `${env.AOAI_ENDPOINT.replace(/\/$/, '')}/openai/deployments/${env.IMG_DEPLOYMENT}/images/generations?api-version=${env.IMG_VERSION || '2025-04-01-preview'}`;
  const FILTER = /content (management )?policy|content_filter|safety|moderation|ResponsibleAIPolicyViolation/i;
  // strip terms gpt-image-1's policy tends to reject, keeping the prose evocative
  const soften = (s) => String(s || '')
    .replace(/\b(menacing|fearsome|terrifying|threatening|violent|gory|brutal|savage|sinister|horror|horrifying)\b/gi, 'imposing')
    .replace(/\b(blade|sword|knife|dagger|axe|weapon|gun)s?\b/gi, 'relic').replace(/\b(blood|bloody|gore|wound)\w*/gi, 'silver light')
    .replace(/\b(kill|killer|slay|murder|behead|sever|corpse|death|dead)\w*/gi, 'fallen').replace(/\bboss enemy\b/gi, 'guardian');
  const gen = (prompt) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'api-key': env.AOAI_KEY },
    body: JSON.stringify({ prompt, n: 1, size, quality }) });

  const sleep = (ms) => new Promise(res => setTimeout(res, ms));
  try {
    used.n++;
    let r = await gen(b.prompt);
    // ONE short retry only — the client already serializes requests, so keep total time well
    // under the function timeout (no stacked retries → no 500).
    if (!r.ok) {
      const txt = await r.text();
      if (FILTER.test(txt)) { r = await gen(soften(b.prompt) + ' Tasteful, non-graphic, suitable for all audiences.'); }
      else if (r.status === 429) { await sleep(3000); r = await gen(b.prompt); }
      if (!r.ok) { context.res = { status: 502, body: 'upstream ' + r.status + ' ' + (FILTER.test(txt) ? '(filtered)' : txt.slice(0, 120)) }; return; }
    }
    const j = await r.json();
    const d = j.data && j.data[0];
    if (!d || !d.b64_json) { context.res = { status: 502, body: 'no image returned' }; return; }
    context.res = { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ b64: d.b64_json }) };
  } catch (e) {
    context.res = { status: 502, body: 'image relay failed: ' + e.message };
  }
};
