# React My First App — Scores

- Rubric: StarterKit README — 5 categories = 50 pts (no bonus)
- Due: 2026-09-30 (late penalty prorated daily: 12.5%/7 days, max 62.5%)
- Verified via docker compose (localhost:800N) + headless Playwright harness
  (all external API traffic mocked with fixtures — zero live calls)
- Last evaluated: 2026-11-04T04:06:26+08:00

## Summary

| Student Folder | Hooks/10 | Life/10 | Map/12 | Async/10 | Theme/8 | Earned/50 | Days Late | Deduction | Final | Notes |
| --- | --: | --: | --: | --: | --: | --: | --: | --: | --: | --- |
| 04_React_My_First_App_Agustin_Jecressa | 10 | 10 | 12 | 10 | 8 | 50 | 0 | 0% | 50 | on time; all checks pass |
| 04_React_My_First_App_Bala_oy_Giero | 0 | 4 | 0 | 2 | 3 | 9 | 8.45 | 15.08% | 7.64 | StarterKit TODOs left in place; app never calls the service |
| 04_React_My_First_App_Balinggan_Arjhey | 10 | 10 | 10 | 10 | 8 | 48 | 0 | 0% | 48 | on time; conditional chip color missing |
| 04_React_My_First_App_Batil_Charlie | 7 | 10 | 12 | 10 | 8 | 47 | 0 | 0% | 47 | on time; ref declared but never bound |
| 04_React_My_First_App_Caligtan_Emmanuel | 10 | 10 | 10 | 10 | 8 | 48 | 3.51 | 6.28% | 44.99 | conditional chip color missing; late |
| 04_React_My_First_App_Cayetano_Keneth | 10 | 10 | 12 | 10 | 8 | 50 | 0.82 | 1.47% | 49.27 | all checks pass; ~19h late |
| 04_React_My_First_App_Denis_Carrie | 10 | 10 | 12 | 10 | 8 | 50 | 2.41 | 4.3% | 47.85 | all checks pass; late |
| 04_React_My_First_App_Diaz_Mark | 10 | 10 | 12 | 10 | 8 | 50 | 0 | 0% | 50 | on time; all checks pass |
| 04_React_My_First_App_Diwan_Mark_Neil | 10 | 10 | 12 | 10 | 8 | 50 | 2.95 | 5.27% | 47.37 | all checks pass; late |
| 04_React_My_First_App_Dumalti_Khivieron | 10 | 10 | 12 | 10 | 8 | 50 | 2.48 | 4.43% | 47.78 | all checks pass; late |
| 04_React_My_First_App_Laoeng_Vera | 10 | 10 | 12 | 10 | 8 | 50 | 0 | 0% | 50 | on time; all checks pass |
| 04_React_My_First_App_Lindawan_Cristy | 10 | 9 | 6 | 1 | 8 | 34 | 0.58 | 1.04% | 33.65 | offline redesign — zero API traffic |
| 04_React_My_First_App_Liwanag_Denie | 10 | 10 | 12 | 10 | 6 | 48 | 0 | 0% | 48 | on time; theme toggle inert (CssBaseline never rendered) |
| 04_React_My_First_App_Ngalob_AdrianLee | 10 | 10 | 12 | 10 | 8 | 50 | 2.81 | 5.02% | 47.49 | all checks pass; late |
| 04_React_My_First_App_Segundo_Kypler_Lloyd | 10 | 10 | 12 | 10 | 8 | 50 | 2.76 | 4.92% | 47.54 | all checks pass; late |
| 04_React_My_First_App_Soliman_Chenzen | 0 | 5 | 0 | 0 | 8 | 13 | 9.73 | 17.38% | 10.73 | heavy architecture rework; offline-only service |
| 04_React_My_First_App_Tudlong_Cymar | 10 | 10 | 12 | 10 | 8 | 50 | 0 | 0% | 50 | on time; all checks pass |

## Details

### 04_React_My_First_App_Agustin_Jecressa

