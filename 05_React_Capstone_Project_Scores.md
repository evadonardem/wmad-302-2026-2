# React Capstone Project — Scores

- Rubric: StarterKit README — 4 categories = 50 pts (bonus separate, max +10)
- Verified via docker compose (localhost:800N) + headless Playwright harness
  (Pexels mocked + auth-header capture; exactly one live search per grading run)
- No late penalty (first/last student commits recorded for reference only)
- Last evaluated: 2026-10-17

## Summary

| Group | API/15 | Chain/15 | Layout/12 | Integr/8 | Final/50 | Bonus | First Commit | Last Commit | Notes |
| --- | --: | --: | --: | --: | --: | --: | --- | --- | --- |
| 05_React_Capstone_Project_Group_1 | 13 | 14 | 8 | 5 | 40 | +7 | 2026-10-03 | 2026-10-03 | Alt-text place-filter drops all photos |
| 05_React_Capstone_Project_Group_2 | 15 | 10 | 11 | 8 | 44 | +8 | 2026-10-05 | 2026-10-05 | 3-tier cascade; probe-verified row upgrades |
| 05_React_Capstone_Project_Group_3 | 11 | 8 | 12 | 6 | 37 | +7 | 2026-10-04 | 2026-10-04 | Static local region lists; no PSGC calls |
| 05_React_Capstone_Project_Group_4 | 15 | 14 | 11 | 8 | 48 | +8 | 2026-10-01 | 2026-10-04 | Demo fallback masks zero-results empty state |
| 05_React_Capstone_Project_Group_5 | 15 | 10 | 12 | 8 | 45 | +6 | 2026-09-29 | 2026-10-05 | 3-tier form; cities row = design deviation |
| 05_React_Capstone_Project_Group_6 | 13 | 14 | 8 | 6 | 41 | +8 | 2026-09-29 | 2026-10-04 | Display filter drops fetched photos |
| 05_React_Capstone_Project_Group_7 | 15 | 15 | 12 | 8 | 50 | +5 | 2026-10-04 | 2026-10-05 | Clean run |
| 05_React_Capstone_Project_Group_8 | 15 | 15 | 12 | 8 | 50 | +8 | 2026-10-03 | 2026-10-05 | Clean run; masonry responsive columns |

## 05_React_Capstone_Project_Group_1

- Commits: 3 student commits (first 2026-10-03, last 2026-10-03)
- Evidence: `artifacts/wmad-302-2026-2-05_React_Capstone_Project_Submissions/05_React_Capstone_Project_Group_1/report.json`, `shots/`
- Docker: up/build ✅, HTTP 200 ✅, logs clean ✅

### Section scores

| Section | Earned | Key evidence |
| --- | --: | --- |
| 1. API Service | 13/15 | PSGC regions ✅, auth header len 56 ✅, key via `import.meta.env` ✅; `response_mapped_to_cards` 0 — `geoPhotoService.buildResults` alt-text filter requires place word in every photo's string fields, dropping all fixture photos |
| 2. Chained Lifecycle | 14/15 | cities populate override full 3 (menu-animation timing race in check; populate works per race/e2e evidence); reset/race/deps/guard/disabled all ✅ |
| 3. Layout | 8/12 | loading/empty/error ✅; card_media 0 + photographer_credit 0 — same place-filter empties the mocked gallery; grid override +1 (responsive layout present, checker regex too narrow); 375px ✅ |
| 4. Integration | 5/8 | theme override +2 (body-bg check misses their layered palette); e2e + replace 0 — display bug means cards never render, so the chain ends in empty state |

### Bonus: +7/10
- Photo lightbox + keyboard navigation
- Hero carousel with place-themed backgrounds
- Custom fonts and distinctive visual identity

### Remarks
- Core defect: one filter in `geoPhotoService` removes every photo whose alt text lacks the searched place word (fixtures and live) — costs §1 mapped, §3 card/credit, §4 e2e/replace.
- Quirk overrides: `cities_populate` (timing), `gallery_grid_breakpoints` (checker vocabulary), `theme_toggle_changes_palette` (body-bg measurement).

## 05_React_Capstone_Project_Group_2

- Commits: 1 student commit (first 2026-10-05, last 2026-10-05)
- Evidence: `artifacts/wmad-302-2026-2-05_React_Capstone_Project_Submissions/05_React_Capstone_Project_Group_2/report.json`, `shots/`
- Docker: up/build ✅, HTTP 200 ✅, logs clean ✅

### Section scores

