/* RIFTWOVEN — chapter Visions relay (sora-2).
   The Loom dreams a short cinematic per chapter. Job-based: create → status →
   content (binary proxied through). Tight daily cap — video costs real money. */
let used = { day: '', n: 0 };
const DAILY_CAP = 30;

module.exports = async function (context, req) {
  const env = process.env;
  if (!(env.AOAI_ENDPOINT && env.AOAI_KEY && env.VIDEO_DEPLOYMENT)) {
    context.res = { status: 503, body: 'video relay not configured' }; return;
  }
  const base = `${env.AOAI_ENDPOINT.replace(/\/$/, '')}/openai/v1/videos`;
  const H = { 'api-key': env.AOAI_KEY };
  const b = req.body || {};
  const action = (req.query && req.query.action) || b.action || 'create';
  const id = String((req.query && req.query.id) || b.id || '').replace(/[^a-zA-Z0-9_-]/g, '');

  try {
    if (action === 'create') {
      const today = new Date().toISOString().slice(0, 10);
      if (used.day !== today) used = { day: today, n: 0 };
      if (used.n >= DAILY_CAP) { context.res = { status: 429, body: 'daily vision cap reached' }; return; }
      if (typeof b.prompt !== 'string' || b.prompt.length < 8 || b.prompt.length > 1600) {
        context.res = { status: 400, body: 'bad prompt' }; return;
      }
      used.n++;
      const r = await fetch(`${base}?api-version=preview`, { method: 'POST',
        headers: { ...H, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: env.VIDEO_DEPLOYMENT, prompt: b.prompt, size: '1280x720', seconds: String(Math.min(Math.max(+b.seconds || 4, 2), 8)) }) });
      const txt = await r.text();
      if (!r.ok) { context.res = { status: 502, body: 'upstream ' + r.status + ' ' + txt.slice(0, 200) }; return; }
      const j = JSON.parse(txt);
      context.res = { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: j.id, status: j.status }) };
      return;
    }
    if (!id) { context.res = { status: 400, body: 'missing id' }; return; }
    if (action === 'status') {
      const r = await fetch(`${base}/${id}?api-version=preview`, { headers: H });
      const j = await r.json();
      context.res = { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: j.status, progress: j.progress || 0 }) };
      return;
    }
    if (action === 'content') {
      const r = await fetch(`${base}/${id}/content?api-version=preview`, { headers: H });
      if (!r.ok) { context.res = { status: 502, body: 'upstream ' + r.status }; return; }
      const buf = Buffer.from(await r.arrayBuffer());
      context.res = { status: 200, isRaw: true, headers: { 'Content-Type': 'video/mp4', 'Cache-Control': 'no-store' }, body: buf };
      return;
    }
    context.res = { status: 400, body: 'unknown action' };
  } catch (e) {
    context.res = { status: 502, body: 'video relay failed: ' + e.message };
  }
};
