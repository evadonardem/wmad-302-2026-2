# JS Fundamentals Part 2 — Scores

- Rubric: 3 modules × 10 pts = 30 pts
- Due: 2026-09-04 23:59:59 PHT (late penalty prorated daily: 12.5%/7 days, max 62.5%)
- Last evaluated: 2026-10-15T23:03:31+08:00

## Summary

| Student Folder | M1 | M2 | M3 | Earned/30 | Days Late | Deduction | Final | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 02_JS_Fundamentals_Part2_Agustin_Jecressa | 8 | 9 | 9 | 26 | 0 | 0% | 26 | on time |
| 02_JS_Fundamentals_Part2_Bala_oy_Giero | 9 | 10 | 8 | 27 | 34.43 | 71.49% | 7.7 | submitted via Segundo's account (borrowed device): late 61.49% + 10pp integrity |
| 02_JS_Fundamentals_Part2_Balinggan_Arjhey | 10 | 10 | 10 | 30 | 8.44 | 15.08% | 25.48 | late |
| 02_JS_Fundamentals_Part2_Bangon_Norlyn | 6 | 10 | 2 | 18 | 7.55 | 13.49% | 15.57 | late; M1 partial credit override (naming-slip bug, logic correct) |
| 02_JS_Fundamentals_Part2_Batil_Charlie | 7 | 10 | 8 | 25 | 14.71 | 26.26% | 18.44 | late |
| 02_JS_Fundamentals_Part2_Caligtan_Emmanuel | 10 | 10 | 10 | 30 | 11.85 | 21.16% | 23.65 | late |
| 02_JS_Fundamentals_Part2_Cayetano_Keneth | 10 | 10 | 10 | 30 | 30.82 | 55.03% | 13.49 | late |
| 02_JS_Fundamentals_Part2_Corton_Jimrey | 7 | 6 | 8 | 21 | 32.32 | 57.71% | 8.88 | late |
| 02_JS_Fundamentals_Part2_Denis_Carrie | 10 | 10 | 10 | 30 | 30.69 | 54.8% | 13.56 | late |
| 02_JS_Fundamentals_Part2_Diaz_Mark_Angelo | 7 | 6 | 9 | 22 | 0 | 0% | 22 | on time |
| 02_JS_Fundamentals_Part2_Diwan_Mark_Neil | 10 | 10 | 10 | 30 | 28.95 | 51.69% | 14.49 | late |
| 02_JS_Fundamentals_Part2_Dumalti_Khivieron | 10 | 10 | 8 | 28 | 7.55 | 13.48% | 24.23 | late |
| 02_JS_Fundamentals_Part2_Laoeng_Vera | 10 | 10 | 10 | 30 | 3.92 | 7% | 27.9 | late |
| 02_JS_Fundamentals_Part2_Lindawan_Cristy | 9 | 9 | 9 | 27 | 5.49 | 9.8% | 24.35 | instructor override: behavior verified 30, −1/module for missing exports |
| 02_JS_Fundamentals_Part2_Liwanag_Denie | 7 | 6 | 5 | 18 | 28.77 | 51.37% | 8.75 | late |
| 02_JS_Fundamentals_Part2_Maging_Geovannie | 7 | 6 | 8 | 21 | 0 | 0% | 21 | on time |
| 02_JS_Fundamentals_Part2_Ngalob_AdrianLee | 8 | 10 | 9 | 27 | 6.72 | 11.99% | 23.76 | late |
| 02_JS_Fundamentals_Part2_Segundo_Kypler_Lloyd | 7 | 6 | 8 | 21 | 6.58 | 11.75% | 18.53 | late |
| 02_JS_Fundamentals_Part2_Soliman_Chenzen | 10 | 10 | 10 | 30 | 10.81 | 19.3% | 24.21 | late |
| 02_JS_Fundamentals_Part2_Tudlong_Cymar | 7 | 6 | 8 | 21 | 29.45 | 52.59% | 9.96 | late |

## Details