| Section | Earned | Key evidence |
| --- | --: | --- |
| 1. API Service | 15/15 | query row override full 3 — parity probe captured `query=Adams+Ilocos+Norte+Philippines+tourist+spots` (city word + tourist ✅); PSGC cascade live ✅, auth header ✅, hygiene/secrets ✅ |
| 2. Chained Lifecycle | 10/15 | 3-tier Region→Province→Municipality form is a design deviation from the harness's 2-level model: `cities_populate` 0 (same ruling as Group 5); reset full 3 (probes: downstream controls clear + fresh populate after region switch); race half 2 — `requestRef`/`townRequestRef` id-guards present (LocationForm.jsx:21–22,48,65) but tier mismatch makes last-wins unobservable to harness; deps full 1.5 — cascade wired in change handlers with request-ids (equally valid architecture; effect-deps formulation N/A); stale guard 1.5 ✅; disabled 2 ✅ |
| 3. Layout | 11/12 | loading/error/card/credit ✅; empty half 1 — `remember()` query-cache blocks refetch of a previously seen query; grid override +1 (responsive layout, checker regex miss); 375px ✅ |
| 4. Integration | 8/8 | parity-probe upgrades: e2e full 2 (Region→Ilocos Norte→Adams→Search→Pexels call fired, zero page errors), query_city full 1.5, replace full 1.5 (`loadPhotos` sets full new array + id guard, App.jsx:59–74; second search fired new query); theme 2 ✅; console 0 — `/favicon.svg` 404, `public/` empty; pageerrors 0.5 ✅; 7.5 rounds up |

### Bonus: +8/10
- Photo lightbox + hero carousel with region themes
- Favorites + "load more" pagination
- Keyboard accessibility and custom typography

### Remarks
- Harness's 2-level expectations misfired on the 3-tier Select cascade; behavioral parity probe (`probe_g2p.mjs`, `probe_g2r.mjs`) upgraded query/e2e/replace/reset/deps/race rows to the same standard applied to Group 5.
- Genuine deductions kept: `cities_populate` 0 (design deviation), empty half (cache blocks refetch), console 0 (missing favicon).

## 05_React_Capstone_Project_Group_3

- Commits: 2 student commits (first 2026-10-04, last 2026-10-04)
- Evidence: `artifacts/wmad-302-2026-2-05_React_Capstone_Project_Submissions/05_React_Capstone_Project_Group_3/report.json`, `shots/`
- Docker: up/build ✅, HTTP 200 ✅, logs clean ✅

### Section scores

| Section | Earned | Key evidence |
| --- | --: | --- |
| 1. API Service | 11/15 | `regions_loaded` 0/3 — region lists are static local data; PSGC API never called (probe-confirmed, zero requests to psgc.gitlab.io); query half 1.5 — "Cagayan tourist spot" is province-level; auth len 56 ✅ via probe, key hygiene ✅, resilience ✅ |
| 2. Chained Lifecycle | 8/15 | cities_populate 0, race 0; reset full 3 (probe-proven); deps+guard 3 ✅; disabled override full 2 — `disabled={!selectedRegion}` at LocationForm.jsx:70 |
| 3. Layout | 12/12 | skeleton ✅, replace ✅, empty ✅, error fallback on 500 ✅, cards + credit ✅, grid ✅ (checker-recognized form) |
| 4. Integration | 6/8 | e2e half 1, query_city 0.75, replaces 1.5 ✅, theme 2 ✅; console 0 — React invalid DOM props: `justifyContent` on Stack (LocationForm.jsx:46) and `PaperProps` on MenuProps (LocationForm.jsx:57/80); pageerrors 0.5 ✅ |

### Bonus: +7/10
- Photo actions (download/share) and SVG fallback art for missing photos
- Polished empty/error illustrations

### Remarks
- Core miss: PSGC endpoint requirement not implemented — static arrays instead of live API (`async.regions_loaded` 0/3).
- React console noise from invalid MUI prop pass-throughs costs the console row.

## 05_React_Capstone_Project_Group_4

- Commits: 4 student commits (first 2026-10-01, last 2026-10-04)
- Evidence: `artifacts/wmad-302-2026-2-05_React_Capstone_Project_Submissions/05_React_Capstone_Project_Group_4/report.json`, `shots/`
- Docker: up/build ✅, HTTP 200 ✅, logs clean ✅

### Section scores

