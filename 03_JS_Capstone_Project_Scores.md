# JS Capstone Project — Scores

- Rubric: StarterKit README — 6 sections = 100 pts
- Verified via docker compose (localhost:800N) + headless Playwright harness
- No late penalty (first/last student commits recorded for reference only)
- Last evaluated: 2026-10-16T13:00:00+08:00

Grading notes (applied consistently to all groups):

- The StarterKit `index.html` contains **no `#barangay-select`** and the README only
  requires `fetchProvinces()` + `fetchCitiesMunicipalities()` (province→city). The
  harness's `ui.cascade_barangayselect` timeouts are therefore harness quirks; the
  cascade row is graded on province→city populate (which succeeded for every group —
  the harness passed those steps before failing on the non-existent barangay select).
- The StarterKit contains **no `#queue-count` element** and the README never requires
  one, so `ui.register_creates_card` (`#queue-count=NaN`) and
  `ui.remove_card_behavioral` ("NaN → NaN") are vacuous for every group; card
  creation/removal are graded from card evidence + code reading instead.
- Remaining-budget/subtotal checks that key on the literal wording
  "REMAINING BUDGET:"/"SUBTOTAL:" are graded on feature presence when a group
  displays the value under different wording (README does not prescribe labels).
- Section 1 rubric rows sum to 21.5 pts; section scores are capped at the stated max.
- Sections with x.5 totals round up (½ rounds up at the section level).

## Summary

| Group | A/20 | B/20 | C/20 | CSS/15 | Sys/15 | DQ/10 | Final/100 | First Commit | Last Commit | Notes |
| --- | --: | --: | --: | --: | --: | --: | --: | --- | --- | --- |
| 03_JS_Capstone_Project_Group_1 | 19 | 17 | 18 | 12 | 14 | 7 | **87** | 2026-09-11 | 2026-09-12 | Engine reads `dependents` instead of `dependentCount` (v4/v8 fail); no remaining-budget display; no province sorting; 399px overflow; thin history (2 commits) |
| 03_JS_Capstone_Project_Group_3 | 7 | 12 | 18 | 7 | 12 | 6 | **62** | 2026-10-04 | 2026-10-04 | Engine returns boolean, no scoring/{priority,score,approved}; cards lack `data-priority`; POS has no custom-item inputs and hides when last resident ineligible; no priority CSS; single squashed commit |
| 03_JS_Capstone_Project_Group_4 | 20 | 16 | 18 | 10 | 14 | 8 | **86** | 2026-09-12 | 2026-10-04 | v5 fails (`<= 12000` threshold); priorities lowercased on cards; priority CSS selectors target `.resident-card` but cards are `.resident-ticket` (no visual theming); 565px overflow; no sorting |
| 03_JS_Capstone_Project_Group_5 | 20 | 19 | 20 | 12 | 14 | 7 | **92** | 2026-09-12 | 2026-09-12 | Best all-round; 564px mobile overflow; already sorted; thin history (2 commits) |
| 03_JS_Capstone_Project_Group_6 | 20 | 17 | 14 | 10 | 14 | 6 | **81** | 2026-09-12 | 2026-09-12 | No mock fallback (cache-only, 0 options when PSGC blocked); no remaining-budget display; priority styling via badge classes, not `[data-priority]` selectors; thin history |
| 03_JS_Capstone_Project_Group_7 | 20 | 19 | 18 | 12 | 14 | 6 | **89** | 2026-09-12 | 2026-09-12 | Strong engine/DOM/POS; 520px mobile overflow; provinces unsorted; single commit |

## 03_JS_Capstone_Project_Group_1

- Commits: 2 student commits (first 2026-09-11, last 2026-09-12), method=direct
- Evidence: `artifacts/wmad-302-2026-2-03_JS_Capstone_Project_Submissions/03_JS_Capstone_Project_Group_1/report.json`, `shots/` (copied to `Artifacts/03_JS_Capstone_Project_Group_1/`)
- Docker: up/build ✅, HTTP 200 ✅, logs clean ✅