### 02_JS_Fundamentals_Part2_Agustin_Jecressa
- Harness: m1 0/3, m2 5/5, m3 8/9 checks pass (harness v1.1.0)
- M1: 8 — listener and counting on click OK, but `else` branch counts any non-`active` li as delayed (C2 half) and label says `"Delayed Routes:"` instead of `"Delayed/Full:"` (C3 half)
- M2: 9 — single delegated listener, `closest()` early exit, `₱XX.XX` correct; but reads `dataset.price` instead of `dataset.amount` and rescues with a `textContent` digit-scrape fallback; `else` treats any non-clear action as add (C3 half)
- M3: 9 — trim, both errors, reset all correct; card uses `.resident-card` but `h3` is the resident name and paragraphs lack `<strong>Name:</strong>`/`<strong>Zone:</strong>` (C4 half)
- Submission commit: 75d6cb54 (2026-08-29T20:47:21+08:00, author J-Llama <jecressagustin321@gmail.com>)
- Late penalty: 0% → final 26/30
- Remarks: base files identical to StarterKit; no anomalies

### 02_JS_Fundamentals_Part2_Bala_oy_Giero
- Harness: m1 1/3, m2 5/5, m3 8/9 checks pass (harness v1.1.0)
- M1: 9 — labels and `dataset.status` correct, but `else` branch counts any non-`active` li as delayed, so an `idle` li inflates the delayed count (C2 half)
- M2: 10 — single delegated listener, `closest()` early exit, `Number(dataset.amount)`, clear, `₱XX.XX` all correct
- M3: 8 — trim, both errors, reset correct; card uses `.id-card` with a single `textContent` line — no `h3`, no `<strong>Name:</strong>`/`<strong>Zone:</strong>` paragraphs (C4 zero)
- Submission commit: 36f3cda3 (2026-10-09T10:24:08+08:00, author Lloyd Segundo <ikolo211@gmail.com> — **borrowed device/account**, see remarks)
- Late penalty: 34.43 days late → 61.49% + 10 pp integrity deduction (submission made via another student's account) = **71.49% total** → final 7.70/30
- Remarks: **Instructor-directed re-review.** Git evidence confirms the student used roster mate Lloyd Segundo's device/account: four commits from `ikolo211@gmail.com` on 2026-10-09 (10:08–10:43) all create **Bala_oy_Giero** folders (`00_JS_Test_Run`, `01_JS_Fundamentals_Part1`, `02_JS_Fundamentals_Part2`, `04_React_My_First_App`), and the 10:08 commit message states verbatim "borrowed Device from Segundo Kypler lloyd". Submission date taken from the Part 2 folder commit (36f3cda3); earlier "no student commits — no penalty" resolution superseded. Content is her own (differs from Segundo's own submission — not a copy). Base files identical to StarterKit.

### 02_JS_Fundamentals_Part2_Balinggan_Arjhey
- Harness: m1 3/3, m2 5/5, m3 9/9 checks pass (harness v1.1.0)
- M1: 10 — `else if (status === 'delayed')` counting, exact labels, `dataset`/`textContent`
- M2: 10 — single delegated listener, `closest()` early exit, `Number(dataset.amount)`, `₱XX.XX`
- M3: 10 — preventDefault, trim, both errors, exact card structure (`🏛` without variation selector, but heading text matches spec), reset
- Submission commit: d8a60b3e (2026-09-13T10:38:23+08:00, author Balinggan Arjhey <balingganarjhey83@gmail.com>)
- Late penalty: 8.44 days × 12.5%/7 = 15.08% → final 25.48/30
- Remarks: base files identical to StarterKit; harmless leftover TODO comments inside M2 handler