- Harness: 39 passed / 0 failed (`artifacts/wmad-302-2026-2-04_React_My_First_App_Submissions/04_React_My_First_App_Agustin_Jecressa/report.json`)
- Docker: up ✅, HTTP 200 ✅
- 1. Hooks & Refs: 10/10 — `quote_state` ✅, `tags_state` ✅, `selected_tag_state` ✅, `use_ref_present` ✅, `input_ref_binding` ✅, `app_dark_mode_state` ✅
- 2. Lifecycle: 10/10 — `effect_present` (deps `[]`) ✅, `effect_calls_loaders` ✅, `quote_on_mount` ✅, `tags_on_mount` (8 options) ✅, `no_request_loop` (2, StrictMode) ✅, clean console + no page errors ✅
- 3. Mapping: 12/12 — `text_author_mapped` ✅, `chips_from_quote_tags` exact `[wisdom, inspiration]` ✅, `select_options_from_tags` ✅, `conditional_color` (`MuiChip-colorSuccess`) ✅, `refresh_updates_quote` ✅
- 4. Async: 10/10 — `quote_request_captured` (3 GETs) ✅, `?tags=wisdom` captured ✅, `tags_endpoint_called` (2 GETs `/api/tags`) ✅, `error_fallback` (500 → fallback, no crash) ✅, `service_axios_try_catch` ✅
- 5. Theme: 8/8 — `theme_provider` ✅, `theme_mode_param` ✅, `speeddial_map` ✅, `app_actions` ✅, toggle flipped background (`Dark Mode` action[0]) ✅, 375px ok ✅
- Submission commit: 78269f4e (2026-09-26T22:35:32+08:00); first d38f4ee6 (2026-09-26T15:41:07+08:00)
- Late penalty: 0 days → 0% → final 50/50
- Remarks: Clean sweep — every static and behavioral check passed; only 4 raw template-noise console warnings (filtered).

### 04_React_My_First_App_Bala_oy_Giero

- Harness: 18 passed / 21 failed (`artifacts/wmad-302-2026-2-04_React_My_First_App_Submissions/04_React_My_First_App_Bala_oy_Giero/report.json`)
- Docker: up ✅, HTTP 200 ✅
- 1. Hooks & Refs: 0/10 — all six rows fail: no `useState` at all in QuoteOfTheDay (no quote/tags/selectedTag state), `useRef` imported but never called, no `inputRef`, App has no dark-mode state
- 2. Lifecycle: 4/10 — `effect_present` ✅ (deps `[]`) but body is an empty TODO → `effect_calls_loaders` ❌; `quote_on_mount` ❌ (card renders `""` — empty quote), `tags_on_mount` ❌ (only `any` option), `no_request_loop` ✅ (0 requests), clean console + no page errors ✅
- 3. Mapping: 0/12 — `text_author_mapped` ❌, `chips_from_quote_tags` ❌ (0 chips), `select_options_from_tags` ❌, `conditional_color` ❌, `refresh_updates_quote` ❌ (button has no onClick)
- 4. Async: 2/10 — `quote_request_captured` ❌ / `tags_endpoint_called` ❌ / `tags_param_interpolated` ❌ (zero API traffic: component never calls the service), `error_fallback` ❌ half (500 check passed vacuously — nothing ever renders, fallback unreachable), `service_axios_try_catch` ✅
- 5. Theme: 3/8 — `theme_provider` ❌ half (imported only, never wraps the tree), `theme_mode_param` ❌ (`createTheme({})` empty), `speeddial_map` ✅ full (probe false negative: wrote `(actions ?? []).map(` vs regex `actions\.map` — mapping verified in code), `app_actions` ❌ half (array defined, no onClick handlers), toggle ❌, 375 ok ✅
- Submission commit: 52184dea (2026-10-09T10:43:04+08:00); first = same (1 commit)
- Late penalty: 8.45 days → 15.08% → final 7.64/50
- Remarks: Effect body, loaders, chip/text mapping, Next Quote binding, dark-mode state and theme wiring are all still `[Your code here]` TODOs (`static.*`, `life.*`, `map.*` failures are genuine). Service code itself is complete (try/catch + `?tags=` interpolation) but unreachable — `API_URL = 'https://vercel.app'` is also the wrong host. Commit author `Lloyd Segundo <ikolo211@gmail.com>` is the same identity as the Segundo_Kypler_Lloyd folder — flagged for instructor review (not a rubric row).

