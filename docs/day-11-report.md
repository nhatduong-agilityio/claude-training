# Day 11 Report

- **Date:** 2026-10-21
- **Author:** Nhat Duong, working with Claude Code (Claude Opus 5.5)
- **Repo:** `nhatduong-agilityio/claude-training` (example app `examples/feedback-board/`)
- **Topic:** role day (Web, plus Mobile and Game as far as this Mac allows) and Developer Checkpoint 3
- **Plan:** `plans/20261020-day-11-role-day-web/plan.md`

The "training web app" is `examples/feedback-board/`, a small app built for this day: plain HTML, CSS and JavaScript,
with data in `localStorage`. Before any browser test, I planted 2 bugs in it and wrote them down in a timestamped key.
The planted bugs are **simulated**. Writing the key first meant each test's findings could be scored, not just
claimed. Bias: the same model (and dev) planted and hunted the bugs, so a 2/2 score is partly expected. To limit
that, the Chrome session was told not to open anything under `examples/`, and the 8-step script was fixed before
any run.

---

## Summary

### Role-day exercise (Web, plus Mobile and Game where possible)

- **[Web]** Used Claude in Chrome to test the training web app from a session, reading console logs and filling the
  form, and used the browser pane app-preview loop.
  - **Claude in Chrome:** ran an 8-step script with a GIF (47 frames) and read the console after every step. The
    extension runs in the dev's **Brave** browser and pairs with the Claude Desktop app. From the CLI the connection
    was flaky (a browser was connected in only 1 of 9 checks), so both runs were done from the Desktop app's Code tab.
  - **Claude in Chrome, after the fix:** the same 8 steps passed with no app errors (second GIF, 46 frames).
  - **Browser pane:** showed the app before the fix. After the fix it was reloaded to check that a whitespace-only
    message is rejected and that deleting the last card brings back "No messages yet" with no error.
  - **Playwright:** ran the same 8 steps as a comparison.
- **[Mobile]**
  - **iOS Simulator pane loop:** **not possible on this Mac**. Only the Command Line Tools are installed, not Xcode,
    and `xcrun simctl` is missing.
  - **Android emulator:** booted (`Medium_Phone_API_36.1`) and opened the app at `http://10.0.2.2:8011`. It was
    driven over **adb**, not computer use: a message was sent, and the delete bug reproduced on mobile.
  - **Computer use on the emulator:** **not possible**. The emulator window belongs to a bare `qemu-system-aarch64`
    binary with no bundle ID, and computer use grants access only per app bundle. Computer use itself does work
    here: a demo in Preview read the before and after screenshots.
- **[Game]** No game engine editor is installed, so computer use against an editor couldn't run. The build-report
  half: the Day 11 PR's report artifact (linked in the PR body).

### Result

- **Verified:**
  - All 8 steps (validation, multi-line Shift+Enter, filter, reload, delete) in **Claude in Chrome** and
    **Playwright**, before and after the fix.
  - **Browser pane:** load, then after the fix: whitespace rejected, one valid send, delete the last card.
  - **Android (adb):** load, one send, delete the last card, before the fix only.
- **Bugs found:** both planted bugs, by both browser tools.
  - **K1:** a whitespace-only message was accepted and saved as an empty card.
  - **K2:** deleting the last card threw `TypeError: Cannot read properties of undefined (reading 'name')`, and the
    counter got stuck at "1 message".
- **Extra findings:**
  - Playwright found a real, cosmetic `favicon.ico` 404, which is now fixed.
  - Claude in Chrome reported one false positive: "no warning logged at step 3". The app does log that warning
    (Playwright captured it). A React DevTools extension in the dev's browser wraps `console.warn`, and the reader
    missed it.
- **After the fix:** full re-runs in Playwright and Claude in Chrome passed all 8 steps with no app errors, and the
  browser pane confirmed both fixes. The Chrome re-run had only one card at steps 6 and 8, so "filter hides other
  cards" and "delete one of several" were checked by Playwright only.

### Developer Checkpoint 3: completed

