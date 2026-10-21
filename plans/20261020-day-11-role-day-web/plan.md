# Day 11: role day (Web) and Developer Checkpoint 3
Status: done · Source: Claude Code course, Developer track, Day 11 + role-extras setup notes + the Day 11 report template (pasted by the user, 2026-10-20)

## Goal
Build a small example web app inside `claude-training/`, then test it the way a user would, from a Claude Code
session with Claude in Chrome: read the console, fill the form, check what renders. Fix what the browser test finds
through an edit → reload → check loop. Record Developer Checkpoint 3 with links and publish the Day 11 report.

## Definition of done: the Day 11 report template
The report (Phase 6) fills the user's template line by line. **All three role lines are required** (user,
2026-10-21): [Web] is the main exercise; [Mobile] and [Game] are done as far as this Mac allows (Phase 5), and any
part that can't run says why, with evidence. "Developer Checkpoint 3: completed" is written only if all 4 rows have
evidence; otherwise it says "partly completed" and names the missing row.

| Template line | Filled by | Evidence |
| --- | --- | --- |
| Role-day exercise ([Web]) | Decision | Web |
| Used Claude in Chrome to test the training web app (console logs, form fill) | Phases 1–3 | "Training web app" = `examples/feedback-board/` (made for this day). GIF, screenshots, `console.txt`. If the Playwright fallback was used, the line says so |
| …and the browser pane app-preview loop | Phase 4 | Done in the Desktop app, or the line says "not done: CLI session" |
| Result: [what was verified and what bugs or gaps were found] | Phases 3–4 | The 8-step result + the scoring table (K1, K2, extras), before/after screenshots |
| One skill + one hook merged: [PR links] | Phase 6 | deep-agents PR #1 (`release-checklist`), PR #6 (`block-forbidden-command`) |
| One MCP tool used end-to-end: [what I did] | Phase 6 | Day 08: the GitHub MCP read PR #1 and posted a review comment that found the `/standup` date bug (fixed before merge); Playwright verified E1-01 |
| One /code-review or ultrareview report acted on: [PR link] | Day 10 plan, Phase 6 | deep-agents PR #7, merged `0e3e68a` |
| Role-day exercise done | Phases 3–4 | Link to the report's result section |
| 2 takeaways | Phase 6 | Each one is backed by something this day showed (e.g. a bug seen only in the console) |

## Decisions
User, 2026-10-20:
- **Target app:** a new example app in `claude-training/`, not deep-agents (`generative-ai/`).
- **Role:** Web.

Defaults in this plan (change them before approving if needed):
- **App:** a "Feedback board" in `examples/feedback-board/`, written as plain HTML, CSS and JavaScript with **no
  dependencies and no build step**. It runs with `python3 -m http.server`, which is already on this machine. Data is
  stored in `localStorage`.
- **Repo convention change:** `CLAUDE.md` says "Markdown reports only, no app code". The same commit that adds the app
  updates `CLAUDE.md`: an "Examples" line, the run command, and a note that `examples/` holds training-only apps.
- **Planted issues:** before testing, I plant 2 bugs the code looks fine for but the browser shows. Both are listed in
  a known-issues key and labelled "simulated". This lets the test's findings be scored instead of just asserted.
- **All tasks required (user, 2026-10-21)**, including Mobile and Game (Phase 5) and the browser pane loop (Phase 4).
- **Report flow (user, 2026-10-20): GitHub PR**, the same as Day 10 (`CLAUDE.md` is updated by the Day 10 reports PR).

## Context found
- `claude-training/` tracks only `CLAUDE.md`, `README.md`, `docs/*.md` and plans. No `package.json`, build or CI.
  `python3` (`/usr/bin/python3`) and `node` v24.14.0 are available.
- `plans/*/evidence/` is ignored via `.git/info/exclude`: screenshots, GIFs and console dumps go there and are never
  committed.
- Claude in Chrome setup (from the course notes):
  - Install the extension from the Chrome Web Store (Chrome or Edge, v1.0.36+).
  - Accept the "Claude wants to use your browser" prompt, or run `/chrome` to connect.
  - It needs a direct Pro, Max, Team or Enterprise plan. TODO: confirm this account's plan.
- This session has no `mcp__claude-in-chrome__*` tools yet. The `claude-in-chrome` skill is listed and must be loaded
  before using its tools. GIF recording exists only in Claude in Chrome; Playwright MCP gives screenshots only.
- Playwright MCP is installed at user scope and was used end to end on Day 08. The Day 11 skills list it for devs
  too.