### 04_React_My_First_App_Balinggan_Arjhey

- Harness: 38 passed / 1 failed (`artifacts/wmad-302-2026-2-04_React_My_First_App_Submissions/04_React_My_First_App_Balinggan_Arjhey/report.json`)
- Docker: up ✅, HTTP 200 ✅
- 1. Hooks & Refs: 10/10 — all six rows ✅ (three states, `useRef` + `inputRef` bound, App dark-mode state)
- 2. Lifecycle: 10/10 — effect with deps `[]` calls both loaders ✅, quote on mount ✅, 8 tag options on mount ✅, no request loop ✅, clean console + no page errors ✅
- 3. Mapping: 10/12 — text/author ✅, chips exact `[wisdom, inspiration]` ✅, select options ✅, `conditional_color` ❌ (chip renders `MuiChip-colorDefault`), refresh replaces quote ✅
- 4. Async: 10/10 — `?tags=wisdom` captured ✅, `/api/tags` called ✅, 500 → fallback ✅, axios try/catch + mapping ✅
- 5. Theme: 8/8 — ThemeProvider/createTheme + `palette.mode` ✅, SpeedDial map ✅, actions+onClick ✅, toggle flipped background ✅, 375px ok ✅
- Submission commit: 2026-09-26T22:02:12+08:00 (on time)
- Late penalty: 0 days → 0% → final 48/50
- Remarks: Sole deduction — `map.conditional_color`: chips use a fixed `sx` background (`#87CEEB`) with no `color="success"` conditional at all, so MUI emits `MuiChip-colorDefault`; per rubric, `sx`-only recolors don't count.

### 04_React_My_First_App_Batil_Charlie

- Harness: 37 passed / 2 failed (`artifacts/wmad-302-2026-2-04_React_My_First_App_Submissions/04_React_My_First_App_Batil_Charlie/report.json`)
- Docker: up ✅, HTTP 200 ✅
- 1. Hooks & Refs: 7/10 — three states ✅, `use_ref_present` ✅, `input_ref_binding` ❌ (`selectTagRef = useRef('')` declared but never attached — Select driven by `onChange` state instead), `app_dark_mode_state` ✅
- 2. Lifecycle: 10/10 — effect + both loaders ✅, quote on mount ✅, tags on mount ✅, no request loop ✅, clean console + no page errors ✅
- 3. Mapping: 12/12 — text/author ✅, chips exact ✅, options ✅, `MuiChip-colorSuccess` ✅, refresh ✅
- 4. Async: 10/10 — `?tags=wisdom` captured ✅, `/api/tags` called ✅, 500 → fallback ✅, try/catch + mapping ✅
- 5. Theme: 8/8 — ThemeProvider actually wraps the tree ✅, `palette.mode` ✅, `speeddial_map` ✅, `app_actions` ✅ (full — handlers named `onclick` lowercase in App, read as `action.onclick` in GeneralSettings: unconventional but consistent and behaviorally proven), toggle flipped background ✅, 375px ok ✅
- Submission commit: 2026-09-27T13:38:00+08:00 (on time)
- Late penalty: 0 days → 0% → final 47/50
- Remarks: `static.input_ref_binding` ❌ — ref technique present-but-unbound; locked anchor ("states fine but ref unbound" = 5–7) applied at top of band (mechanical row sum would be 8). `static.app_actions` probe failed only on case (`onClick` vs `onclick`) — behavior proves the wiring.

### 04_React_My_First_App_Caligtan_Emmanuel