### Section scores

| Section | Earned | Key evidence |
| --- | --: | --- |
| 1. Role A Engine | 19/20 | v1,v2,v3,v5,v6,v7 exact ✅; v4/v8 ❌ — engine destructures `dependents` while README/harness contract is `dependentCount`, so dependent points never count (no `??`; uses destructuring default); packer closure solid (caps, add 450/2, remove 150/1, private state, defensive copy from `getItems`) |
| 2. Role B DOM/UI | 17/20 | sanitize escapes ✅; XSS end-to-end clean ✅; `data-priority="HIGH"/"CRITICAL"` exact ✅; delegation verified in code: `e.target.closest('[data-action]')` with `contains()` guard (dom.js:62) ✅; remove path → `removeFromOfflineQueue` + re-render ✅; POS add/subtotal/progress ✅; **remaining budget never displayed** (only "% used" — dom.js:47-53) ❌ |
| 3. Role C Async/Storage | 18/20 | 81 live provinces ✅; fallback 2 mock provinces + mock cities ✅; province→city cascade works ✅; key exact ✅; 2 entries after register ✅; delete path filters by id and rewrites key ✅; **provinces not sorted** ❌ (async.js has no sort) |
| 4. CSS | 12/15 | `:root` vars ✅, 47 `var(--…)` uses ✅; `[data-priority="CRITICAL/HIGH/LOW"]` selectors ✅ with distinct border colors per tier ✅; flex+grid ✅; **375px: scrollWidth 399** ❌ |
| 5. System | 14/15 | Named ES imports; submit→`evaluateAyudaEligibility`→`saveToOfflineQueue`→`renderResidentCards` clean ✅; no page/console errors ✅; all modules import ✅; form reset ✅; global `createReliefPacker(1000)` + POS add/remove wired via delegation ✅ |
| 6. Docker & Quality | 7/10 | Clean build/run/logs ✅; readable code (285 lines, 0 >160ch) ✅; no node_modules/dist tracked ✅; **commit quality fail** (2 commits, 6 distinct words < ≥3 commits AND ≥12 words) ❌ |

### Remarks
- `engine.v4`/`engine.v8`: field-name mismatch (`dependents` vs `dependentCount`) — the app is internally consistent (main.js passes the same key) but violates the documented engine contract; also no `??` usage.
- `pos.remaining_budget`: README Role B requires remaining budget in `renderPOSRegister`; group shows only "% used".
- `async.provinces_sorted_alpha`: PSGC list rendered in API order (first=Ilocos Norte).
- `ui.cascade_barangayselect` ×3, `ui.register_creates_card`, `ui.remove_card_behavioral`: harness quirks (see preamble) — not docked.

## 03_JS_Capstone_Project_Group_3

- Commits: 1 student commit (first 2026-10-04, last 2026-10-04), method=direct
- Evidence: `artifacts/wmad-302-2026-2-03_JS_Capstone_Project_Submissions/03_JS_Capstone_Project_Group_3/report.json`, `shots/` (copied to `Artifacts/03_JS_Capstone_Project_Group_3/`)
- Docker: up/build ✅, HTTP 200 ✅, logs clean ✅

### Section scores

