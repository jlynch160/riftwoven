/* RIFTWOVEN — Model Context Protocol SERVER.
   The game is not just an MCP client: any MCP-speaking agent (Claude, Copilot,
   Foundry agents) can connect here and play Eldervale — ground on canon,
   roll the dice, and have the Loom narrate a turn. JSON-RPC 2.0 over HTTP. */
let used = { day: '', n: 0 };
const DAILY_CAP = 500;

const TOOLS = [
  { name: 'consult_lore', description: 'Search the Eldervale canon + saga memories (hosted Foundry IQ). Returns the top grounded passages.',
    inputSchema: { type: 'object', properties: { query: { type: 'string', description: 'what to look up' } }, required: ['query'] } },
  { name: 'roll_dice', description: 'Roll a d20 skill check, RIFTWOVEN rules: total = d20 + bonus vs DC; nat 20 always succeeds, nat 1 always fumbles; within 2 of DC = partial.',
    inputSchema: { type: 'object', properties: { bonus: { type: 'number' }, dc: { type: 'number' } }, required: ['dc'] } },
  { name: 'narrate_turn', description: 'Have the Loom (Game Master) narrate the outcome of a player action. Stateless: pass the world_state you are tracking and the action; returns JSON with narration, choices and state updates.',
    inputSchema: { type: 'object', properties: { action: { type: 'string' }, world_state: { type: 'string', description: 'compact JSON or prose summary of realm, location, party, quest' }, roll: { type: 'string', description: 'optional dice outcome to honor' } }, required: ['action'] } },
  { name: 'get_canon', description: 'Get the campaign premise and rules of the two-world setting, for orienting a new agent player.',
    inputSchema: { type: 'object', properties: {} } }
];

const CANON = `RIFTWOVEN — The Shattered Moon of Eldervale. Ninety years ago the mirror-moon Eldra was deliberately broken; every soul's reflection stepped free, inverted. The world exists as twinned mirror-faces: Arcanum(high fantasy)⇄Spire(cyberpunk), Mire(grim medieval)⇄Cogwarren(steampunk), Aetherium(cosmic)⇄Emberfall(post-apocalypse). The player and their reflection are Riftwoven — two halves of one soul. The Starwell beneath the Moonlit Gate can MEND, BREAK, or WEAVE the world anew. The Severed Court severs reflections; its hidden master is the Unmirrored King, the only being never given a reflection — he broke the moon. Party: Bran(warrior), Lyra(mage), Wren(healer), Vex(rogue), Kasimir(rival, untrusted). Actions resolve on d20 + bonus vs DC 10-18. Tearing the veil moves you ONLY to the current realm's twin.`;

function rollDice(bonus, dc) {
  const roll = 1 + Math.floor(Math.random() * 20);
  const total = roll + (bonus || 0);
  let result = total >= dc ? 'success' : (total >= dc - 2 ? 'partial' : 'failure');
  if (roll === 20) result = 'success'; if (roll === 1) result = 'failure';
  return { roll, bonus: bonus || 0, total, dc, result };
}

async function consultLore(env, query) {
  const url = `${env.SEARCH_ENDPOINT.replace(/\/$/, '')}/indexes/${env.SEARCH_INDEX}/docs/search?api-version=2024-07-01`;
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'api-key': env.SEARCH_KEY },
    body: JSON.stringify({ search: query, top: 3 }) });
  if (!r.ok) throw new Error('search ' + r.status);
  const j = await r.json();
  return (j.value || []).map(d => `【${d.title}】 ${d.content}`).join('\n') || 'No canon entry — improvise consistently with the two-world premise.';
}

async function narrateTurn(env, action, worldState, roll) {
  const sys = `You are the Game Master ("The Loom") of RIFTWOVEN. ${CANON}\nNarrate the outcome of the player action in 2-4 vivid sentences true to the current realm, then return STRICT JSON: {"narration":"...","choices":["3 short next actions"],"state_updates":{"location":"optional","player_hp":0,"flags":{}}}`;
  const usr = `World state: ${worldState || 'start of saga, Arcanum face, the Moonlit Gate'}.\nPlayer action: "${action}".${roll ? '\nDice outcome to honor: ' + roll : ''}`;
  const url = `${env.AOAI_ENDPOINT.replace(/\/$/, '')}/openai/deployments/${env.AOAI_DEPLOYMENT}/chat/completions?api-version=${env.AOAI_VERSION || '2024-08-01-preview'}`;
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'api-key': env.AOAI_KEY },
    body: JSON.stringify({ messages: [{ role: 'system', content: sys }, { role: 'user', content: usr }], temperature: 0.85, max_tokens: 480, response_format: { type: 'json_object' } }) });
  if (!r.ok) throw new Error('upstream ' + r.status);
  const j = await r.json();
  return (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '{}';
}

module.exports = async function (context, req) {
  const env = process.env;
  const rpc = req.body || {};
  const id = rpc.id !== undefined ? rpc.id : null;
  const reply = (result) => { context.res = { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id, result }) }; };
  const fail = (code, message) => { context.res = { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }) }; };

  if (req.method === 'GET') { reply({ name: 'riftwoven-mcp', version: '1.0.0', tools: TOOLS.map(t => t.name) }); return; }
  if (rpc.jsonrpc !== '2.0' || !rpc.method) { fail(-32600, 'invalid request'); return; }

  const today = new Date().toISOString().slice(0, 10);
  if (used.day !== today) used = { day: today, n: 0 };
  if (used.n >= DAILY_CAP) { fail(-32000, 'daily cap reached'); return; }
  used.n++;

  try {
    if (rpc.method === 'initialize') {
      reply({ protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'riftwoven-mcp', version: '1.0.0' } }); return;
    }
    if (rpc.method === 'notifications/initialized') { reply({}); return; }
    if (rpc.method === 'tools/list') { reply({ tools: TOOLS }); return; }
    if (rpc.method === 'tools/call') {
      const name = rpc.params && rpc.params.name;
      const args = (rpc.params && rpc.params.arguments) || {};
      let text;
      if (name === 'get_canon') text = CANON;
      else if (name === 'roll_dice') text = JSON.stringify(rollDice(+args.bonus || 0, +args.dc || 12));
      else if (name === 'consult_lore') text = await consultLore(env, String(args.query || '').slice(0, 300));
      else if (name === 'narrate_turn') text = await narrateTurn(env, String(args.action || '').slice(0, 500), String(args.world_state || '').slice(0, 2000), String(args.roll || '').slice(0, 200));
      else { fail(-32601, 'unknown tool ' + name); return; }
      reply({ content: [{ type: 'text', text }] }); return;
    }
    fail(-32601, 'unknown method ' + rpc.method);
  } catch (e) {
    fail(-32000, 'tool failed: ' + e.message);
  }
};