- Harness: 38 passed / 1 failed (`artifacts/wmad-302-2026-2-04_React_My_First_App_Submissions/04_React_My_First_App_Caligtan_Emmanuel/report.json`)
- Docker: up ✅, HTTP 200 ✅
- 1. Hooks & Refs: 10/10 — all six rows ✅ (three states, ref bound to Select, App dark-mode state)
- 2. Lifecycle: 10/10 — effect + both loaders ✅, quote on mount ✅, tags on mount ✅, no request loop ✅, clean console + no page errors ✅
- 3. Mapping: 10/12 — text/author ✅, chips exact ✅, options ✅, `conditional_color` ❌ (`MuiChip-colorDefault`), refresh ✅
- 4. Async: 10/10 — `?tags=wisdom` captured ✅, `/api/tags` called ✅, 500 → fallback ✅, try/catch + mapping ✅
- 5. Theme: 8/8 — ThemeProvider + `palette.mode` ✅, SpeedDial map ✅, actions ✅, toggle flipped background ✅, 375px ok ✅
- Submission commit: 2026-10-04T12:20:35+08:00
- Late penalty: 3.51 days → 6.28% → final 44.99/50
- Remarks: Sole rubric deduction — `map.conditional_color`: chips use fixed `sx` (`#ff7cac`) with no `color` prop/conditional, so no `MuiChip-colorSuccess`. 4 raw template-noise console warnings (filtered, not docked).

### 04_React_My_First_App_Cayetano_Keneth

- Harness: 39 passed / 0 failed (`artifacts/wmad-302-2026-2-04_React_My_First_App_Submissions/04_React_My_First_App_Cayetano_Keneth/report.json`)
- Docker: up ✅, HTTP 200 ✅
- 1. Hooks & Refs: 10/10 — all six rows ✅
- 2. Lifecycle: 10/10 — effect + loaders ✅, quote on mount ✅, tags on mount ✅, no request loop ✅, clean console + no page errors ✅
- 3. Mapping: 12/12 — text/author ✅, chips exact ✅, options ✅, `MuiChip-colorSuccess` ✅, refresh ✅
- 4. Async: 10/10 — `?tags=wisdom` captured ✅, `/api/tags` called ✅, 500 → fallback ✅, try/catch + mapping ✅
- 5. Theme: 8/8 — ThemeProvider + `palette.mode` ✅, SpeedDial map ✅, actions ✅, toggle flipped background ✅, 375px ok ✅
- Submission commit: 2026-10-01T15:43:11+04:00 (1 commit, found via `--follow src/App.jsx` fallback; author Keneth Cayetano)
- Late penalty: 0.82 days (~19h) → 1.47% → final 49.27/50
- Remarks: Clean sweep of all harness checks; only lateness (commit timestamp is +04:00 tz, ~19 hours past due).

### 04_React_My_First_App_Denis_Carrie

- Harness: 39 passed / 0 failed (`artifacts/wmad-302-2026-2-04_React_My_First_App_Submissions/04_React_My_First_App_Denis_Carrie/report.json`)
- Docker: up ✅, HTTP 200 ✅
- 1. Hooks & Refs: 10/10 — all six rows ✅
- 2. Lifecycle: 10/10 — effect + loaders ✅, quote on mount ✅, tags on mount ✅, no request loop ✅, clean console + no page errors ✅
- 3. Mapping: 12/12 — text/author ✅, chips exact ✅, options ✅, `MuiChip-colorSuccess` ✅, refresh ✅
- 4. Async: 10/10 — `?tags=wisdom` captured ✅, `/api/tags` called ✅, 500 → fallback ✅, try/catch + mapping ✅
- 5. Theme: 8/8 — ThemeProvider + `palette.mode` ✅, SpeedDial map ✅, actions ✅, toggle flipped background ✅, 375px ok ✅
- Submission commit: 2026-10-03T09:50:24+08:00; first 2026-09-26T16:18:24+08:00
- Late penalty: 2.41 days → 4.3% → final 47.85/50
- Remarks: Clean sweep of all harness checks; deduction is late-only (last commit 2026-10-03).

### 04_React_My_First_App_Diaz_Mark

- Harness: 39 passed / 0 failed (`artifacts/wmad-302-2026-2-04_React_My_First_App_Submissions/04_React_My_First_App_Diaz_Mark/report.json`)
- Docker: up ✅, HTTP 200 ✅
- 1. Hooks & Refs: 10/10 — all six rows ✅
- 2. Lifecycle: 10/10 — effect + loaders ✅, quote on mount ✅, tags on mount ✅, no request loop ✅, clean console + no page errors ✅
- 3. Mapping: 12/12 — text/author ✅, chips exact ✅, options ✅, `MuiChip-colorSuccess` ✅, refresh ✅
- 4. Async: 10/10 — `?tags=wisdom` captured ✅, `/api/tags` called ✅, 500 → fallback ✅, try/catch + mapping ✅
- 5. Theme: 8/8 — ThemeProvider + `palette.mode` ✅, SpeedDial map ✅, actions ✅, toggle flipped background ✅, 375px ok ✅
- Submission commit: 2026-09-30T19:37:45+08:00 (1 commit, before 23:59:59 PHT cutoff)
- Late penalty: 0 days → 0% → final 50/50
- Remarks: Clean sweep; on time.