| Section | Earned | Key evidence |
| --- | --: | --- |
| 1. API Service | 15/15 | live PSGC ✅, auth len 56 ✅, query "Boac tourist spot" city word ✅, mapped ✅, hygiene/secrets/resilience ✅ |
| 2. Chained Lifecycle | 14/15 | cities override full 3 — populate proven by race check (73 options) + e2e; check counted options too early (menu-animation race); `stale_guard_code` 0/1.5 — no cancellation/stale guard anywhere in LocationForm (genuine) |
| 3. Layout | 11/12 | empty half 1 — service lines 79–82 substitutes Unsplash demo photos on zero results, masking the empty state; grid override +1 — Grid2 `size={{xs,sm,md}}` (checker regex miss); loading/error/card/credit ✅ |
| 4. Integration | 8/8 | e2e/query/replaces/theme full ✅; console 0 — `/favicon.svg` 404, `public/` absent; pageerrors ✅; 7.5 rounds up |

### Bonus: +8/10
- Rich photo actions, favorites, and polished theming (dark rgb(4,22,31) ↔ light rgb(255,248,236))
- Distinctive design system beyond StarterKit baseline

### Remarks
- Only two genuine issues: no stale-response guard (§2) and demo-photo fallback masking empty results (§3); everything else full or quirk-overridden.

## 05_React_Capstone_Project_Group_5

- Commits: 17 student commits (first 2026-09-29, last 2026-10-05)
- Evidence: `artifacts/wmad-302-2026-2-05_React_Capstone_Project_Submissions/05_React_Capstone_Project_Group_5/report.json`, `shots/`
- Docker: up/build ✅, HTTP 200 ✅, logs clean ✅

### Section scores

| Section | Earned | Key evidence |
| --- | --: | --- |
| 1. API Service | 15/15 | query override full 3 — probe captured "Adams Ilocos Norte Philippines tourist spot" (city word + tourist ✅); PSGC live ✅, auth ✅, mapped ✅, hygiene ✅ |
| 2. Chained Lifecycle | 10/15 | 3-tier Region→Province→City: `cities_populate` 0 (design deviation from harness 2-level model); race half 2 — code has `isCurrent` ignore-flags but architecture makes harness's option-count evidence unobservable; reset 3 ✅, deps 1.5 ✅, guard override 1.5 — `isCurrent` flag = checker regex miss; disabled 2 ✅ |
| 3. Layout | 12/12 | loading override full 2 (skeleton probe ✅), empty override full 2 ("No tourist spots found" + cardsGone probe ✅), grid override +1 (Grid2 size props), error/card/credit/375 ✅ |
| 4. Integration | 8/8 | probe-proven full 3-tier cascade: e2e full 2, query_city 1.5, replaces 1.5; theme 2 ✅, console/pageerrors ✅ |

### Bonus: +6/10
- Featured-destinations prefetch (12 destinations; StrictMode doubles the pexels calls on mount)
- Solid theming and layout polish, but extras mostly restate core requirements

### Remarks
- Harness failures were 3-tier-model artifacts; probes (`probe_g5a–d.mjs`) upgraded the affected rows.
- Genuine deviations kept: cities_populate 0 (region→province→city is not the specified region→city chain), race half (guard present but harness cannot observe correct-tier options).

## 05_React_Capstone_Project_Group_6

- Commits: 12 student commits (first 2026-09-29, last 2026-10-04)
- Evidence: `artifacts/wmad-302-2026-2-05_React_Capstone_Project_Submissions/05_React_Capstone_Project_Group_6/report.json`, `shots/`
- Docker: up/build ✅, HTTP 200 ✅, logs clean ✅

### Section scores

| Section | Earned | Key evidence |
| --- | --: | --- |
| 1. API Service | 13/15 | `response_mapped_to_cards` 0 — genuine defect: `matchesPlace` display filter (App.jsx:294, defs :18–47) builds a text blob from photo string fields excluding url/place/photographer and requires it to contain the place key, so fixture alts ("Fixture tourist spot N") and live photos without the place word are always dropped; PSGC/auth/query/hygiene/resilience/secrets ✅ |
| 2. Chained Lifecycle | 14/15 | cities 3 ✅, reset 3 ✅, race 4 ✅ (in-order arrivals; behaviorally last-wins), deps 1.5 ✅, disabled 2 ✅; `stale_guard_code` 0/1.5 — no isCurrent/cancel guard in either LocationForm effect (genuine); 13.5 rounds up |
| 3. Layout | 8/12 | card_media 0 + credit 0 — same display filter empties the mocked gallery; grid override +1 — `CARD_WIDTH = { xs: '100%', sm: 340 }` responsive sx (checker regex miss); loading/empty/error/375 ✅ |
| 4. Integration | 6/8 | e2e half 1, query_city 1.5 ✅, replace half 0.75 (replace state logic correct — App.jsx:250 `setPhotos([photo])` — but display filter hides both result sets); theme 2 ✅; console 0 — React invalid prop `justifyContent` on Stack (LocationForm.jsx:82); pageerrors 0.5 ✅ |