- **One skill + one hook merged:**
  - Skill: [deep-agents PR #1](https://github.com/nhatduong-agilityio/deep-agents/pull/1) (`release-checklist`),
    plus `review-checklist` in [PR #7](https://github.com/nhatduong-agilityio/deep-agents/pull/7).
  - Hook: [PR #6](https://github.com/nhatduong-agilityio/deep-agents/pull/6) (`block-forbidden-command`).
- **One MCP tool used end to end (Day 08):** the GitHub MCP read deep-agents PR #1 and posted a review comment that
  found a real date bug in `/standup`, fixed before the merge. The Playwright MCP drove the chat app and confirmed the
  Shift+Enter line-break fix.
- **One /code-review or ultrareview report acted on:**
  [deep-agents PR #7](https://github.com/nhatduong-agilityio/deep-agents/pull/7), merged as `0e3e68a`. Of 16 review
  items, 15 were fixed and 1 is won't-fix (`docs/day-10-report.md`).
- **Role-day exercise done:** section 3 (Web), section 6 (Mobile and Game).

### Takeaways

- Driving the running app from a session verifies the actual product, not just the code.
  - `node --check` passed on code with both bugs. Only the browser showed the empty card and the crash on the last
    delete.
- Screenshots and console logs from the session make bug reports easier to reproduce.
  - The Chrome run's GIF and its stack trace (`render` at `app.js:80`) pointed straight at the line to fix.
  - The console also produced the one false positive, so console evidence still needs checking.

---

## 1. The app

`examples/feedback-board/`: a form (name, email, multi-line message; Enter sends, Shift+Enter adds a line), a filter
box, cards with Delete, a counter and a "Latest from" line. Data lives in `localStorage`; the app logs `console.info`
on save and delete and `console.warn` on invalid input, so a browser test has console signals to read. Run:
`python3 -m http.server 8011 -d examples/feedback-board`.

## 2. Preconditions

| Check | Result |
| --- | --- |
| Claude in Chrome | Extension v1.0.101 found in Chrome (Profile 1); the test itself ran in Brave. From the CLI: tools load with `claude -p --chrome`, but a browser was connected in only 1 of 9 checks, because the extension pairs with the Claude Desktop app's native host. Reliable from the Desktop app's Code tab |
| Playwright MCP | Connected (`@playwright/mcp@0.0.83`) |
| Android emulator | AVD `Medium_Phone_API_36.1`, Chrome for Android |
| Xcode / iOS Simulator | Not installed (`xcode-select -p` → CommandLineTools; no `simctl`) |
| Computer use | Works after Accessibility and Screen Recording were granted to **VS Code**, which hosts this CLI session (`claude` ← zsh ← Code); cannot target the emulator (no bundle ID) |
| Plan type | Claude Pro, direct subscription (read 2026-10-21 from `~/.claude.json`: `organizationType: claude_pro`, `billingType: stripe_subscription`), which meets Claude in Chrome's plan requirement |

## 3. The 8-step browser test

The steps:

1. Load the page.
2. Submit empty.
3. Submit a bad email.
4. Send a multi-line message (Shift+Enter, then Enter).
5. Submit a whitespace-only message.
6. Filter.
7. Reload.
8. Delete every card.

| Step | Playwright | Claude in Chrome |
| --- | --- | --- |
| 1–4 | Pass (favicon 404 on load) | Pass |
| 5 Whitespace only | **Fail (K1)**: empty card, `Feedback saved {length: 0}` | **Fail (K1)**: empty "Blank Chrome" card, "2 messages" |
| 6–7 | Pass | Pass |
| 8 Delete the last card | **Fail (K2)**: `TypeError` at `app.js:80`, counter stuck | **Fail (K2)**: same `TypeError` with stack, empty state missing |

| Planted / extra | Playwright | Claude in Chrome |
| --- | --- | --- |
| K1, K2 | 2/2 found | 2/2 found |
| Real extra | 1 (favicon 404) | 0 |
| False positive | 0 | 1 (missed `console.warn`, captured by Playwright) |

## 4. Claude in Chrome compared with Playwright

| | Claude in Chrome | Playwright MCP |
| --- | --- | --- |
| Browser | The dev's real browser (Brave) with their extensions | Clean, isolated profile |
| Recording | GIF of the whole flow | One screenshot per step |
| Console | Exceptions with full stack, plus noise from other extensions | Page console only, plus network errors |
| Connection | Flaky from the CLI; reliable from the Desktop app | Always available |

When to use each: Playwright for repeatable checks; Claude in Chrome when the dev's real browser state matters, or
when a GIF helps explain a flow.

## 5. Fix loop (edit → reload → check)

| Bug | Fix in `app.js` / `index.html` | Check after the fix |
| --- | --- | --- |
| K1 | The message is trimmed before the "required" check | "Message is required.", nothing saved (Playwright, Chrome, pane) |
| K2 | The "Latest from" line handles an empty list | "No messages yet", empty state back, no exception (Playwright, Chrome, pane) |
| favicon 404 | `<link rel="icon" href="data:,">` | 0 console errors on load |

The browser pane was the preview step: reload, send whitespace only, delete the last card. It showed both fixes.

Code review of this PR (`devkit:code-reviewer`) then found that saved data with the wrong shape (`null`, `{}`) could
crash the page on load. `load()` now keeps only well-formed entries and warns about the rest; checked in Playwright.
Smaller review fixes: unique IDs for messages sent in the same millisecond, a "No messages match the filter." state,
and the length check now uses the trimmed text. These came after the Chrome and pane runs, so only Playwright ran against the final code.

## 6. Mobile and Game

| Item | Status | Evidence |
| --- | --- | --- |
| iOS Simulator pane loop | Not possible: no Xcode | `xcrun simctl` missing |
| Android emulator | Done over **adb** (not computer use): opened, sent a message, K2 reproduced before the fix | 3 emulator screenshots |
| Computer use on the emulator | Not possible: no bundle ID on `qemu-system-aarch64` | `lsappinfo` → `bundleID=[ NULL ]`; 7 attempts recorded |
| Computer use on this Mac | Works: Preview demo (read the before image, clicked the after image, read the fix) | `computer-use-run.md` |
| Game: computer use against an editor | Not possible: no engine editor installed | — |
| Game: artifact for build reports | The PR report artifact for this PR | PR body link |

## Open items

None. The account's plan type is confirmed (Claude Pro, section 2). iOS and the game editor stay out of scope for
this Mac: they need Xcode or a game engine installed (section 6).