### 02_JS_Fundamentals_Part2_Bangon_Norlyn
- Harness: m1 0/4 (incl. runtime_exception), m2 5/5, m3 2/10 checks pass (harness v1.1.0)
- M1: 6 — **instructor override (reasoned partial credit)**. Handler throws on every click (`TypeError: Cannot create property 'textContent' on number`): the final two lines assign `.textContent` to the `active`/`delayed` **counter numbers** instead of the `activeStat`/`delayedStat` elements (declared, never used). Everything else is correct: right button, compute-on-click (C1 half), `getAttribute('data-status')` with explicit `else if delayed` branch (C2 full), exact strings `'Active Routes: X'`/`'Delayed/Full: Y'` constructed correctly (C3 half), no hardcode, TODO implemented (C4 half) = 1+2+1.5+1.5 = 6. Strict anchor would be 0 (inert handler)
- M2: 10 — `getAttribute`, `Number`, `closest()` early exit, single listener, `₱XX.XX` all correct
- M3: 2 — only `preventDefault` works; `nameInput.ariaValueMax.trim()` throws (`ariaValueMax` is null) so no errors are ever displayed, no card is ever rendered (valid branch also references undeclared `name`/`purok` and never appends the card), no reset
- Submission commit: 1b673c9f (2026-09-12T13:17:27+08:00, author BangonNorlyn <2025-1-0538.bangon@kcp.edu.ph>)
- Late penalty: 7.55 days → 13.49% → final 15.57/30 (18 × (1 − 13.49%))
- Remarks: base files identical to StarterKit; M1 write-target naming slip (two-word fix: `active`→`activeStat`, `delayed`→`delayedStat` would make M1 a 10); M3 broken at runtime on every interaction

### 02_JS_Fundamentals_Part2_Batil_Charlie
- Harness: m1 2/3, m2 5/5, m3 7/9 checks pass (harness v1.1.0)
- M1: 7 — counting correct (`else if delayed`), but writes bare numbers (`textContent = activeCount`) with no `"Active Routes:"`/`"Delayed/Full:"` labels (C3 zero)
- M2: 10 — single delegated listener, `closest()` early exit, `parseFloat(dataset.amount)` (not a deviation), `₱XX.XX`
- M3: 8 — trim correct, but early `return` after the name error hides the purok error when both fields are invalid (C3 half); card has `.resident-card` but uses `div.card-header` instead of `h3` and `card-field` spans instead of `<strong>Name:</strong>`/`<strong>Zone:</strong>` paragraphs (C4 half)
- Submission commit: 9235f5aa (2026-09-19T16:58:40+08:00, author Charlie <batilcharlie@gmail.com>)
- Late penalty: 14.71 days → 26.26% → final 18.44/30
- Remarks: base files identical to StarterKit

### 02_JS_Fundamentals_Part2_Caligtan_Emmanuel
- Harness: m1 3/3, m2 5/5, m3 9/9 checks pass (harness v1.1.0)
- M1: 10 — all checkpoints full; exact labels, dynamic `dataset.status` counting
- M2: 10 — single delegated listener, `closest()` early exit, `Number(dataset.amount)`, `₱XX.XX`
- M3: 10 — preventDefault, trim, both errors, exact card structure, reset
- Submission commit: e5196b40 (2026-09-16T20:25:40+08:00, author caligtan <2025-1-0410.caligtan.kcp.edu.ph>)
- Late penalty: 11.85 days → 21.16% → final 23.65/30
- Remarks: base files identical to StarterKit; all three module files are byte-identical to Laoeng_Vera's submission — flagging possible shared solution for instructor awareness (not reflected in score)

### 02_JS_Fundamentals_Part2_Cayetano_Keneth
- Harness: m1 3/3, m2 5/5, m3 9/9 checks pass (harness v1.1.0)
- M1: 10 — all checkpoints full; exact labels, `dataset.status` counting
- M2: 10 — single delegated listener, `closest()` early exit, `Number(dataset.amount)`, `₱XX.XX`
- M3: 10 — preventDefault, trim, both errors, exact card structure (built via DOM APIs), reset
- Submission commit: 53eb4222 (2026-10-05T15:35:57+04:00, author Keneth Cayetano <2024-1-0145.cayetano@kcp.edu.ph>; `--follow` fallback used — folder path history was rewritten by instructor maintenance commits)
- Late penalty: 30.82 days → 55.03% → final 13.49/30
- Remarks: base files identical to StarterKit

### 02_JS_Fundamentals_Part2_Corton_Jimrey
- Harness: m1 2/3, m2 3/5, m3 8/9 checks pass (harness v1.1.0)
- M1: 7 — counting correct, but bare numbers written with no labels (C3 zero)
- M2: 6 — single listener and `closest()` correct, clear works, but add reads `Number(btn.dataset.price)` (nonexistent key) → `₱NaN` after every add (C3 zero, C5 half)
- M3: 8 — trim, both errors, reset correct; card is a plain `<div>` with text only — no class, no `h3`, no `<strong>` paragraphs (C4 zero)
- Submission commit: 07908050 (2026-10-07T07:34:17+08:00, author Corton_Jimrey <2025-1-0319.corton@kcp.edu.ph>)
- Late penalty: 32.32 days → 57.71% → final 8.88/30
- Remarks: base files identical to StarterKit