| Section | Earned | Key evidence |
| --- | --: | --- |
| 1. Role A Engine | 7/20 | **`evaluateAyudaEligibility` returns a boolean**, not `{priority, score, approved}` — takes pre-computed `isSeniorPWD`/`isLowIncome` flags; 0/8 vectors, shape check ❌ (engine.js:18-26); packer is solid: caps ✅, add/remove ✅, private closure ✅ (raw 6.5 → 7) |
| 2. Role B DOM/UI | 12/20 | sanitize escapes ✅; XSS clean ✅; **cards render without `data-priority`** (only `data-id`) ❌ — priority tiers non-functional; name shown on card ✅ (half on bundled row); delegation `closest('[data-action]')` exact ✅; remove → storage+re-render ✅; POS has catalog-button add but **no custom item inputs** (half); subtotal computed in code but POS hidden at check time (eligibility gating hides POS when last resident ineligible) → not observed; progress element ✅; remaining displayed as "Remaining: ₱…" in code but hidden at check (half) |
| 3. Role C Async/Storage | 18/20 | 81 live provinces ✅; fallback 2 mock provinces ✅; province→city cascade works ✅; key exact ✅ (inline string); `saveToOfflineQueue` generates id+savedAt, 2 entries ✅; `removeFromOfflineQueue` filter ✅; **not sorted** ❌ |
| 4. CSS | 7/15 | `:root` vars ✅, `var(--…)` consumed ✅; flex/grid ✅; **no `[data-priority]` attribute selectors** ❌; **0 computed priority tiers** ❌ (cards lack attribute); **446px overflow at 375** ❌ |
| 5. System | 12/15 | Named imports, submit→storage→render, delegation, reset all present ✅ but engine integration violates spec (boolean flags, no scoring) → wiring half; no errors ✅; modules import ✅; register→card→storage E2E works (screenshot) but no priority/CSS flow → half; form reset ✅; module-level packer + catalog delegation ✅ |
| 6. Docker & Quality | 6/10 | Clean build/run/logs ✅; readable (302 lines) ✅; no excluded tracked ✅; **1 commit, 8 words** ❌ |

### Remarks
- Section 1 anchor case: "engine.js missing/export missing so every vector failed" is near — the export exists but implements a different contract; only the packer earns points.
- CSS priority theming cannot work end-to-end: no attribute in HTML and no selectors in CSS.
- Fallback works; PSGC-off page still showed 2 provinces.
- `ui.cascade_barangayselect` ×3, `ui.register_creates_card`, `ui.remove_card_behavioral`: harness quirks — not docked.

## 03_JS_Capstone_Project_Group_4

- Commits: 29 student commits (first 2026-09-12, last 2026-10-04), method=direct
- Evidence: `artifacts/wmad-302-2026-2-03_JS_Capstone_Project_Submissions/03_JS_Capstone_Project_Group_4/report.json`, `shots/` (copied to `Artifacts/03_JS_Capstone_Project_Group_4/`)
- Docker: up/build ✅, HTTP 200 ✅, logs clean ✅

### Section scores

| Section | Earned | Key evidence |
| --- | --: | --- |
| 1. Role A Engine | 20/20 | v1–v4, v6–v8 exact ✅ (uses `??` twice: `citizen ?? {}`, `dependentCount ?? 0`); **v5 fails: `monthlyIncome <= 12000`** — wrong threshold and inclusive bound (income 10000 scores 20); raw 20.5 → capped 20 |
| 2. Role B DOM/UI | 16/20 | sanitize ✅; XSS clean ✅; `data-priority` present but **lowercased** (`.toLowerCase()` in dom.js:39) → README requires exact `${resident.priority}` → half on attr row, HIGH/CRITICAL exact-value checks ❌; name+card ✅; delegation `closest('[data-action]')` exact (+ pointer feedback) ✅; remove→storage ✅; POS add flow ✅; subtotal updates (progress 300) ✅ (harness label quirk: "Subtotal ₱300.00" lacks colon); remaining displayed as "Remaining ₱…" ✅ (wording quirk — feature present); progress ✅ |
| 3. Role C Async/Storage | 18/20 | 81 provinces ✅; fallback 2 mock ✅; cascade ✅; key exact ✅; entries ✅; delete path ✅; **not sorted** ❌ |
| 4. CSS | 10/15 | `:root` vars + heavy `var(--…)` use ✅; attribute selectors exist (`[data-priority='critical']` etc.) **but target `.resident-card` while cards render as `.resident-ticket`** — selectors never match, zero visual priority theming → half; computed themes exist but **styles identical** ❌; flex/grid ✅; **565px overflow** ❌ |
| 5. System | 14/15 | Clean named-import wiring, extra `createPOSRegister` abstraction; no errors ✅; modules import ✅; E2E register→card→storage ✅; form reset ✅; packer + POS wired ✅ |
| 6. Docker & Quality | 8/10 | Clean build/run/logs ✅; 29 commits / 34 words ✅; readable (508 lines) ✅; no excluded tracked ✅ |

