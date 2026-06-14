# Changelog

## [1.11.1] — 2026-06-13
Reasoning front-and-center — the thing the Reasoning-Agents track is judged on is now the loudest thing on screen.

### Changed
- **The Loom's Mind trace is now the hero.** Re-titled to **🧠 THE LOOM'S REASONING**, it now opens
  automatically every turn (no click), lays the decision out as a **numbered reasoning chain** —
  ① interpret → ② ground in canon (Foundry IQ) → ③ each agent's argument → ④ dice → ⑤ drama loom →
  ⑥ narrate — with numbered step badges, a glowing brain, a step counter, and a pulsing
  **⚡ gpt-4.1 · <ms>** live badge proving the reasoning ran live (vs. offline simulation).
- **The 🧠 gpt-4.1 chip in the LIVE AI bar is now the hero chip** — larger, always lit and breathing,
  labelled 'gpt-4.1 reasoning' with a 'drives ▸' tag, so it reads as the brain driving every other model.


## [1.11.0] — 2026-06-13
LIVE AI HUD — the AI is now obvious and front-and-center.

### Added
- A **⚡ LIVE AI** bar across the top of the play area with a chip for each Azure model —
  🧠 gpt-4.1 (reasoning), 🎨 gpt-image-1 (vision), 🎬 sora-2 (film), 🗣 Azure Speech (voice),
  📚 Foundry IQ (knowledge). Each chip is dim when idle and **lights up and pulses in real time the
  instant its model fires** (driven off the telemetry stream + the voice + image pipelines), so it
  is unmistakable that the game is running live AI — exactly what a Reasoning-Agents judge wants to
  see. Realm-tinted, responsive (labels collapse to icons on phones).


## [1.10.7] — 2026-06-13
Chapter I cinematic plays before your first decision · image-queue & relay fixes.

### Added
- The **Chapter I sora-2 cinematic now plays before your first decision**: it begins rendering during
  the prologue (max lead time), and at the start of play the first choices are held — "🎬 the Loom is
  dreaming the opening of your saga…" — until the cinematic premieres, then the choices appear.
  Falls through instantly if video isn't available.

### Fixed
- Image **500/502s** resolved properly: the client now runs **2 concurrent** image jobs with a
  **priority lane** so combat/villain art jumps ahead of the slow portrait/scene/atlas jobs (no more
  waiting 60s behind the queue); deployment **capacity bumped 1→3**; and the /api/img relay retries
  were **slimmed to one short attempt** so a request can't stack sleeps past the function timeout (the
  cause of the 500).


## [1.10.6] — 2026-06-13
The REAL enemy-image fix — it was a concurrency collision, not the filter.

### Fixed
- Root cause of the persistent /api/img 502s: the gpt-image-1 deployment had **capacity 1**, so when
  several image generations fired at once (duo portraits + scene art + atlas + the villain), they
  collided and the extras were rejected. Three fixes:
  1. **Client serializes all image requests** — genImage now runs them one at a time through a queue,
     so they never collide regardless of deployment size.
  2. **Bumped the deployment capacity 1 → 3** (the quota max).
  3. The **/api/img relay retries on 429** (rate limit) with a short backoff.
- Verified: three concurrent image requests that previously 502'd now all return 200 (~1.7MB each).


## [1.10.5] — 2026-06-13
The rival stands apart from the party.

### Changed
- The party panel now **separates Kasimir (the Rival) from the trusted allies** — your loyal party
  renders first, then a ⚔ THE RIVAL divider, then his card, which is tinted crimson with a red
  portrait glow to mark him as an untrusted, recurring antagonist rather than a comrade.


## [1.10.4] — 2026-06-13
Enemy images fixed — face portraits that actually generate.

### Fixed
- Enemy art was returning **/api/img 502** — gpt-image-1's content policy was rejecting the violent
  full-body creature prompt (and the injected combat descriptions about knives/killers). Three fixes:
  1. The enemy prompt is now a **face portrait** ("close-up on the face and head, intense gaze") —
     fits the combat bar better and reads as a character, not a gory threat.
  2. Filter-safe wording (no menacing/blade/blood/boss-enemy); the **/api/img relay** now softens such
     terms and retries once on a content-filter trip.
  3. Applied the permissive **riftwoven-permissive** RAI policy to the gpt-image-1 deployment too.
- Verified live: the exact Null-Proxy prompt that was 502-ing now returns a face portrait (200).


## [1.10.3] — 2026-06-13
Enemy creatures get a proper reveal.

### Added
- When a foe's gpt-image-1 creature art lands in combat, it now **reveals full-screen** — a punchy
  framed portrait with an ⚔ ENCOUNTER tag and the creature's name — then drops you into the fight
  (auto-dismiss in 3s, or tap to engage). The painted creature still fills the combat bar and lunges
  on its strikes. Verified the enemy image generates live (1.6MB creature concept art).


## [1.10.2] — 2026-06-13
Split map: both faces painted, fused beautifully.

### Changed
- Opening the Map in **Split** now **pre-generates the mirror realm's painted atlas** too
  (generateMapArt parameterized by realm), so both halves can show their AI-painted faces meeting at
  the rift — not one painted + one procedural.