### Bonus: +8/10
- Load-more pagination, "Surprise me" random search, recent-searches chips
- Palm-tree animated SVG scene (ThemeBackdrop), favorites, download-size menu, lightbox, Autocomplete type-to-filter

### Remarks
- Core defect: display filter after a successful fetch drops every photo lacking the place word in alt/photographer/title — costs §1 mapped, §3 card/credit, §4 e2e/replace halves.
- Genuine: no stale guard (LocationForm); console: invalid `justifyContent` prop.

## 05_React_Capstone_Project_Group_7

- Commits: 2 student commits (first 2026-10-04, last 2026-10-05)
- Evidence: `artifacts/wmad-302-2026-2-05_React_Capstone_Project_Submissions/05_React_Capstone_Project_Group_7/report.json`, `shots/`
- Docker: up/build ✅, HTTP 200 ✅, logs clean ✅

### Section scores

| Section | Earned | Key evidence |
| --- | --: | --- |
| 1. API Service | 15/15 | PSGC live (17 regions) ✅, auth len 56 ✅, query "Boac+tourist+spot" city word ✅, mapped 6 imgs ✅, hygiene/secrets/resilience ✅ |
| 2. Chained Lifecycle | 15/15 | cities override full 3 — check counted 0 options too early (picked Laoac) while race check later showed 73 displayed options and e2e cities=true (same timing quirk as Group 4); reset/race/deps/guard/disabled all ✅ |
| 3. Layout | 12/12 | loading/empty/error ✅, 6 pexels imgs ✅, photographer credit (name shown, no link — row allows either) ✅, grid override +1 — Grid2 `size={{xs,sm,md}}` (checker regex miss), 375px ✅ |
| 4. Integration | 8/8 | e2e full ✅, query_city 1.5 ✅, replaces 1.5 ✅, theme 2 ✅; console 0 — `/favicon.svg` 404 (public/ absent); pageerrors 0.5 ✅; 7.5 rounds up |

### Bonus: +5/10
- Favorites with localStorage persistence
- Photo lightbox dialog with aria labels, wave skeletons, custom CSS styling

### Remarks
- Clean run: only favicon 404 (console) + two checker-vocabulary quirk overrides (grid, cities timing).
- Live-search INFO noted: live GET 200 (12 photos) but 0 live imgs rendered post-check — informational only, not scored.

## 05_React_Capstone_Project_Group_8

- Commits: 3 student commits (first 2026-10-03, last 2026-10-05)
- Evidence: `artifacts/wmad-302-2026-2-05_React_Capstone_Project_Submissions/05_React_Capstone_Project_Group_8/report.json`, `shots/`
- Docker: up/build ✅, HTTP 200 ✅, logs clean ✅

### Section scores

| Section | Earned | Key evidence |
| --- | --: | --- |
| 1. API Service | 15/15 | PSGC live ✅, auth len 56 ✅, query "Aborlan+Philippines+tourist+spot" city word ✅, mapped 6 imgs ✅, hygiene/secrets/resilience ✅ |
| 2. Chained Lifecycle | 15/15 | cities 125 options ✅ (passed natively), reset ✅, race last-wins 73 ✅, deps/guard/disabled ✅ |
| 3. Layout | 12/12 | loading/empty/error ✅, card_media 6 ✅, photographer name shown ✅, grid override +1 — masonry `columnCount: { xs: 1, sm: 2, md: 3 }` (responsive breakpoints; checker regex miss), 375px ✅ |
| 4. Integration | 8/8 | e2e/query/replaces/theme ✅; console 0 — React invalid prop `justifyContent` on Stack (LocationForm.jsx:57) + `/favicon.svg` 404; pageerrors 0.5 ✅; 7.5 rounds up |

### Bonus: +8/10
- Masonry gallery with staggered fadeUp animations, hover attribution overlays, lightbox (Grow)
- Favorites + localStorage, heartPop animation, aria-labels, Tooltip/Chip, custom CSS theming

### Remarks
- Clean run: only console noise (invalid prop + favicon 404) + grid checker-vocabulary override.
- Cosmetic: page title contains a literal `{7}` template placeholder — harness title check passed; not scored.