- iOS Simulator pane: macOS + the Desktop app only. Computer use: `/mcp` → enable computer-use (macOS).
- Checked 2026-10-21: `xcode-select -p` → `/Library/Developer/CommandLineTools` and `xcrun simctl` is missing, so
  **no Xcode and no iOS Simulator** on this Mac. Android SDK is installed with AVD `Medium_Phone_API_36.1`
  (`emulator -list-avds`). Claude Desktop 3.1623.0 and Google Chrome are installed. No game engine editor is installed.
- Checkpoint 3 evidence that already exists:
  - Skill merged: deep-agents PR #1. Hook merged: PR #6.
  - MCP tool used end to end: `docs/day-08-report.md`.
  - Review report acted on: deep-agents PR #7, merged as `0e3e68a` (2026-10-21).

## Approach
The app is kept small, about 150 lines, so the day goes into the browser loop rather than the build. The known-issues
key is written before any browser session. Claude in Chrome then explores the app without reading the source, works
out what is broken, and reports from the console and the page. Each bug is fixed with the same loop: edit, reload,
check again. Playwright runs the same script once as a comparison.

Rejected:
- Testing deep-agents `apps/web`: the user asked for an app in claude-training. That also avoids needing API keys and
  a running LLM backend.
- A Vite or React app: it adds `node_modules` and a build to a docs repo for no gain on Day 11.
- Testing only with Playwright: the course asks for Claude in Chrome. Playwright stays a labelled fallback.

## Phases

### Phase 1 — Preconditions: Claude in Chrome connected
- [x] Dev: install the Claude in Chrome extension (v1.0.36+) in Chrome, then run `/chrome` in this session and accept
      the prompt
- [x] Load the `claude-in-chrome` skill and its tools (one `ToolSearch`). List open tabs to confirm the connection
- [x] Record the plan type (from `/status` or the account page; TODO if unknown) and the extension version
- Verify: `evidence/preconditions.md` says "connected", with a tab list excerpt. If it says "not connected" after one
  retry, **every Chrome step below runs on Playwright**, labelled "fallback: Claude in Chrome not connected", and no
  GIF is promised.

### Phase 2 — Example app and known-issues key
- [x] Write `evidence/known-issues.md` **first**, with a `date -u` timestamp. Each of the 2 planted bugs gets an id,
      the symptom a user sees, the console signal, and the file:line. Candidates:
      - (K1) a message of only spaces or newlines is accepted and shows as an empty card;
      - (K2) deleting the last card throws a `TypeError` in the console, and the counter stops updating.
- [x] Branch `docs/day-11-role-day` from `main`. Create `examples/feedback-board/`:
      - `index.html`: a form with name, email and a multi-line message; a filter box; the card list; a counter.
      - `app.js`: validation (required fields, email format, 500-character limit), Enter vs Shift+Enter in the message
        box, `localStorage` persistence, delete, and filtering. It logs `console.info` on submit and
        `console.warn` on invalid input.
      - `style.css`.
      - `README.md`: purpose, run command, "planted issues exist; see the Day 11 report".
- [x] Update `CLAUDE.md`: Commands (`python3 -m http.server 8011 -d examples/feedback-board`) and a Conventions line
      for `examples/`
- Verify:
  - `node --check examples/feedback-board/app.js` exits 0.
  - With the server running, `curl -s localhost:8011 | grep -c "<title>"` returns 1.
  - `git diff --stat main` shows only `examples/feedback-board/*` and `CLAUDE.md`.

### Phase 3 — Browser test with Claude in Chrome (Day 11 core)
- [x] Start the server in the background. In a new Chrome tab, open `http://localhost:8011`. Don't read `app.js`
      during this phase
- [x] Run a fixed script and record a GIF of it. Capture a screenshot and the console messages at each step:
      1. Load the page.
      2. Submit empty (expect inline errors and a warning).
      3. Submit a bad email.
      4. Submit a valid multi-line message (Shift+Enter): the card shows the line break.
      5. Submit whitespace only.
      6. Filter.
      7. Reload: the cards are still there.
      8. Delete every card.
- [x] List every problem found (symptom + console evidence), then score it against `known-issues.md`: found, missed,
      or extra (an extra finding is a real bug or a false positive)
- [x] Comparison: run the same 8 steps once with Playwright MCP. Note what each tool gave (GIF vs screenshots,
      console access, real sign-in session vs a clean profile, speed)
- Verify: `evidence/` holds the GIF (or "no GIF: fallback"), one screenshot per step, and `console.txt` with its
  error count stated. The scoring table covers K1, K2 and every extra finding.