### Remarks
- Highest commit quality of the cohort (29 commits, descriptive messages).
- Two consistency bugs: income threshold `<= 12000` (engine) and priority lowercasing that also breaks the CSS attribute selectors' uppercase values — compounded by the card-class mismatch.
- `ui.cascade_barangayselect` ×3, `ui.register_creates_card`, `ui.remove_card_behavioral`: harness quirks — not docked.

## 03_JS_Capstone_Project_Group_5

- Commits: 2 student commits (first 2026-09-12, last 2026-09-12), method=direct
- Evidence: `artifacts/wmad-302-2026-2-03_JS_Capstone_Project_Submissions/03_JS_Capstone_Project_Group_5/report.json`, `shots/` (copied to `Artifacts/03_JS_Capstone_Project_Group_5/`)
- Docker: up/build ✅, HTTP 200 ✅, logs clean ✅
- Note: first run showed `engine.v5` score=20 (stale serve); re-run reproduced v5 pass (score=0) against the same on-disk source — graded on the reproducible result.

### Section scores

| Section | Earned | Key evidence |
| --- | --: | --- |
| 1. Role A Engine | 20/20 | **8/8 vectors exact** (verified directly against source + re-run harness); `??` used (`monthlyIncome ?? 0`, `dependentCount ?? 0`); shape ✅; packer caps/add/remove/private all ✅ (raw 21.5 → capped 20) |
| 2. Role B DOM/UI | 19/20 | sanitize ✅; XSS end-to-end clean ✅ (screenshot shows payload as escaped text); `data-priority="HIGH"/"CRITICAL"` exact ✅; delegation `closest('[data-action]')` exact ✅; remove→`removeFromOfflineQueue` ✅; POS add/subtotal ("Subtotal: ₱300") ✅; progress ✅; remaining shown as "Remaining: ₱700" ✅ (screenshot; harness wording quirk) |
| 3. Role C Async/Storage | 20/20 | 81 provinces **sorted alphabetically** (`localeCompare`) ✅; fallback 8 mock provinces + mock cities ✅; cascade ✅; key exact ✅; entries ✅; delete path ✅ |
| 4. CSS | 12/15 | `:root` vars + `var(--…)` ✅; `.resident-card[data-priority="CRITICAL/HIGH/LOW"]` selectors matching rendered class ✅; 3 tiers with distinct computed border colors (amber/red/blue) ✅; flex/grid ✅; **564px overflow at 375** ❌ (header text clipped — screenshot) |
| 5. System | 14/15 | Named imports; submit→engine→storage→render; no errors ✅; modules import ✅; E2E ✅; form reset ✅; packer + POS add/remove wired ✅ |
| 6. Docker & Quality | 7/10 | Clean build/run/logs ✅; readable (360 lines) ✅; no excluded tracked ✅; **2 commits / 7 words** ❌ |

### Remarks
- Strongest submission overall; only meaningful defects are mobile overflow and thin git history.
- Mock fallback uses region names ("Ilocos Region", "Metro Manila") rather than provinces — content nitpick only; check passed.

## 03_JS_Capstone_Project_Group_6

- Commits: 2 student commits (first 2026-09-12, last 2026-09-12), method=direct
- Evidence: `artifacts/wmad-302-2026-2-03_JS_Capstone_Project_Submissions/03_JS_Capstone_Project_Group_6/report.json`, `shots/` (copied to `Artifacts/03_JS_Capstone_Project_Group_6/`)
- Docker: up/build ✅, HTTP 200 ✅, logs clean ✅

### Section scores