### 02_JS_Fundamentals_Part2_Denis_Carrie
- Harness: m1 3/3, m2 5/5, m3 9/9 checks pass (harness v1.1.0)
- M1: 10 — all checkpoints full; exact labels, `dataset.status` counting
- M2: 10 — single delegated listener, `closest()` early exit, `Number(dataset.amount)`, `₱XX.XX`
- M3: 10 — preventDefault, trim, both errors, exact card structure (DOM-built, XSS-safe), reset
- Submission commit: 0f7fa1fc (2026-10-05T16:31:29+08:00, author Denis Carrie <deniscarrie4@gmail.com>; `--follow` fallback used)
- Late penalty: 30.69 days → 54.8% → final 13.56/30
- Remarks: base files identical to StarterKit; `--follow` rename chain also crosses a Mark Neil Diwan commit — Denis's own later commit used for the date

### 02_JS_Fundamentals_Part2_Diaz_Mark_Angelo
- Harness: m1 2/3, m2 3/5, m3 8/9 checks pass (harness v1.1.0)
- M1: 7 — counting correct, but bare numbers written with no labels (C3 zero)
- M2: 6 — single listener and `closest()` correct, clear works, but add reads `parseFloat(btn.dataset.price) || 0` → total never increases (C3 zero, C5 half)
- M3: 9 — trim, both errors, reset correct; card uses `.resident-card` but `h3` is the name and paragraph is `Purok:` without `<strong>Name:</strong>`/`<strong>Zone:</strong>` (C4 half)
- Submission commit: ff66626c (2026-08-30T13:05:47+08:00, author Diaz Mark <2025-1-0040.diaz@gmail.com>)
- Late penalty: 0% → final 22/30
- Remarks: base files identical to StarterKit; school email appears mistyped (`2025-1-0040.diaz@gmail.com`)

### 02_JS_Fundamentals_Part2_Diwan_Mark_Neil
- Harness: m1 3/3, m2 5/5, m3 9/9 checks pass (harness v1.1.0)
- M1: 10 — all checkpoints full; exact labels, `dataset.status` counting
- M2: 10 — single delegated listener, `closest()` early exit, `Number(dataset.amount)`, `₱XX.XX`
- M3: 10 — preventDefault, trim, both errors, exact card structure (DOM-built, XSS-safe), reset
- Submission commit: 69731876 (2026-10-03T07:41:37-07:00 = 2026-10-03T22:41:37+08:00, author Mark Neil Diwan <markneildiwan43@gmail.com>)
- Late penalty: 28.95 days → 51.69% → final 14.49/30
- Remarks: base files identical to StarterKit; committed from a -07:00 timezone

### 02_JS_Fundamentals_Part2_Dumalti_Khivieron
- Harness: m1 3/3, m2 5/5, m3 7/9 checks pass (harness v1.1.0)
- M1: 10 — all checkpoints full; exact labels, `dataset.status` counting
- M2: 10 — single delegated listener, `closest()` early exit, `Number(dataset.amount)`, `₱XX.XX`
- M3: 8 — trim present but length check is `<= 5` (off-by-one: rejects valid 5-char names such as "Maria") (C2 half); card inner markup matches spec (h3 heading, `<strong>Name:</strong>`/`<strong>Zone:</strong>`) but class is `"Resident Card"` (space) instead of `resident-card` (C4 half)
- Submission commit: ec9fbedf (2026-09-12T13:08:06+08:00, author Dumalti_K <2025-1-0901.dumalti@kcp.edu.ph>)
- Late penalty: 7.55 days → 13.48% → final 24.23/30
- Remarks: base files identical to StarterKit