### Phase 4 — Fix loop (edit → reload → check)
- [x] Fix each confirmed bug in `app.js`. After each edit, reload in Chrome and re-run only the steps that failed.
      Capture `after-K<n>.png` and a console showing 0 errors
- [x] Browser-pane app-preview loop (required): the dev opens `claude-training/` in the Desktop app's Code tab
      (installed, 3.1623.0) and runs one edit → preview → check cycle in the built-in browser pane on
      `localhost:8011`; record what the pane showed
- Verify: a full re-run of the 8-step script shows every step passing and 0 console errors (`console.txt` after the
  fix). Before and after screenshots exist for each fixed bug.

### Phase 5 — Mobile and Game extras (required)
- [x] Computer use (Mobile): the dev enables computer use (`/mcp` → computer-use, macOS). Boot the Android emulator
      (`Medium_Phone_API_36.1`), open its browser at `http://10.0.2.2:8011` (the host's localhost), send one message,
      take a screenshot, and read what renders
- [x] iOS Simulator pane loop: needs Xcode + the Desktop app; Xcode isn't installed (`xcrun simctl` missing). Record
      "not possible on this Mac" with that evidence, and the install step it would need
- [x] Game: no engine editor is installed, so computer use against an editor can't run; record why. The other half,
      "artifacts for build reports", is done: publish the Day 11 build/test report as an artifact (Phase 6 PR report)
- Verify: the Android screenshot exists and shows the sent card; each line is marked done / not possible, with the
  reason and evidence.

### Phase 6 — Checkpoint 3, Day 11 report, PR
- [x] Checkpoint 3 table with links:
      - one skill + one hook merged (deep-agents PR #1, PR #6);
      - one MCP tool used end to end (Day 08 report);
      - one review report acted on (deep-agents PR #7). Mark it TODO if the Day 10 plan isn't done yet;
      - role-day exercise (Phases 3–4).
- [x] `docs/day-11-report.md`: the header lines (`**Date:**`, `**Author:**`, Repo, Plan), then `## Summary` with the
      template's sections in order: Role-day exercise (Web), Result, Developer Checkpoint 3, Takeaways. Every
      placeholder is replaced by the value from the definition-of-done table
- [x] Below the summary, add the detail sections: preconditions, the app, the test script and scoring table, the
      Chrome vs Playwright comparison, the fix loop, what was not done (Mobile, Game, maybe the browser pane) and why
- [x] Commit (`docs: add Day 11 report and example feedback app`), **ask before push**, open the PR. Build and publish
      the PR report artifact (memory rule) with the scrubbed screenshots and link it in the body
- Verify:
  - `grep -n "\[what\|\[PR link" docs/day-11-report.md` finds no template placeholder.
  - `grep -c "^## " docs/day-11-report.md` ≥ 5.
  - Every Checkpoint row links evidence or says TODO.
  - `npx markdownlint-cli2 "docs/day-11-report.md"` shows no rule types beyond the known MD013.
  - The PR URL is returned.

## Risks
| Risk | Signal | Mitigation |
| --- | --- | --- |
| Claude in Chrome can't connect (plan type, extension version, prompt not accepted) | No tabs listed after `/chrome` | One retry, then the Playwright fallback, labelled; no GIF promised |
| Chrome acts in the dev's real profile, with their sign-ins | Other tabs or accounts visible in screenshots | Work only in a new tab on `localhost:8011`; never touch other tabs; check screenshots before they go into the report |
| The known-issues key steers the test, so it finds exactly K1 and K2 | The test reports only what the key lists | Don't read the source during Phase 3; the script is fixed in advance; extra findings are scored too; the self-planting bias is stated in the report |
| App code in a docs-only repo confuses later sessions | `CLAUDE.md` still says "no app code" | `CLAUDE.md` is updated in the same commit (Phase 2 verify) |
| Port 8011 is busy | The server fails to start | Pick the next free port and update the README and `CLAUDE.md` |

## Out of scope
- deep-agents `apps/web` testing; unit tests or a test runner for the example app.
- Installing Xcode or a game engine; the AI-native SDLC playbook course; the BA/QA track.
- Hosting the example app anywhere other than localhost.

## Notes on this plan
- This plan replaces Phases 9–10 (the Day 11 parts) of `plans/20261020-day-10-11-review-quality/plan.md`. That plan now
  covers Day 10 only.
- Scouting was done inline, and the plan was written directly, not by the planner subagent. Not red-teamed.