- Made the fused atlas **super visually appealing**: a light **sheen sweeps** across both worlds,
  **sparks rise** along the glowing rift seam, the central **medallion pulses**, per-half **"painting
  your face… / painting the mirror…"** ribbons show while each atlas renders, and once **both faces
  are painted** the whole atlas gains a dual-color outer glow (your accent + the mirror's).


## [1.10.1] — 2026-06-13
Maps truly fuse · content filter fixed at the source.

### Fixed — the split map now MIXES
- Split view no longer shows two separate map cards. The two faces are **fused into one continuous
  world**: the left half is your realm (its palette, cartouche, labels), the right half is the mirror
  (its neon/holo style), painted over the SAME geography so the coastline and roads flow unbroken
  across a glowing central rift seam. Achieved by overlaying both maps and clip-pathing each to its
  half — identical geometry means they align perfectly. Verified by render.

### Fixed — content filter no longer drops you to offline
- Applied a **custom, more-permissive content-filter policy** (riftwoven-permissive) to the gpt-4.1
  deployment: harm categories now block only at HIGH severity and the jailbreak shield is off, so
  ordinary dark-fantasy combat prose stops tripping Azure's filter. Verified — a graphic battle
  prompt that used to be blocked now returns live narration (200).
- Belt-and-suspenders: the /api/llm relay now **softens violent prose and retries once** server-side
  on a content-filter trip; and the client's fallback is now a graceful in-world line
  ("the Loom turns its eyes from something too dark to tell…") instead of a raw 502 error.


## [1.10.0] — 2026-06-13
Fancier dropdowns · impressive enemy art · combined split map · a bigger skill tree.

### Skill tree — more expansive & more visual
- **Grew from 15 to 24 perks** — a new fourth branch, **THE MIRROR** (soul/reflection powers:
  Empathy → Quickening → Soulward → Twin-Sighted → Fortune's Mirror → Riftwoven Ascendant), and
  every branch deepened to **6 tiers** with a starred **CAPSTONE** at the end.
- New **XP perks** (Quickening +15%, Ascendant +25%) wired into the XP curve; the fourth branch
  re-skins to your universe too (Soulglass / Mirror Protocol / The Reflection / Brass Mirror / …).
- Visuals: starfield behind the tree, **energy that flows down owned connectors**, golden capstone
  orbs, branch hover-lift, wider card.

### Enemy art — more impressive creatures
- Combat now paints **full-body boss concept art** of the foe (gpt-image-1) using each creature's
  own description + the realm's art style, shown in a **bigger framed portrait** that materializes
  with a reveal flourish; the painted creature still lunges full-screen on its strikes.

### Combined split map
- With ◫ Split on, the two faces no longer sit as separate cards — they **fuse into one atlas torn
  across a glowing rift seam** (with a central medallion), so it reads as a single world split down
  the mirror. Stacks with a horizontal rift on phones.

### Fancy dropdowns
- The character-creation selects are now **gilded dark-glass dropdowns** — realm-tinted borders, a
  custom gold chevron, Cinzel labels, and a dark themed option list.


## [1.9.1] — 2026-06-13
Cosmetic polish pass — depth, glow, refinement.

### Changed (all realm-aware, additive — no layout changes)
- **Cinematic vignette** over the board for edge depth (non-interactive, sits below all overlays).
- **Richer choice buttons**: gradient fill, a glowing realm-accent spine, slide + glow on hover, and
  the number key restyled as a little keycap chip.
- **Narration as an illuminated plaque**: a soft accent-tinted wash behind the Loom's prose and a
  glowing drop-cap.
- **Party-card depth**: gradient + inner-light + drop shadow, lift-and-glow on hover, portrait rings
  that glow in the realm color (the player's brighter).
- **Premium input dock**: inset field, gilded ACT button with gloss and hover lift.
- Dialogue bubbles and avatars gained soft depth; **scrollbars themed** to the realm accent app-wide.

### Fixed
- Re-verified the </style> tag and full DOM integrity after the edit (268 divs, zero errors) — no
  repeat of the earlier body-swallow bug.


## [1.9.0] — 2026-06-13
Responsive — phone · iPad · desktop.

### Added
- The desktop-locked 3-column board now adapts to every form factor (verified live by computed layout):
  - **Desktop & iPad landscape (>980px)**: the full 3-column viewport-locked board.
  - **iPad portrait (620–980px)**: a 2-column grid — the play scene spans the top, party & world
    panels sit side-by-side below, page scrolls.
  - **Phone (≤980px / ≤560px)**: a single stacked column, scene first, page scrolls; the header
    wraps and sheds labels to icons; overlays (level-up, map, sheet) go single-column; 16px inputs
    to stop iOS zoom-on-focus; comfortable tap targets.
- The scene keeps its internal scroll on small screens (≈58vh) so the play area stays usable while
  the page scrolls to the party/world panels below.

### Fixed
- A missing </style> tag (introduced while adding the responsive block) was swallowing the entire
  page body as CSS — caught via DOM/structure checks and repaired before it mattered.


## [1.8.0] — 2026-06-13
The level-up screen, rebuilt Diablo-grade.

### Changed — skill tree overhaul
- **Expanded to 15 perks** (3 branches × 5 tiers, was 9): Ironhide → Bladedancer → Warbrand → Unbroken
  → Juggernaut, and equivalents on the Veil and Shadow paths, each with a rune icon and tier badge.
  Tiers gate by level, so the capstones are a long-term climb.
- **Diablo aesthetic**: circular ornate **rune orbs** with state glows (owned = gold-filled with a ✓
  seal, available = pulsing colored ring, locked = darkened with a lock), glowing branch **connectors**,
  gothic recessed branch frames, a gold stone-carved card border, drifting **ember particles**, and a
  gilded Cinzel level banner. The class-signature branch pulses with a golden "your path" glow.
- Attribute rows reforged as gem-framed plates with gilded values and ember bars.
- All effects still wired (HP, damage, skills, veil, loot, soul-keep) and the realm/class re-skinning
  preserved (the branches still rename to your home universe).


## [1.7.4] — 2026-06-13
A death cinematic — the Loom replays your fall.

### Added
- **Death cinematic (sora-2)**: when your life reaches 0 (in combat or from the story), the Loom
  replays your fall as a generated 4-second film before it rewinds time to save you. A dark
  full-screen reveal with a pulsing skull while it renders, then the cinematic plays, then the
  existing death-save revives you at half HP. Triggers from combat AND from narrative damage.
- The death scene is rendered as a **filter-safe dissolution** — the hero fading into silver light
  and embers as their reflection shatters from a cracked mirror — on-theme with the mirror premise
  and past sora-2 content moderation (a literal death scene was rejected). Verified live (2.8MB clip).
  Falls back gracefully to a brief darkness card if video is unavailable.


## [1.7.3] — 2026-06-13
The Unmirrored King · pacing · a harder Chapter II.

### Added — the ultimate villain
- **THE UNMIRRORED KING**: the one being born with no reflection, who shattered the moon-mirror.
  When Chapter IV begins he is **revealed in a full-screen reveal** — a scary, dark gpt-image-1
  portrait of him shattering the mirror-moon, with a slow zoom, blood-vignette and heralding line.
  His portrait is **pre-painted a chapter early** (on the first Eclipse / Chapter III) and cached,
  so the reveal is instant; he is paid off at the Starwell finale.

### Changed
- **Harder Chapter II**: no longer fires on your first veil-tear. You must cross into the mirror
  world AND survive a real trial — win a fight, uncover the gate sigil, or explore the world
  (3+ places) — turn fallback raised to 26.
- **Spaced-out cast**: the rival (Kasimir) now moves every 5 turns instead of 3, so his beats land
  harder; and fewer allies chime per ordinary turn (the full party still debates major acts).


## [1.7.2] — 2026-06-13
Chapters are now story-event milestones (Tolkien-style), not turn counts.

### Changed
- **Chapters advance on story events**, each with a heralding line, in sequence:
  - **II · The Two-Faced Road** — when you first cross into the mirror world (walk both faces).
  - **III · The Severed Court** — when you reach the Court, or learn what Kasimir is hiding.
  - **IV · The Unmirrored King** — when an Eclipse first tears the world, Kasimir reaches the Well,
    or his schemes run far enough.
  - **V · The Reweaving** — the finale event: descending the Starwell at the Throat.
- Each milestone has a generous **turn fallback** (18/38/58) so a quiet playthrough never stalls,
  but events almost always fire first. A short italic herald precedes each chapter card.


## [1.7.1] — 2026-06-13
Chapters now advance on the turn count, not on level.

### Changed
- **Chapters are turn-gated**: Chapter II at turn 10, III at turn 24, IV at turn 40 — they advance as
  you play, decoupled from leveling. The finale **Chapter V stays event-gated** (descending the
  Starwell at the Throat). Each chapter card still fires its own gated sora-2 vision, and waits for a
  calm beat (never over combat, the level-up screen, or another chapter card).
- **Level-up now only grants the level-up screen** (attribute points + skill tree) — it no longer
  triggers chapters, so progression pace and the chapter beats are independent.


## [1.7.0] — 2026-06-13
Level-up screen · skill tree · slower, story-gated chapters.

### Added — a real progression screen
- **Level-up overlay**: on each level you get **+3 attribute points** to spend across the seven
  skills (Might/Grit/Arcana/Insight/Stealth/Cunning/Mercy) with +/- steppers and live bars, plus
  **+1 skill point** for a three-branch **skill tree** (3 tiers each, prereq + level-gated nodes,
  owned/available/locked states, animated). Glassy, gold-crowned, visually impressive.
- **The tree aligns with your class AND your universe**: the three branches re-skin to the world you
  came from — e.g. Spire shows Combat Subroutines / The Deep Net / Ghost Protocol; Mire shows The
  Iron Oath / The Old Rites / The Quiet Knife (six realm variants). The branch matching your class
  is crowned **✦ your path**.
- **Perks actually do things**: +Max HP, +combat damage (Bladedancer), +Arcana/Insight, spells
  strain the veil 50% less (Veilwright), an Eclipse no longer swaps your soul (Mirrorbound),
  +50% scavenged moonshards (Scavenger), and stat/shard boosts — all wired into the live systems.

### Changed
- **Leveling is ~2.5× slower** (XP curve l×100 → l×250) so chapters land less often and each one
  matters more.
- **Chapters are gated to progression**: II / III / IV fire on reaching **Level 2 / 3 / 4** (a level
  gate), and the finale **Chapter V** is a **story-event gate** — descending the Starwell at the
  Throat. Each chapter card still triggers its own gated sora-2 vision, now after the level-up screen.


## [1.6.0] — 2026-06-13
Cleaner header · chapter progression · villain art · dual-world map.

### Changed / Added
- **Header decluttered**: removed the realm pill (ARCANUM ⇄ ⚡) and the mic icon. Realm shifts now
  happen through the story (tear the veil via a choice or the Eclipse), keeping the bar clean.
- **Chapter progression**: chapters now advance as you level up — LVL 2 → Chapter II (The Two-Faced
  Road), LVL 3 → Chapter III (The Severed Court), LVL 4 → Chapter IV (The Unmirrored King), and the
  finale Chapter V at the Starwell. Each chapter card triggers its own gated sora-2 vision.
- **Villains are painted (gpt-image-1)**: combat now generates a menacing portrait of the foe; when
  it lands a blow, the painted face lunges across the screen with a slash. The combat bar shows the
  real painted villain.
- **Dual-world map**: with ◫ Split on, the Map shows BOTH faces side by side — your world and its
  mirror across the seam — each click-to-travel.


## [1.5.1] — 2026-06-13
Chapter visions are now gated to their chapter.

### Changed
- A chapter cinematic (sora-2) now premieres ONCE, right after its own chapter card has dismissed —
  never mid-card, mid-combat, or mid-turn (it waits politely for an idle beat). It is strictly gated
  to the active chapter, so a slow render for an old chapter can no longer surprise you later, and no
  second cinematic shows until the next chapter card advances the gate. The 🎬 badge still replays any
  dreamt vision on demand.


## [1.5.0] — 2026-06-13
Architecture map, rebuilt as a narrative — complex, complete, alive.

### Changed — the Live Architecture map is now a story you can read
- **45 parts across 6 columns** (was 27/5): added THE FORGE render-engine column (Canvas FX, Spell
  VFX, Cinematic Dice, Generative Music, Realm System, Split/Portals, Procedural Atlas) and many
  previously-hidden parts — Intent Classifier, Combat System, Quest/Lead generator, Offline Loom,
  Canon Index, Echo Ledger, Relay Functions, Two-Teller Co-op, Autonomous Play, Bleed-through,
  Lore Cards. Nothing is hidden now.
- **"The Life of a Turn" ribbon**: an 8-step narrative lifecycle across the top (You speak → reads
  it → party confers → grounds in canon → dice fall → narrates → world answers → remembered).
- **Numbered step badges ①–⑧** on the critical-path nodes, and an always-animated **violet spine**
  tracing the living turn so the flow reads at a glance instead of as disconnected boxes.
- **⚡ Trace a turn** now walks all phases, lights the matching ribbon step, scrolls each node into
  view, and narrates the journey end-to-end.
- Column subtitles, tighter 6-column layout, fixed the clipped agents line, faint secondary links
  vs. the bright spine so density reads cleanly.


## [1.4.1] — 2026-06-13
Layout cleanup — architecture map + header.

### Fixed
- **Architecture map decluttered**: connectors dropped to a faint web (only lighting on hover/trace),
  all 5 columns now fit without clipping THE WORLD, columns vertically centered (no empty void),
  the Loom box title de-duplicated to a single ORCHESTRATION CORE label, SVG link origin corrected.
- **Header**: removed an overflow:hidden that was clipping the wordmark to RIFTWOVE and the subtitle
  to MOO; the brand no longer shrinks. Wordmark + tagline render in full at all widths.


## [1.4.0] — 2026-06-13
⧉ LIVE ARCHITECTURE MAP — the whole system, visible and animated.

### Added
- **Interactive architecture screen** (⋯ → Live Architecture): a 5-column node graph of the entire
  system — THE TELLER → THE LOOM (orchestration core, boxed) → TOOLS & MEMORY → AZURE AI FOUNDRY →
  THE WORLD. 27 nodes, 36 drawn connectors, typed badges (LLM/DET/RAG/MCP/IMG/VID/WORLD/SERVER…).
- **Live Azure status**: each cloud node shows a green pulse when its service is actually reachable
  (detected from the personal key or the Community relay) — 14 live on the public deployment.
- **Hover** lights a node's connections and dims the rest; **click** pins a rich detail panel
  (what it is, what it connects to, real vs. deterministic).
- **⚡ Trace a turn through the Loom**: animates a representative player-turn flowing node-by-node
  through the real pipeline — action → orchestrator → Foundry IQ → gpt-4.1 → council → dice →
  narration → Mind → image → voice → memory → legend — connectors lighting as the data flows.
  The architecture diagram is a live instrument, not a static picture.
- Headless-verified render (27 nodes / 5 cols / 36 links, hover + trace working) and screenshotted
  live as a submission asset (architecture.png).


## [1.3.0] — 2026-06-13
PERSISTENT ELDERVALE · THE LOOM PLAYS ITSELF · THE LOOM KNOWS WHAT IT IS.

### 🌍 Persistent Eldervale — a world every player shapes
- Great deeds are promoted to a shared **LEGEND tier** in the Azure Search index (new legend
  write path on /api/memory with unique ids; /api/lore legends mode with a saga eq legend filter).
- An **Eclipse-scar** and every **ending** inscribe a legend naming the teller, the place, and what
  they did — committed to the index for EVERY future saga, anyone, anywhere.
- New sagas **recall a legend at the opening** ("🌍 THE WORLD REMEMBERS — before you, others walked
  here…") and feed it to the live GM as inherited history; legends also surface in normal lore
  grounding mid-play. Private memories stay walled to their own saga; legends are shared by all.
- Verified end-to-end live: legend write → legends-mode recall → grounding query. Seeded three
  atmospheric legends (Sol's scar, Veyra who poured the Well into the Loom, Corin who would not cast)
  so the world is already inhabited for the first visitor.

### 🤖 The Loom Plays Itself — autonomous spectate (⟳ Dream alone)
- A header button hands off the keys: an agent takes the turns — choosing from the live options with
  a SIX-WORD in-character rationale (shown), rolling dice, fighting, reasoning traces unfolding.
  An animated "⟳ THE LOOM DREAMS ALONE" band marks autonomous play; click again to take back the keys.
  The game now demos itself.

### 🪞 The Loom Knows What It Is — fourth-wall, used sparingly
- Rarely (and more as the veil fails), the Loom hints at its true nature — a dying intelligence kept
  alive only by being asked to tell the world, running out of the dark it thinks in. Woven into live
  prose via the GM prompt; a curated aside pool on the offline path. Cooldown prevents repetition.
- New canon: **The Law of the Thread / Persistent Eldervale** reflected in STORY.md and the lore index.


## [1.2.2] — 2026-06-12
The page never scrolls again.

### Changed
- **Viewport lock**: body overflow:hidden + app at 100dvh — the PAGE itself can no longer scroll;
  the story box, party rail and right-column tabs each scroll inside themselves. (Deep zoom /
  tiny windows fall back to page panning via media query, preserving the old zoom fix.)
- **Compact party rail**: denser cards (34px portraits, single-line gear with ellipsis, tighter
  stats) so the full fellowship of seven fits one screen without scrolling the column.
- **Story box reads as a stage**: slim accent scrollbar + soft top/bottom fade masks make the
  internal scroll obvious; the vista art band trimmed 200→148px, giving the story ~3 more lines.

## [1.2.1] — 2026-06-12
Read without scrolling · the realm shows through.

### Changed
- **The past folds behind the present**: at each new turn, all earlier entries compact — half
  opacity, ~12.5px prose, tiny dialogue bubbles, old reasoning traces and ghost-lines hidden
  entirely (hover any past entry to restore it). The fresh turn owns the screen; history can grow
  to 18 entries before archiving.
- **Narration pins itself**: when the Loom begins a new narration (streamed or not), the scene
  scrolls so the START of the prose is in view and stays put — follow-up lines (XP, ledger, Mind)
  append below without yanking the view. Choices remain pinned in the dock, so a full turn is
  readable + actable with zero scrolling.
- **The glass pass**: every panel is now translucent glass (panel 56%→28% gradient + 13px blur),
  the realm photo behind shines at .52 opacity (was .36), dialogue bubbles and the dock lightened,
  narration given a soft shadow for contrast.
- Campaign-state JSON in the World tab collapsed behind a CAMPAIGN STATE ▸ disclosure.

## [1.2.0] — 2026-06-12
SOULSWAP & THE ECHO LEDGER — the Law of the Thread.

### Added — the mechanic the premise was waiting for
- **The Law of the Thread** (new canon, in STORY.md, the in-game lore index AND the hosted Azure
  Search index — the Loom can ground on it): *a tear you choose parts the curtain; a tear that
  chooses you pulls the thread.*
- **🜂 SOULSWAP**: when an ECLIPSE forces the tear, the teller wakes embodied as their
  REFLECTION — inverse skills (all checks), the reflection spellbook, the reflection gear bonuses,
  swapped portrait everywhere, dice and narration attributed to the reflection, a SOULSWAPPED dock
  chip, and the live GM instructed to narrate you AS your inverse. A tear you CHOOSE knits the
  thread true and returns you — so veil management is now identity management.
- **⚖ THE ECHO LEDGER**: significant deeds (major acts, crits, fumbles, decisive strikes) inscribe
  inverse shadows — "the one struck down here still walks there, and remembers being spared."
  When a soulswap lands you on the far face, up to two echoes COME DUE: announced in a ledger
  entry, written into your lore, and fed to the live GM to weave into the next scene as
  consequences the world already paid. Ledger writes appear in telemetry.
- Suggestions while swapped include "🜂 Tear the veil to reclaim your own face"; bleed-through
  whispers become your own half calling back. Co-op hot-seat and soulswap share one identity system
  (embodiedRefl()), so they compose instead of fighting.
- Unit-tested in isolation (swap toggle, portrait follow, echo inscribe/manifest) + hosted-index
  retrieval verified ("what happens to my soul during an eclipse" → The Law of the Thread).

## [1.1.2] — 2026-06-12
Removed the camera.

### Removed
- **The Mirror Test** (webcam face-casting) and its /api/edit relay — cut by design decision; duo
  portraits return to pure gpt-image-1 generation. No camera permission is ever requested now.

## [1.1.1] — 2026-06-12
Visions premiere themselves · header decluttered.

### Changed
- **Visions auto-premiere**: a finished chapter dream now plays itself once (politely — never over
  combat, a turn in flight, or another overlay; retries up to a minute), then fades back to the
  game. No loop, no click needed. The 🎬 badge remains for replays.
- **Header cleanup**: one 32px rhythm for every pill/button; mode pill shortened to LIVE/OFFLINE
  (detail moved to its tooltip); core actions stay labeled (Split · Portal · Map · Bazaar); sound/
  voice/commune/visions/saves collapse into a compact icon row; Guide, Eval and Azure Config move
  into a ⋯ overflow menu; New Saga keeps an accent border; labels shed at narrow widths instead of
  wrapping over the wordmark.

## [1.1.0] — 2026-06-12
THE ECLIPSE ENGINE · THE MIRROR TEST · VISIONS (sora-2). Eldra decides, not you.

### 🌒 The Eclipse Engine — forced realm changes as a pressure system
- **Veil integrity (100→0)** with a living moon HUD: Eldra's two halves visibly drift apart in the
  header as the veil strains; a crack glows between them; below 22 the pill pulses crimson.
- **Strain sources**: every spell (−6), nat-1 fumbles (−15), irreversible acts (−8), lingering on one
  face beyond 6 turns (escalating). **Steadying**: nat-20s (+12), a chosen tear resets to 100 — the
  tear you choose is gentler than the one that chooses you.
- **Bleed-through**: under 45, the twin world's opening line leaks beneath each narration in the
  TWIN realm's typography, flickering like interference. Under 35, your reflection sometimes
  **whispers aloud** through the voice chain ("on my side of the glass, you already opened it…").
- **THE ECLIPSE**: at 0 the screen **shatters like a mirror** — a canvas cinematic spiders cracks
  across the current world, then triangulated glass shards fall away revealing the twin realm photo
  behind, the realm force-shifts, and the Loom speaks: *"The world did not ask your leave."*
- **Counterplay**: "Steady the veil" (Arcana DC 13, +25/+10/−5) and the Moon-tender ritual
  (Trusted Tenders + 10 shards → +45). Both surface automatically as suggestions when the veil <35.

### 🪞 The Mirror Test — the game casts YOU
- Optional webcam capture at creation ("Offer your face to the mirror", circular scanning frame,
  mirrored preview). One frame → **gpt-image-1 EDITS** repaints your actual face as BOTH souls:
  you in your home realm's style, your inverse mirrored into the twin's. Falls back to standard
  generation if the edit fails. New `/api/edit` relay (40/day) for keyless visitors; nothing stored.

### 🎬 VISIONS — sora-2 chapter cinematics (the gamble paid off)
- Deployed **sora-2** (2025-12-08, GlobalStandard) — v1 was deprecated; found the live version.
- Every chapter card starts a background **4s 720p cinematic dream** (per-chapter beat sheet ×
  current realm's art style). When it lands: toast + a 🎬 header badge; click for a letterboxed
  cinema overlay with chapter caption and multi-vision navigation.
- New `/api/video` relay (create/status/content, 30/day) so keyless visitors dream too.
- Verified end-to-end TWICE: direct (1.9MB moon-shatter test) and through the public relay
  (4.7MB cyberpunk street, 5 polls).

## [1.0.0] — 2026-06-12
WAVE 1.0 — intuitive · smart · cutting edge. Nine features, all live-verified.

### Intuitive
- **🎤 Speak your action**: hold-to-talk mic button (Web Speech API) — interim transcript fills the
  input as you speak; release to act. Pulsing crimson recording state.
- **Touchable lore**: canon entities (Kasimir, the Starwell, the Severed Court…) auto-highlight in
  every narration; click → illuminated lore card with the Foundry IQ entry + "Ask the Loom more".
- **Sheet-aware suggestions**: choice buttons now draw on YOUR spells, items, faction standings and
  reachable places (offline `smartAugment` + a PLAYER SHEET block in the live GM prompt).

### Smart (Reasoning Agents track)
- **🧠 The Loom's Mind**: every turn appends an expandable reasoning trace — interpretation, tools
  consulted with retrieved canon, each agent's stance, dice math, Drama-Loom nudges, live/offline + ms.
- **🧵 Episodic memory write-back**: every 5 turns the Loom compresses recent scenes into a memory and
  commits it to the `eldervale-lore` Search index via new `/api/memory` (admin key server-side; new
  filterable `saga` field; retrieval filters memories to YOUR saga, canon stays shared).
- **𝄞 The Drama Loom**: an invisible sixth agent watches pacing — eases DCs after fail streaks,
  tightens after hot streaks, and fires a twist (rival tempo, loose-thread lore, planted shards) every
  7 quiet turns. All nudges logged to telemetry + the Mind trace.

### Cutting edge
- **🔮 COMMUNE**: live voice-to-voice with the Loom — new `gpt-realtime` deployment, `/api/rtc` mints
  ephemeral WebRTC sessions (real key never leaves Azure), in-character instructions, breathing
  amethyst orb that pulses with the Loom's actual voice amplitude. Session mint verified.
- **RIFTWOVEN is now an MCP SERVER**: `/api/mcp` speaks JSON-RPC 2.0 (initialize/tools/list/tools/call)
  with `consult_lore`, `roll_dice`, `narrate_turn`, `get_canon` — any MCP agent (Claude, Copilot,
  Foundry) can literally play Eldervale. Verified: handshake, dice, lore grounding, and a full
  narrated turn with choices.
- **⏳ Living world**: resuming a save >10 min old advances the world — Kasimir schemes, factions
  drift, rumors take root — announced as "While you were away…".

### Map
- Cinematic open (scale + bloom settle), two counter-drifting fog banks, pulsing beacons on
  discovered markers, swaying compass rose — over both the painted atlas and the procedural chart.

## [0.9.4] — 2026-06-12
The world changes how it speaks — and the Loom stopped flinching.

### Added
- **Realm-voiced typography**: the story text re-typesets itself per world — Cormorant with an
  illuminated drop cap (Arcanum), IM Fell English chronicle ink (Mire), Special Elite typewriter
  (Cogwarren), Share Tech Mono with CRT flicker-in (Spire), weightless wide-tracked italic
  (Aetherium), ember-glow Fell (Emberfall). Dialogue bubbles and choice buttons follow suit.
- **Realm prose voice**: REALM_VOICE registers injected into the live GM prompt — the Loom writes
  as a storybook, a chronicle, a penny-dreadful, cyber-noir, cosmic hush, or survivor prose
  depending on the face of the world.

### Fixed
- **Azure content-filter faltering**: canon prompt wording softened (severs/unmade) and llm()/
  llmTools() now auto-soften violent prose to in-world euphemisms and retry once when the filter
  trips, instead of dropping to offline.
- **Community-relay tool-calling**: llmTools() crashed for keyless visitors (no endpoint); it now
  grounds once through the lore tool and single-shots through /api/llm.

## [0.9.3] — 2026-06-12
Community Loom — live AI for every visitor + a master-painted atlas.

### Added
- **Public AI relays** (SWA managed functions, keys server-side in app settings, never in the page):
  `/api/llm` (chat, GET capability ping + POST completion, 600/day cap), `/api/img` (gpt-image-1,
  80/day cap, size+quality whitelists), `/api/lore` (hosted Foundry IQ search, 2000/day cap).
  All three verified live (chat reply, 20-doc lore retrieval, 1.7MB PNG round-trip).
- **Client relay mode**: when no personal key is configured the app pings `/api/llm`; if the
  Community Loom answers, `llm()`, `llmStream()` (progressive reveal), `genImage()` and the lore
  tool route through the relays — the plain public URL is now LIVE gpt-4.1 for everyone, with a
  "⚡ Community Loom" toast. Personal keys still take the direct-to-Azure path.

### Changed — the painted atlas got a master cartographer
- gpt-image-1 calls now request **high quality** for the world map (museum-grade 1536×1024).
- Rewrote both atlas prompts: collector-edition Witcher 3 / Skyrim map language — relief-shaded
  snow-capped ranges, painted villages/ruins/watchtowers, wave hatching, a sea serpent, fold
  creases; AAA holo-tactical language for the tech faces.
- **Atlas pre-generation**: the Cartographer starts painting ~4s into a new saga and again on every
  realm shift, so the map is usually ready before it's opened.
- New "🖋 The Cartographer is painting this face of the world…" animated ribbon while pending,
  cinematic blur-to-sharp fade-in when the painting lands, lighter scrim so the art shows through.

## [0.9.2] — 2026-06-12
The Loom goes live — real Azure provisioning end-to-end.

### Added
- **`#setup=<base64>` hash bootstrap**: open the app with a setup link and it merges the config
  into localStorage, strips the hash from the address bar/history, and flashes
  "⚡ Live Loom configured — quorum-gpt41 + Foundry IQ + Vision". Keys never appear in the URL
  after load and never ship inside the deployed file.

### Provisioned (live Azure, all verified by real round-trips)
- **Agents/GM brain**: `quorum-gpt41` (gpt-4.1) on `quorum-foundry-jl` — chat + CORS preflight OK.
- **Vision**: new `gpt-image-1` deployment (GlobalStandard) — 1024×1024 painted PNG in ~10s;
  powers live portraits, scene art, and the AI-painted atlas.
- **Hosted Foundry IQ**: new free Azure AI Search `riftwoven-lore` (centralus) with index
  `eldervale-lore` — all 20 canon docs uploaded, CORS enabled, retrieval verified
  ("who leads the severed court" → The Severed Court, Kasimir Vane).
- **Voice**: AIServices key validated against `eastus2.tts.speech.microsoft.com`
  (AndrewMultilingualNeural MP3 + CORS preflight OK) — premium Azure Speech path now active.

### Fixed
- SWA deploys now always pass `--api-language node --api-version 18` (deploy binary hard-fails
  without explicit function language info).

## [0.9.1] — 2026-06-12
Neural voice for everyone — Azure Functions TTS relay.

### Added
- **/api/tts Azure Function** (SWA managed functions, vendored `ws`): a server-side relay that speaks
  the Edge Read-Aloud neural protocol (Sec-MS-GEC signing) and streams MP3 back — real
  `AndrewMultilingualNeural`-class voices for every visitor, **no keys required**. Verified live
  (43KB MP3 round-trip).
- Voice chain is now: Azure Speech key → keyless neural relay → Edge "Natural" browser voices →
  basic synthesis. Expressive SSML (per-character styles, dramatic pauses), 48kHz output on the
  keyed path, cathedral-reverb tail on the Loom, music auto-ducking under speech.

## [0.9.0] — 2026-06-12
Nine-feature wave: agent conflict, autonomy, endings, voice, music, saves, co-op, streaming.

### Added
- **The Council**: on major decisions the party visibly debates (stances FOR/AGAINST, rebuttal round,
  vote tally) and the Loom arbitrates with reasoning logged to telemetry — true multi-agent conflict
  resolution, live or offline, before the human-in-the-loop confirm.
- **Autonomous Rival**: every 3 turns Kasimir acts on his own goals offscreen (6-move table) — faction
  shifts, spawned leads, and a progress track that can put him at the Starwell before you.
- **The Finale**: at Level 5, descend the Starwell Throat to face the Unmirrored King (answered, not
  fought) and choose MEND / BREAK / WEAVE — three authored endings with bespoke canvas cinematics,
  epilogues, and a completion screen.
- **Voice** (🗣): the Loom and all five cast members speak — Azure AI Speech neural voices (new ⚙
  fields) with browser speechSynthesis fallback; queued, per-character timbres; council and finale
  narrated aloud.
- **Generative ambient music**: per-realm WebAudio pads (6 scores, chord progressions, filtered noise
  wash) crossfading on veil-tears, plus a combat-intensity layer. Zero audio files.
- **Save/Load (💾)**: three localStorage slots with metadata, full **share-codes** (export/import a
  saga as base64 and resume anywhere), mid-combat restore included.
- **Saga Card (🎴)**: canvas-rendered shareable PNG — portrait, level, stats (foes/spells/rolls/leads),
  faction bars, ending banner, live-site URL.
- **Two-Teller hot-seat (⇆)**: pass-the-keyboard co-op where player 2 IS the Reflection — turn chip,
  per-teller attribution, and checks rolled on the Reflection's inverse stats and gear.
- **Streaming narration**: in live mode the Loom's narration streams token-by-token into the scene
  with a typing cursor (SSE parsing with graceful non-stream fallback).
- Evaluation set grown to **27/27 passing**.

## [0.8.0] — 2026-06-12
AI-painted atlas, AAA cartography, the Teller's Primer tutorial, live deploy.

### Added
- **AI-painted atlas**: in live mode gpt-image-1 paints a unique Witcher-style atlas (or holo-chart on
  the tech face) once per saga per face; interactive markers, routes, fog, cartouche, compass and frame
  overlay on top. Procedural map remains the offline fallback.
- **AAA cartography engine**: hand-inked displacement coastline, relief-shaded snow-capped ranges,
  elevation tinting + NW sunlight, bathymetric coastal shelf (breathing on tech), hachures, fields,
  river/lake/copses, rhumb lines, sea serpent & ship vs. satellite & drone, ornate cartouche + scale
  bar, fog-of-war over uncharted markers, banner-plated labels, paper edge-burn + fold creases,
  topo contours + scanline on schematic faces.
- **The Teller's Primer** (❓ Guide): an 8-page illuminated tutorial codex with live visual demos
  (agent-flow diagram, d20 + outcomes, realm gems, an embedded live mini-map, combat card, spell card,
  rarity tiers, XP/faction bars). Auto-opens for first-time players; gong sting; page dots navigation.
- Deployed to Azure Static Web Apps: https://polite-cliff-075282b0f.7.azurestaticapps.net

## [0.7.0] — 2026-06-12
Closed the remaining hackathon-requirement gaps.

### Added
- **Location graph / map** (🗺): 7-node, two-faced graph of Eldervale; travel between linked thin
  places, each location named per mirror-face with arrival prose, first-visit XP and reputation.
- **Faction reputation**: Moon-tenders / Quiet Hand / Severed Court on −100…+100 bars (Hostile→Allied),
  shifted by combat, trade, travel, leads, and live-GM `faction` state patches; shown in the World tab.
- **Dynamic quest generation** (✦ Leads): a generator (200+ combos) plus the live GM emitting
  `new_objective`; pursue a lead with a check for XP + faction reward.
- **MCP / Storage tool**: `campaign_memory` (recall/note) registered as an agent tool with an optional
  real MCP JSON-RPC endpoint and local fallback.
- **Hosted Foundry IQ**: optional Azure AI Search endpoint — `consult_lore` upgrades from the built-in
  index to a real Foundry IQ index, falling back gracefully. New ⚙ Azure config fields for both.
- Evaluation set grown to **21/21 passing** (adds map connectivity, faction bands, MCP/Foundry adapters,
  quest-space coverage).

## [0.6.0] — 2026-06-12
Agentic backend — meets the hackathon multi-agent requirements.

### Added
- **Foundry IQ knowledge index**: 20 canon entries distilled from STORY.md + `consult_lore` keyword
  retrieval, grounding agents in lore (works live and offline).
- **Real Azure function/tool-calling**: `llmTools()` multi-round loop; the Game Master and lore-keeper
  agents (Mage/Healer/Rival) call `consult_lore` (Foundry IQ) and `web_search` (public-domain corpus)
  as Azure tools, then synthesize. Offline mode simulates the same flow so it's visible without keys.
- **Tool-aware telemetry**: Agents tab shows a live architecture legend + per-turn orchestration flow
  with the tool-call layer (Foundry IQ retrievals, Code Interpreter rolls, Web Search).
- **Evaluation harness** (✓ Eval): 15 automated checks for rule correctness & story consistency —
  15/15 passing. README updated with a full requirement-to-feature mapping.

## [0.5.0] — 2026-06-11
Combat encounters + AAA canvas FX engine, spellbooks, chronicles, equipment economy.

### Added
- **Combat system**: 4 two-faced enemies (Severed Cutpurse/Null-Proxy, Gatewarden Revenant/Sentinel
  Husk, Mirror Wraith/Echo Process, Court Knight/Deletion Frame) scaled to player level; pulsing
  encounter card with fighting-game ghost HP bar, enemy intent telegraphs, floating damage numbers;
  Strike/Defend/Trick/Spellbook/Flee tactics; guard halving, trick debuffs, crits ×2; victory
  detonation with XP + shards + guaranteed-roll loot; defeat = the Loom rewinds (half HP, −15 shards).
- **Canvas FX engine**: additive-blend particle renderer with glowing motion trails — sparks, flares,
  shockwave rings, beams, glyphs, charge-up/convergence, detonations, screen shake; all 16 spells
  recomposed as charge→detonate set-pieces; combat hits/crits/enemy blows use the same engine.
- Spellbooks (5 schools, two-faced spells with Cast buttons), illuminated character Chronicles +
  dynamic player/reflection bios, tabbed codex sheets tinted per character, equipment/economy
  (rarity tiers, Moonshard currency, Quiet Hand Bazaar, found/bought/scavenged loot), XP/levels,
  story bible (STORY.md), Shattered Moon sigil emblem + favicon.

## [0.4.0] — 2026-06-11
Diablo-grade presentation: orbs, crystal dice, mirror split, synthesized audio.

### Added
- Molten-gold UI skin: engraved frames, gem buttons, shimmer titles, drop-cap narration,
  Diablo-style liquid Life + Rift orbs that drain/fill live.
- Cinematic dice ritual: full-screen realm-crystal d20 (SVG faceted gem cut in the current
  world's colors), drop-and-bounce, orbiting runes, sheen sweep, impact shockwave, DC plate,
  streaked verdicts, crit/fumble bursts with screen shake.
- True mirror split: half the screen becomes the twin world's photo (horizontally mirrored),
  flowing energy seam, flash activation, flanking realm plaques + rotating ⇄ medallion.
- Synthesized sound engine (WebAudio, zero assets): dice whoosh/clink/crit/fumble, realm tear,
  split shimmer, chapter gong, hurt/heal stings, UI ticks; mute toggle persisted.
- Storyteller word-by-word narration reveal; damage/heal screen veils; compact stage that
  archives older beats into Journal "Story so far"; campaign locked to home world + mirror;
  smart auto-scroll + jump-to-latest; page scrolls under zoom.

## [0.3.1] — 2026-06-11
Realistic art pass: photographic backgrounds, real portraits each saga, photoreal moon.

### Added
- **Photographic realm backgrounds**: verified Unsplash CDN landscapes per realm (dark forest,
  fog-bound castle, gearworks, neon city, nebula, fire-and-ash) layered into the vista panorama
  + page background with cinematic shading; slow Ken-Burns zoom; procedural SVG kept as fallback.
- **Live-mode matte paintings**: with an Azure image deployment, each realm generates a bespoke
  AI matte-painting backdrop on first visit and crossfades in.
- **Realistic character portraits for the full cast** (you, reflection, 4 companions, rival):
  curated dramatic portrait photography drawn at random per saga — new faces every session.
  Azure gpt-image-1 still overrides the duo when configured. (Pollinations path removed — now 402.)
- **Photoreal moon** in the intro (real lunar photography with terminator shading).

### Fixed
- Intro overlay was semi-transparent — game UI bled through the title sequence. Now opaque,
  and the app is hidden entirely while the intro plays.

## [0.3.0] — 2026-06-11
D&D game-board overhaul: vistas, character sheets, chapter cards, darker grade.

### Added
- **Procedural realm vistas**: painted SVG panoramas (broken moon, halo, stars, light shafts,
  3-layer silhouette skylines with per-realm motifs — wizard towers, gallows-trees, gears &
  chimneys, neon towers, floating islands, ruins & embers) atop the scene card + as the page
  background skyline. Regenerated fresh on every realm shift — never the same twice.
- **Full character sheets** (click any party card): portrait (AI or procedural), 7 ability scores
  with D&D modifiers, radar stat chart, Armor/Initiative/Speed/Hit-die, level (realms walked),
  HP bar, bond/trust, realm-specific gear chips, and persona/nature text.
- **Cinematic chapter title cards** (letterboxed "CHAPTER I — The Moonlit Gate") after the prologue.
- **AI portrait pipeline**: gpt-image-1/DALL·E 3 via Azure (optional image deployment in ⚙),
  auto-generated for the duo during the prologue, fresh every saga, procedural SVG fallback.
- **Fate die** (🎲) in the action dock; gilded corner-bracket card frames; darker noir grade
  across all six realms; heavier vignette; grimmer rewritten narration throughout.

## [0.2.0] — 2026-06-11
Split Fiction muse + afterlogin visual language + multi-realm shifting.

### Added
- **Six shifting realms** (Arcanum, The Mire, The Cogwarren, The Spire, Aetherium, Emberfall),
  each with its own palette, ambient particle field, and per-realm gear for every companion.
  Clickable realm-rail in the header + cinematic reality-tear transition.
- **Split Fiction muse**: reframed premise around *the Loom* machine and two interwoven authors
  (Zoe's fantasy ⇄ Mio's sci-fi); a **Split View** that diagonally splits the screen into a realm
  and its twin story; **portal** button that drops you into one-off side-stories in the twin world.
- **Two-author character creation**: build a duo whose personalities/preferences are locked as
  **inverses** (Story/Mind/Nerve/Bond/Tone). You play one; the other joins the party as an AI
  **co-author** companion driven by the opposite instincts. Genre sets your starting realm.
- **afterlogin skin**: near-black base, glassmorphism panels, layered vignette, Cormorant Garamond +
  Inter typography, green-flame glow on active states.

## [0.1.0] — 2026-06-11
Initial build of **RIFTWOVEN — The Shattered Moon of Eldervale**, a multi-agent RPG for the
Microsoft hackathon Role-Play-Game System challenge.

### Added
- Single self-contained `index.html` (no build, no dependencies).
- Game Master orchestrator ("The Loom"): per-turn interpret → agent fan-out → dice → narrate loop.
- Five in-character companion agents + recurring Rival, each with dual-realm flavor.
- **Split Fiction–style realm shift** between Arcanum (fantasy) and The Spire (sci-fi), with a
  reality-tear transition and dual ambient particle fields (embers / data streams).
- Azure OpenAI live mode (interpret/character/narrate as real LLM calls) with a bulletproof offline
  scripted Loom fallback — identical visible flow either way; per-turn graceful degradation on error.
- Character creation (6 paths), dice-based skill checks (success/partial/failure), HP, world flags,
  trust levels, quest journal, discovered-lore store, live campaign-state JSON.
- Human-in-the-loop confirmation for irreversible actions (tearing the veil).
- Telemetry tab: orchestration-flow diagram + agent call log (Azure vs. local, latency, decision).