### 02_JS_Fundamentals_Part2_Laoeng_Vera
- Harness: m1 3/3, m2 5/5, m3 9/9 checks pass (harness v1.1.0)
- M1: 10 — all checkpoints full; exact labels, `dataset.status` counting
- M2: 10 — single delegated listener, `closest()` early exit, `Number(dataset.amount)`, `₱XX.XX`
- M3: 10 — preventDefault, trim, both errors, exact card structure, reset
- Submission commit: 14b4b7cb (2026-09-08T22:06:13+08:00, author Vera Faith Laoeng <leonegreek@gmail.com>)
- Late penalty: 3.92 days → 7% → final 27.9/30
- Remarks: base files identical to StarterKit; all three module files are byte-identical to Caligtan_Emmanuel's submission — flagging possible shared solution for instructor awareness (not reflected in score)

### 02_JS_Fundamentals_Part2_Lindawan_Cristy
- Harness: official harness m1 0/1, m2 0/1, m3 0/1 — all three modules fail the export check: `expected export init* not found; exports: ` (zero exports); instructor-approved bypass test (import + dispatch, same scenarios) verified all behavioral checks pass (harness v1.1.0)
- M1: 9 — all behavioral checkpoints full (verified: click-only updates, `dataset.status` counting with explicit delayed branch, exact labels `Active Routes: X`/`Delayed/Full: Y`, dynamic 3/2 with `idle` ignored, repeat-click stable, zero exceptions); −1 for missing named export (required StarterKit interface)
- M2: 9 — all behavioral checkpoints full (verified: single delegated listener, `closest()` early exit, `Number(dataset.amount)`, clear, ₱0.00→20→55→75→clear, non-button safe); −1 for missing named export
- M3: 9 — all behavioral checkpoints full (verified: preventDefault, trim (`"  Ana  "` rejected), Mari/Maria boundary, both errors on empty submit, errors cleared on valid, exact card structure `.resident-card`/`h3` "🏛️ Barangay Resident Card"/`<strong>Name:</strong>`/`<strong>Zone:</strong>`, reset, 1 card after mixed submits); −1 for missing named export
- Submission commit: 16e32c73 (2026-09-10T11:42:41+08:00, author cristy <2025-1-0396.lindawan@kcp.edu.ph; `--follow` fallback used)
- Late penalty: 5.49 days → 9.8% → final 24.35/30 (27 × (1 − 9.8%))
- Remarks: **Instructor-directed override (re-review of forced regrade).** Strict rubric anchor "expected export missing = 0" waived by instructor; behavioral score of 30 verified via bypass harness test, minus 3 points (1 per module) for the three missing `init*` exports — the kept-from-StarterKit `src/main.js` crashes importing her modules, so the canonical wiring is broken. `index.js` is a working 3-line side-effect entry loaded by her rewritten base `index.html` (own layout, does not use `/src/main.js`), making her own app self-consistent in a browser; base-file rewrite noted, not separately penalized. Suggest offering a resubmit that adds the three `export function init*(){…}` wrappers (one line per file) for full interface credit.

### 02_JS_Fundamentals_Part2_Liwanag_Denie
- Harness: m1 2/3, m2 3/5, m3 4/9 checks pass (harness v1.1.0)
- M1: 7 — counting correct, but bare numbers written with no labels (C3 zero)
- M2: 6 — single listener and `closest()` correct, clear works, but add reads `parseFloat(btn.dataset.price) || 0` → total never increases (C3 zero, C5 half)
- M3: 5 — preventDefault correct; error spans only toggle `style.display` and never receive any message text, so no error is ever displayed in `#err-name` or `#err-purok` (C2/C3 zero); card has `.resident-card` but `h3` is the name, paragraph is `<strong>Purok:</strong>` (no `Name:`/`Zone:` pair) plus an extra ID line (C4 half); reset and no-card-on-invalid correct (C5 full)
- Submission commit: 162954e0 (2026-10-03T18:25:57+08:00, author Denie Kirstine T. Liwanag <denieliwanag17@gmail.com>)
- Late penalty: 28.77 days → 51.37% → final 8.75/30
- Remarks: base files identical to StarterKit