### 04_React_My_First_App_Diwan_Mark_Neil

- Harness: 39 passed / 0 failed (`artifacts/wmad-302-2026-2-04_React_My_First_App_Submissions/04_React_My_First_App_Diwan_Mark_Neil/report.json`)
- Docker: up ✅, HTTP 200 ✅
- 1. Hooks & Refs: 10/10 — all six rows ✅
- 2. Lifecycle: 10/10 — effect + loaders ✅, quote on mount ✅, tags on mount ✅, no request loop ✅, clean console + no page errors ✅
- 3. Mapping: 12/12 — text/author ✅, chips exact ✅, options ✅, `MuiChip-colorSuccess` ✅, refresh ✅
- 4. Async: 10/10 — `?tags=wisdom` captured ✅, `/api/tags` called ✅, 500 → fallback ✅, try/catch + mapping ✅
- 5. Theme: 8/8 — ThemeProvider + `palette.mode` ✅, SpeedDial map ✅, actions ✅, toggle flipped background ✅, 375px ok ✅
- Submission commit: 2026-10-03T07:47:37-07:00; first 2026-09-26T03:31:50-07:00 (commits in -07:00 tz)
- Late penalty: 2.95 days → 5.27% → final 47.37/50
- Remarks: Clean sweep; deduction is late-only.

### 04_React_My_First_App_Dumalti_Khivieron

- Harness: 39 passed / 0 failed (`artifacts/wmad-302-2026-2-04_React_My_First_App_Submissions/04_React_My_First_App_Dumalti_Khivieron/report.json`)
- Docker: up ✅, HTTP 200 ✅
- 1. Hooks & Refs: 10/10 — all six rows ✅
- 2. Lifecycle: 10/10 — effect + loaders ✅, quote on mount ✅, tags on mount ✅, no request loop ✅, clean console + no page errors ✅
- 3. Mapping: 12/12 — text/author ✅, chips exact ✅, options ✅, `MuiChip-colorSuccess` ✅, refresh ✅
- 4. Async: 10/10 — `?tags=wisdom` captured ✅, `/api/tags` called ✅, 500 → fallback ✅, try/catch + mapping ✅
- 5. Theme: 8/8 — ThemeProvider + `palette.mode` ✅, SpeedDial map ✅, actions ✅, toggle flipped background ✅, 375px ok ✅
- Submission commit: 2026-10-03T11:29:47+08:00; first 2026-09-26T15:58:35+08:00
- Late penalty: 2.48 days → 4.43% → final 47.78/50
- Remarks: Clean sweep; deduction is late-only.

### 04_React_My_First_App_Laoeng_Vera

- Harness: 39 passed / 0 failed (`artifacts/wmad-302-2026-2-04_React_My_First_App_Submissions/04_React_My_First_App_Laoeng_Vera/report.json`)
- Docker: up ✅, HTTP 200 ✅
- 1. Hooks & Refs: 10/10 — all six rows ✅
- 2. Lifecycle: 10/10 — effect + loaders ✅, quote on mount ✅, tags on mount ✅, no request loop ✅, clean console + no page errors ✅
- 3. Mapping: 12/12 — text/author ✅, chips exact ✅, options ✅, `MuiChip-colorSuccess` ✅, refresh ✅
- 4. Async: 10/10 — `?tags=wisdom` captured ✅, `/api/tags` called ✅, 500 → fallback ✅, try/catch + mapping ✅
- 5. Theme: 8/8 — ThemeProvider + `palette.mode` ✅, SpeedDial map ✅, actions ✅, toggle flipped background ✅, 375px ok ✅
- Submission commit: 2026-09-27T13:49:17+08:00; first 2026-09-26T15:57:49+08:00
- Late penalty: 0 days → 0% → final 50/50
- Remarks: Clean sweep; on time.

