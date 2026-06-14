/* RIFTWOVEN — Community Loom lore relay (hosted Foundry IQ / Azure AI Search). */
let used = { day: '', n: 0 };
const DAILY_CAP = 2000;

module.exports = async function (context, req) {
  const env = process.env;
  if (!(env.SEARCH_ENDPOINT && env.SEARCH_KEY && env.SEARCH_INDEX)) {
    context.res = { status: 503, body: 'lore relay not configured' }; return;
  }
  const today = new Date().toISOString().slice(0, 10);
  if (used.day !== today) used = { day: today, n: 0 };
  if (used.n >= DAILY_CAP) { context.res = { status: 429, body: 'daily lore cap reached' }; return; }

  const legends = !!(req.body && req.body.legends);   // fetch the shared WORLD LEGEND — deeds of every player before
  const q = req.body && req.body.query;
  if (!legends && (typeof q !== 'string' || !q.trim() || q.length > 400)) {
    context.res = { status: 400, body: 'bad query' }; return;
  }
  try {
    used.n++;
    const url = `${env.SEARCH_ENDPOINT.replace(/\/$/, '')}/indexes/${env.SEARCH_INDEX}/docs/search?api-version=2024-07-01`;
    const body = legends
      ? { search: (typeof q === 'string' && q.trim()) ? q : '*', filter: "saga eq 'legend'", top: 6 }
      : { search: q, top: 3 };
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'api-key': env.SEARCH_KEY },
      body: JSON.stringify(body) });
    if (!r.ok) { context.res = { status: 502, body: 'upstream ' + r.status }; return; }
    const j = await r.json();
    const hits = (j.value || []).map(d => ({ t: d.title || 'lore', x: d.content || '', saga: d.saga || null }));
    context.res = { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ hits }) };
  } catch (e) {
    context.res = { status: 502, body: 'lore relay failed: ' + e.message };
  }
};
