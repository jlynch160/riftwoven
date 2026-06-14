/* RIFTWOVEN — episodic memory write-back.
   The Loom summarizes recent turns client-side, then this function commits the
   memory into the eldervale-lore Search index (admin key stays server-side).
   Memories carry a saga id so retrieval can keep sagas from bleeding together. */
let used = { day: '', n: 0 };
const DAILY_CAP = 400;

module.exports = async function (context, req) {
  const env = process.env;
  if (!(env.SEARCH_ENDPOINT && env.SEARCH_ADMIN_KEY && env.SEARCH_INDEX)) {
    context.res = { status: 503, body: 'memory not configured' }; return;
  }
  const today = new Date().toISOString().slice(0, 10);
  if (used.day !== today) used = { day: today, n: 0 };
  if (used.n >= DAILY_CAP) { context.res = { status: 429, body: 'daily memory cap reached' }; return; }

  const b = req.body || {};
  const legend = !!b.legend;                 // a deed the whole WORLD remembers — visible to every future saga
  const saga = legend ? 'legend' : String(b.saga || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 60);
  const title = String(b.title || '').slice(0, 120);
  const content = String(b.content || '').slice(0, 1500);
  const keywords = String(b.keywords || '').slice(0, 300);
  if ((!legend && !saga) || !title || content.length < 20) { context.res = { status: 400, body: 'bad memory' }; return; }

  try {
    used.n++;
    const id = legend
      ? 'legend-' + (String(b.legendId || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50) || 'x' + (used.n))
      : 'mem-' + saga + '-' + String(b.turn || 0).replace(/\D/g, '');
    const url = `${env.SEARCH_ENDPOINT.replace(/\/$/, '')}/indexes/${env.SEARCH_INDEX}/docs/index?api-version=2024-07-01`;
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'api-key': env.SEARCH_ADMIN_KEY },
      body: JSON.stringify({ value: [{ '@search.action': 'mergeOrUpload', id, title, content, keywords, saga }] }) });
    if (!r.ok) { context.res = { status: 502, body: 'upstream ' + r.status }; return; }
    context.res = { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true, id }) };
  } catch (e) {
    context.res = { status: 502, body: 'memory failed: ' + e.message };
  }
};
