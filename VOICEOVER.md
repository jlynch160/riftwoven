# RIFTWOVEN — 4-Minute Demo Voiceover (Hackathon-Aligned)

**For:** Microsoft Agents League · **Reasoning Agents** track · Challenge B
**Capture:** Snip (screen) · **Talk track:** ElevenLabs (deep storyteller voice = "The Loom")
**Target runtime:** 4:00 (≈ 470 words of measured narration + ~30s breathing room)

> The narration is written so a judge hears every scored component by name — Game Master
> orchestrator, character-agent council, Foundry IQ grounding, tool-calling, MCP, telemetry,
> human-in-the-loop, and the evaluation suite — without it ever sounding like a checklist.

---

## Storyboard (record Snip to match each scene)

### Scene 1 · Cold open — 0:00–0:20
**On screen:** Title screen or a chapter cinematic playing.
> The moon was a mirror — and ninety years ago, someone broke it on purpose. Every reflection in the world stepped out of the glass, and got everything backwards. This… is RIFTWOVEN — The Shattered Moon of Eldervale.

### Scene 2 · The pitch + the track — 0:20–0:45
**On screen:** Slow pan across the live game UI.
> Built for the Microsoft Agents League — the Reasoning Agents track — RIFTWOVEN is a multi-agent role-playing game, powered end to end by Azure AI Foundry. And its whole purpose is to make agent reasoning something you can actually see.

### Scene 3 · The Game Master orchestrator ⭐ — 0:45–1:25
**On screen:** Submit a turn. Let 🧠 THE LOOM'S REASONING expand; scroll its numbered steps slowly.
> At its heart is a Game Master agent — the Loom — an orchestrator. Every turn, it runs a real reasoning loop. It interprets your intent. It grounds itself in the campaign canon with Foundry I.Q. — retrieval over an Azure AI Search index of the world's lore. Then it fans out to a council of specialized character agents — warrior, mage, rogue, healer, and a rival — each reasoning in character. It resolves the action with a dice tool, tunes the tension, and narrates the outcome — every step rendered live, and timed, by GPT-4.1.

### Scene 4 · Tools, MCP, observability, the rubric ⭐ — 1:25–2:05
**On screen:** Open the Agents / telemetry tab — show the call log and the architecture legend.
> This is genuine agentic tool use. The Loom calls tools to roll skill checks, to search public-domain lore, and to read and write shared world state — and it exposes those tools over the Model Context Protocol, so other AI agents can play it too. The Agents dashboard logs every call — which agent, which tool, Azure or local, how long it took. Irreversible choices ask for your confirmation — human in the loop — and a built-in evaluation suite keeps the rules and the story consistent.

### Scene 5 · Multimodal Azure stack — 2:05–2:35
**On screen:** Point at the ⚡ LIVE AI bar; trigger a portrait + a line of voice so chips pulse.
> And it's not one model — it's a multimodal Azure orchestra. Watch the Live AI bar light up as each one fires. GPT-4.1 reasoning… gpt-image painting your party and your foes… Sora 2 filming the cinematics… Azure Speech voicing the world… and Foundry I.Q., remembering every saga ever played — weaving past players' deeds into a shared legend.

### Scene 6 · Commune (let it breathe) 🔊 — 2:35–2:50
**On screen:** Open Commune; let the live voice answer ~8–10s. **Narration silent here.**
> You can even speak with the Loom… directly.
> `[let the Loom's live gpt-realtime voice play]`

### Scene 7 · The Split Fiction realm-tear ⭐ — 2:50–3:20
**On screen:** Trigger the veil-tear — the screen-tearing transition, palette / gear / map flip.
> And the world exists twice. Tear the veil…
> `[pause for the tear transition + sound]`
> …and reality flips — Split Fiction style — across six mirrored realms. The interface, your companions, the magic, the soundtrack, the map — all of it transforms in a single screen-tearing moment.

### Scene 8 · Depth + reliability — 3:20–3:45
**On screen:** Level-up / skill tree, factions, the fused two-faced atlas map.
> Beneath it all is a full RPG — a Diablo-style skill tree tuned to your class and your realm, factions that remember what you've done, and a two-faced map painted by AI. It runs live for anyone — no keys, no install — and fully offline too, so a live demo can never fail.

### Scene 9 · Close — 3:45–4:00
**On screen:** End on the title + the live URL.
> A Game Master that reasons in the open. A council of agents. A world you can tear in two. RIFTWOVEN — built to show what a reasoning agent really looks like. Cross the rift… the Loom is dying. And it's listening.

---

## Rubric coverage (what each scene proves to a judge)

| Scored component | Heard in |
|---|---|
| Reasoning Agents track framing | Scene 2 |
| Game Master orchestrator + reasoning loop | Scene 3 |
| Multi-agent character council | Scene 3 |
| Foundry IQ grounding / RAG (Azure AI Search) | Scenes 3, 5 |
| Tool-calling (dice / code-interpreter, web search, state) | Scenes 3, 4 |
| Model Context Protocol (agent interop) | Scene 4 |
| Telemetry / observability dashboard | Scene 4 |
| Human-in-the-loop | Scene 4 |
| Evaluation suite | Scene 4 |
| Multimodal Azure AI (gpt-4.1 / gpt-image-1 / sora-2 / Speech / realtime) | Scenes 5, 6 |
| Reliability (live + offline) | Scene 8 |

---

## ElevenLabs settings

- **Voice:** deep, measured storyteller — George / Daniel / Adam. **Model: Eleven v3** (supports inline tags).
- Tag Scene 1's first line `[slow]`; tag *"the Loom is dying — and it's listening"* `[whispers]`.
- **Stability ~40**, **Style ~20**, **Speed just below default.** The `…` and `—` pace it; add `<break time="0.8s" />` at scene seams if rendering as one file.
- **Render per scene** (9 clips: s1…s9) — far easier to sync to Snip than one long file.
- **Pronunciation test:** confirm **RIFTWOVEN** = *rift-woven*, **Eldervale** = *el-der-vale*. If off, paste `Rift-woven` / `Elder-vale`. Tech terms are already spelled TTS-safe (Foundry I.Q. / Sora 2 / gpt-image).

**Timing note:** narration ≈ 3:30–3:45 of speech + the Commune and tear breathing moments = ~4:00. If a test render runs long, cut Scene 8 to its last sentence; if short, hold longer on the cinematic and the tear.