### 04_React_My_First_App_Lindawan_Cristy

- Harness: 27 passed / 12 failed (`artifacts/wmad-302-2026-2-04_React_My_First_App_Submissions/04_React_My_First_App_Lindawan_Cristy/report.json`)
- Docker: up ✅, HTTP 200 ✅
- 1. Hooks & Refs: 10/10 — all six rows ✅ (three states, `inputRef={selectTagRef}` bound, App dark-mode state)
- 2. Lifecycle: 9/10 — effect + both loaders ✅, `quote_on_mount` half (mount loader works and renders a quote, but from the local dataset — no API), `tags_on_mount` ✅ (20 options, hardcoded local tags), no request loop ✅, clean console + no page errors ✅
- 3. Mapping: 6/12 — `text_author_mapped` half (binds `{quote.text}`/`{quote.author}` correctly, fixture never fetched), `chips_from_quote_tags` half (maps `quote.tags` correctly, wrong dataset → `[learning, wisdom]`), `select_options_from_tags` half (maps `tags` state, emoji-decorated labels `🧠 wisdom` ≠ fixture `wisdom`), `conditional_color` half (code has exact TODO-6 `color={selectedTag === t ? 'success' : 'secondary'}`, harness couldn't select an option), `refresh_updates_quote` half (IconButton `aria-label="Next quote"` with onClick works, but no text button for the harness to click)
- 4. Async: 1/10 — `quote_request_captured` ❌ / `tags_endpoint_called` ❌ / `tags_param_interpolated` ❌ / `static.service_axios_try_catch` ❌ / `static.tags_interpolation_code` ❌: the service is a 61-quote local array with **zero HTTP** (no axios, no fetch, no `?tags=` — `getRandomQuote` filters a local array); `error_fallback` half (check passed vacuously — fixture text was never on screen; their catch only `console.error`s, no fallback object rendered)
- 5. Theme: 8/8 — ThemeProvider + `palette.mode` ✅, SpeedDial map ✅, actions ✅, toggle flipped background ✅, 375px ok ✅
- Submission commit: 2026-10-01T13:59:00+08:00 (1 commit, `--follow src/App.jsx` fallback; author Cristy Lindawan)
- Late penalty: 0.58 days → 1.04% → final 33.65/50
- Remarks: Student replaced the entire async-service architecture with an offline dataset + music-player UI (auto-advance, swipe, text-size slider). Core rubric requirement (live API via axios with `?tags=` interpolation and `/tags` fetch) is absent — all section-4 behavioral rows are genuine failures, not harness quirks. Extra credit-style extras noted only in remarks; no bonus per locked policy.

### 04_React_My_First_App_Liwanag_Denie

- Harness: 38 passed / 1 failed (`artifacts/wmad-302-2026-2-04_React_My_First_App_Submissions/04_React_My_First_App_Liwanag_Denie/report.json`)
- Docker: up ✅, HTTP 200 ✅
- 1. Hooks & Refs: 10/10 — all six rows ✅
- 2. Lifecycle: 10/10 — effect + loaders ✅, quote on mount ✅, tags on mount ✅, no request loop ✅, clean console + no page errors ✅
- 3. Mapping: 12/12 — text/author ✅, chips exact ✅, options ✅, `MuiChip-colorSuccess` ✅, refresh ✅
- 4. Async: 10/10 — `?tags=wisdom` captured ✅, `/api/tags` called ✅, 500 → fallback ✅, try/catch + mapping ✅
- 5. Theme: 6/8 — `theme_provider` ✅, `theme_mode_param` ✅ (`palette: { mode, … }`), `speeddial_map` ✅, `app_actions` ✅ (actions[0] `onClick` inverts `isDarkMode`), `toggle_changes_bg` ❌, 375px ok ✅
- Submission commit: 2026-09-26T18:48:12+08:00; first 2026-09-26T15:58:03+08:00
- Late penalty: 0 days → 0% → final 48/50
- Remarks: `theme.toggle_changes_bg` ❌ — `<CssBaseline />` is imported but never rendered in App's JSX, so the theme never paints `body`/`html`; toggling `isDarkMode` changes `theme(mode)` but the page fingerprint (start `bodyBg: rgba(0,0,0,0)`) stays identical. All other checks green; anchor band "wiring present but toggle doesn't change computed theme" = 5–6 → 6.

### 04_React_My_First_App_Ngalob_AdrianLee

- Harness: 37 passed / 2 failed (`artifacts/wmad-302-2026-2-04_React_My_First_App_Submissions/04_React_My_First_App_Ngalob_AdrianLee/report.json`)
- Docker: up ✅, HTTP 200 ✅
- 1. Hooks & Refs: 10/10 — all six rows ✅
- 2. Lifecycle: 10/10 — effect + loaders ✅, quote on mount ✅, tags on mount ✅, no request loop ✅, clean console + no page errors ✅
- 3. Mapping: 12/12 — text/author ✅, chips exact ✅, options ✅, `MuiChip-colorSuccess` ✅, refresh ✅
- 4. Async: 10/10 — `quote_request_captured` ✅, `?tags=wisdom` captured ✅, `/tags` called ✅, 500 → fallback ✅, `service_axios_try_catch` ✅ full after code read (probe wants literal `axios.get`; student uses `axios.create()` instance + `api.get()` with try/catch + payload mapping — technique present, behavioral checks prove the requests)
- 5. Theme: 8/8 — ThemeProvider + `palette.mode` ✅, SpeedDial map ✅, actions ✅, toggle flipped background ✅, 375px ok ✅
- Submission commit: 2026-10-03T19:24:57+08:00; first 2026-10-01T11:00:12+08:00
- Late penalty: 2.81 days → 5.02% → final 47.49/50
- Remarks: Both `pass:false` rows are probe false negatives verified in code — `static.service_axios_try_catch` (axios instance method, not literal) and `static.tags_interpolation_code` (axios `params: { tags }` config builds `?tags=` at runtime; supporting row, and `async.tags_param_interpolated` passed behaviorally). Service targets `api.quotable.io` (mocked like any external host) with a rotating offline fallback on error — extras, no bonus.

### 04_React_My_First_App_Segundo_Kypler_Lloyd

- Harness: 39 passed / 0 failed (`artifacts/wmad-302-2026-2-04_React_My_First_App_Submissions/04_React_My_First_App_Segundo_Kypler_Lloyd/report.json`)
- Docker: up ✅, HTTP 200 ✅
- 1. Hooks & Refs: 10/10 — `quote_state` ✅, `tags_state` ✅, `selected_tag_state` ✅, `use_ref_present` ✅, `input_ref_binding` ✅, `app_dark_mode_state` ✅
- 2. Lifecycle: 10/10 — `effect_present` (deps `[]`) ✅, `effect_calls_loaders` ✅, `quote_on_mount` ✅, `tags_on_mount` (8 options) ✅, `no_request_loop` (2, StrictMode) ✅, clean console + no page errors ✅
- 3. Mapping: 12/12 — `text_author_mapped` ✅, `chips_from_quote_tags` exact `[wisdom, inspiration]` ✅, `select_options_from_tags` ✅, `conditional_color` (`MuiChip-colorSuccess`) ✅, `refresh_updates_quote` ✅
- 4. Async: 10/10 — `quote_request_captured` (3 GETs) ✅, `?tags=wisdom` captured ✅, `/api/tags` called ✅, `error_fallback` (500 → fallback, no crash) ✅, `service_axios_try_catch` ✅
- 5. Theme: 8/8 — `theme_provider` ✅, `theme_mode_param` ✅, `speeddial_map` ✅, `app_actions` ✅, `toggle_changes_bg` (action[0] `"?"` changed page fingerprint) ✅, `css.responsive_375` ✅
- Submission commit: 2026-10-03T18:07:41+08:00 (3 commits, method=direct); first 2026-09-26T17:01:13+08:00
- Late penalty: 2.76 days → 4.92% → final 47.54/50
- Remarks: Clean sweep — every static and behavioral check passed; only 3 template-noise console warnings (filtered).

### 04_React_My_First_App_Soliman_Chenzen

- Harness: 36 passed / 3 failed (`artifacts/wmad-302-2026-2-04_React_My_First_App_Submissions/04_React_My_First_App_Soliman_Chenzen/report.json`)
- Docker: up ✅, HTTP 200 ✅
- 1. Hooks & Refs: 0/10 — all six rows fail (complete redesign: no useState, useRef, or dark-mode state; hooks architecture replaced with offline local arrays)
- 2. Lifecycle: 5/10 — effect present ✅ but body implements `setTimeout(…)` local quote generation, not API loaders; `effect_calls_loaders` ❌ (no API), `quote_on_mount` half (renders local quote, not fixture), `tags_on_mount` ❌ (no `/tags` endpoint), `no_request_loop` ✅, clean console + no page errors ✅
- 3. Mapping: 0/12 — `text_author_mapped` ❌ (local object format ≠ fixture), `chips_from_quote_tags` ❌ (no `tags` property), `select_options_from_tags` ❌ (no `/tags` fetch), `conditional_color` ❌ (no tag selection), `refresh_updates_quote` ❌ (no API, just local `setTimeout`)
- 4. Async: 0/10 — `quote_request_captured` ❌ / `tags_endpoint_called` ❌ / `tags_param_interpolated` ❌ / `static.service_axios_try_catch` ❌ / `error_fallback` ❌: service is a 61-quote local array with **zero HTTP** (no axios, no fetch, no `?tags=`); catch only `console.error`s
- 5. Theme: 8/8 — ThemeProvider + palette mode ✅, SpeedDial wiring ✅, actions ✅, toggle flipped background ✅, 375px ok ✅
- Submission commit: 2026-10-09T17:23:45+08:00 (1 commit, before due); first = same
- Late penalty: 9.73 days → 17.38% → final 10.73/50
- Remarks: Student replaced the entire async-service architecture with a local dataset + music-player UI (auto-advance, swipe, text-size slider). Core rubric requirement (live API via axios with `?tags=` interpolation and `/tags` fetch) is absent — all section-4 behavioral rows are genuine failures, not harness quirks. Extra credit-style extras noted only in remarks; no bonus per locked policy.

### 04_React_My_First_App_Tudlong_Cymar

- Harness: 39 passed / 0 failed (`artifacts/wmad-302-2026-2-04_React_My_First_App_Submissions/04_React_My_First_App_Tudlong_Cymar/report.json`)
- Docker: up ✅, HTTP 200 ✅
- 1. Hooks & Refs: 10/10 — `quote_state` ✅, `tags_state` ✅, `selected_tag_state` ✅, `use_ref_present` ✅, `input_ref_binding` ✅, `app_dark_mode_state` ✅
- 2. Lifecycle: 10/10 — `effect_present` (deps `[]`) ✅, `effect_calls_loaders` ✅, `quote_on_mount` ✅, `tags_on_mount` (8 options) ✅, `no_request_loop` (2, StrictMode) ✅, clean console + no page errors ✅
- 3. Mapping: 12/12 — `text_author_mapped` ✅, `chips_from_quote_tags` exact `[wisdom, inspiration]` ✅, `select_options_from_tags` ✅, `conditional_color` (`MuiChip-colorSuccess`) ✅, `refresh_updates_quote` ✅
- 4. Async: 10/10 — `quote_request_captured` (3 GETs) ✅, `?tags=wisdom` captured ✅, `tags_endpoint_called` (2 GETs `/api/tags`) ✅, `error_fallback` (500 → fallback, no crash) ✅, `service_axios_try_catch` ✅
- 5. Theme: 8/8 — `theme_provider` ✅, `theme_mode_param` ✅, `speeddial_map` ✅, `app_actions` ✅, `toggle_changes_bg` (action[0] `"?"` changed page fingerprint) ✅, `css.responsive_375` ✅
- Submission commit: 2026-09-30T16:45:22+08:00; first 2026-09-26T18:03:12+08:00
- Late penalty: 0 days → 0% → final 50/50
- Remarks: Clean sweep — every static and behavioral check passed; only 3 template-noise console warnings (filtered).