| Section | Earned | Key evidence |
| --- | --: | --- |
| 1. Role A Engine | 20/20 | 8/8 vectors exact ✅ (`dependentCount ?? 0` ✅); shape ✅; packer all ✅ (raw 21.5 → capped 20) |
| 2. Role B DOM/UI | 17/20 | sanitize ✅; XSS clean ✅; `data-priority` exact uppercase ✅ (HIGH/CRITICAL correct); delegation `closest('[data-action]')` exact ✅; remove→storage ✅; POS add/subtotal ("Subtotal: ₱300.00") ✅; progress ✅; **no remaining-budget display** (renderPOSRegister shows only "Subtotal / Budget" — dom.js:76-89) ❌ |
| 3. Role C Async/Storage | 14/20 | 81 provinces ✅; **no mock fallback** — catch returns in-memory `cachedProvinces` which is empty on fresh load → 0 options with PSGC blocked ❌ (4 pts); key exact ✅; entries ✅; delete path ✅; **not sorted** ❌ |
| 4. CSS | 10/15 | `:root` vars + `var(--…)` ✅; **no `[data-priority]` attribute selectors** — priority colors only on `.badge.critical/.high/.low` classes ❌; computed card styles identical ❌ (badge-only theming); flex/grid ✅; **responsive 375 = 375** ✅ |
| 5. System | 14/15 | Clean wiring: named imports, submit→engine→storage→render, add-item btn, delegation ✅; no errors ✅; modules import ✅; E2E ✅; form reset ✅ |
| 6. Docker & Quality | 6/10 | Clean build/run/logs ✅; readable (360 lines, 1 long line) ✅; no excluded tracked ✅; **2 commits / 7 words** ❌ |

### Remarks
- The "fallback" is a page-lifetime cache, not mock data — offline-first requirement effectively unmet (`async.fallback_mock_provinces` = 0 options).
- README explicitly lists `[data-priority="CRITICAL"]` attribute selectors; class-based badge styling does not satisfy it.

## 03_JS_Capstone_Project_Group_7

- Commits: 1 student commit (first 2026-09-12, last 2026-09-12), method=direct
- Evidence: `artifacts/wmad-302-2026-2-03_JS_Capstone_Project_Submissions/03_JS_Capstone_Project_Group_7/report.json`, `shots/` (copied to `Artifacts/03_JS_Capstone_Project_Group_7/`)
- Docker: up/build ✅, HTTP 200 ✅, logs clean ✅

### Section scores

| Section | Earned | Key evidence |
| --- | --: | --- |
| 1. Role A Engine | 20/20 | 8/8 vectors exact ✅ (`dependentCount ?? 0` ✅); shape ✅; packer all ✅ (raw 21.5 → capped 20) |
| 2. Role B DOM/UI | 19/20 | sanitize ✅; XSS clean ✅; `data-priority` exact ✅ (HIGH/CRITICAL correct, "Approved: Yes" shown); delegation `e.target.closest("[data-action]")` verified (dom.js:125) ✅; remove→`removeFromOfflineQueue` ✅; POS add/subtotal ✅; progress ✅; **"Remaining Budget: 700.00"** passes harness as-written ✅ |
| 3. Role C Async/Storage | 18/20 | 81 provinces ✅; fallback 4 mock provinces ✅; cascade ✅; key exact ✅; entries ✅; delete path ✅; **not sorted** ❌ (first=Ilocos Norte) |
| 4. CSS | 12/15 | `:root` vars + 17 `var(--…)` uses ✅; bare `[data-priority="CRITICAL/HIGH/LOW"]` selectors ✅; 3 tiers, distinct computed bg+border (amber/red/blue) ✅; flex/grid ✅; **520px overflow at 375** ❌ |
| 5. System | 14/15 | Full named-import wiring across all four modules; submit→engine→storage→render; no errors ✅; modules import ✅; E2E ✅; form reset ✅; packer + POS wired ✅ |
| 6. Docker & Quality | 6/10 | Clean build/run/logs ✅; readable (505 lines) ✅; no excluded tracked ✅; **single commit, 10 words** ❌ (message: "03_JS_Capstone_Project --Group7_Bare Minimum") |

### Remarks
- Functionally the second-strongest build; all deductions are mobile responsiveness, province sorting, and a one-commit history.