### 02_JS_Fundamentals_Part2_Maging_Geovannie
- Harness: m1 2/3, m2 3/5, m3 8/9 checks pass (harness v1.1.0)
- M1: 7 — counting correct (`getAttribute`), but bare numbers written with no labels (C3 zero)
- M2: 6 — single listener and `closest()` correct, `switch` on action is fine, clear works, but add does `parseFloat(btn.dataset.price)` → `₱NaN` after every add (C3 zero, C5 half)
- M3: 8 — trim, both errors, manual input reset all correct; card uses `.id-card` with `h3` = name and `Purok:` paragraph — wrong class and wrong structure (C4 zero)
- Submission commit: 7f897955 (2026-09-04T14:25:27+08:00, author geovannie <2025-1-0058.maging@kcp.edu.ph>)
- Late penalty: 0% → final 21/30
- Remarks: base files identical to StarterKit

### 02_JS_Fundamentals_Part2_Ngalob_AdrianLee
- Harness: m1 0/3, m2 5/5, m3 8/9 checks pass (harness v1.1.0)
- M1: 8 — listener and `getAttribute` correct; `else` branch counts any non-`active` li as delayed (C2 half); label says `"Delayed Routes:"` instead of `"Delayed/Full:"` (C3 half); writes inside the loop but final values are correct
- M2: 10 — single delegated listener, `closest()` early exit, `Number(dataset.amount)`, `₱XX.XX`
- M3: 9 — trim, both errors, reset correct; card has `.resident-card` and correct Name/Zone strong paragraphs, but heading is `"Barangay Clearance ID"` instead of `"Barangay Resident Card"` (C4 half)
- Submission commit: e3c741c2 (2026-09-11T17:11:18+08:00, author Adrian <adrianleengalob30@gmail.com>)
- Late penalty: 6.72 days → 11.99% → final 23.76/30
- Remarks: base files identical to StarterKit

### 02_JS_Fundamentals_Part2_Segundo_Kypler_Lloyd
- Harness: m1 2/3, m2 3/5, m3 8/9 checks pass (harness v1.1.0)
- M1: 7 — counting correct, but bare numbers written with no labels (C3 zero)
- M2: 6 — single listener and `closest()` correct, clear works, but add reads `Number(btn.dataset.price) || 0` → total never increases (C3 zero, C5 half)
- M3: 8 — trim, both errors, reset correct; card uses `.id-card` with plain name/purok paragraphs — no `h3`, no `<strong>Name:</strong>`/`<strong>Zone:</strong>` (C4 zero)
- Submission commit: e72692a8 (2026-09-11T13:55:28+08:00, author Lloyd Segundo <ikolo211@gmail.com>)
- Late penalty: 6.58 days → 11.75% → final 18.53/30
- Remarks: base files identical to StarterKit; same author also created the `02_JS_Fundamentals_Part2_Bala_oy_Giero` folder (see that student's remarks)

### 02_JS_Fundamentals_Part2_Soliman_Chenzen
- Harness: m1 3/3, m2 5/5, m3 9/9 checks pass (harness v1.1.0)
- M1: 10 — all checkpoints full; exact labels, `dataset.status` counting
- M2: 10 — single delegated listener, `closest()` early exit, `Number(dataset.amount)`, `₱XX.XX`
- M3: 10 — preventDefault, trim, both errors, exact card structure (DOM-built, XSS-safe), reset
- Submission commit: b621cd68 (2026-09-15T19:27:07+08:00, author solimanchenzen <chenzensoliman019@gmail.com>)
- Late penalty: 10.81 days → 19.3% → final 24.21/30
- Remarks: base files identical to StarterKit

### 02_JS_Fundamentals_Part2_Tudlong_Cymar
- Harness: m1 2/3, m2 3/5, m3 8/9 checks pass (harness v1.1.0)
- M1: 7 — counting correct, but bare numbers written with no labels (C3 zero)
- M2: 6 — single listener and `closest()` correct, clear works, but add reads `Number(btn.dataset.price)`; the `Number.isFinite` guard then early-returns, so the total never increases (C3 zero, C5 half)
- M3: 8 — trim, both errors, reset correct; card uses `.id-card` with `h3` = name and `Purok:` paragraph (C4 zero)
- Submission commit: b674234f (2026-10-04T10:48:50+08:00, author Cymar <cymartudlong@gmail.com>)
- Late penalty: 29.45 days → 52.59% → final 9.96/30
- Remarks: base files identical to StarterKit
