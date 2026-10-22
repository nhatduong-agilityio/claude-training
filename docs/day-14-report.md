# Day 14 Report

- **Date:** 2026-10-22
- **Author:** Nhat Duong, working with Claude Code (Claude Opus 5.5)
- **Repo:** `nhatduong-agilityio/deep-agents` (GitHub, public; local clone `generative-ai/`)
- **Topic:** Test and harden: a QA regression suite in CI, `/loop` on the build, `/code-review`, client release notes
- **Plan:** `plans/20261022-day-14-test-harden/plan.md`

Day 14 added test CI to deep-agents in one PR, [#19](https://github.com/nhatduong-agilityio/deep-agents/pull/19), with
two jobs:

- **`gate`:** the offline checks: typecheck, lint, format, unit tests and the web build.
- **`regression`:** a new Playwright suite in Chromium and Firefox that covers the Day 13 chat UI.

The suite mocks the LangGraph API, so it needs no backend and no secrets. `/loop` watched the CI run. `/code-review`
found 3 issues, including one real app bug, and all 3 were fixed. A client-facing release notes doc covers the chat
UI changes.

---

## Summary

### What was built

| Item | Where | Result |
| --- | --- | --- |
| CI workflow (`gate` + `regression`) | [#19](https://github.com/nhatduong-agilityio/deep-agents/pull/19), merged as `6453964` | First PR run green; push run on `main` [39738212354](https://github.com/nhatduong-agilityio/deep-agents/actions/runs/39738212354) green |
| QA regression suite | `apps/web/regression/`, 11 tests × 2 browsers | 22/22; 66/66 with `--repeat-each 3` |
| `/code-review` fixes | #19 | 3 low findings fixed, one of them an app bug |
| Release notes | [Policy Analyst Chat — Release Notes, October 2026](https://claude.ai/artifact/AbsFgR2BLvYim99jDphEjb) | 4 changes in client language, each traced to a PR or MR |

### Skills of the day

- **`/loop`:**
  - It ran self-paced, with a Monitor on `gh pr checks 19` as the wake signal and a fallback wakeup.
  - It stopped as soon as both jobs passed on the first run: `gate` 40 s, `regression` 75 s.
  - Later the same Monitor pattern caught a `claude-review` failure. It wasn't a code problem: installing Claude Code
    hit HTTP 429. A re-run of that job passed.
- **`/code-review` and ultrareview:** `/code-review` ran twice, on PR #19 and on the Day 13 web changes
  (`0e3e68a..2a54fae`, `apps/web/src`). Ultrareview was skipped: nothing since Day 13 touched auth or data. The
  shared `AUTH_TOKEN` lives in `apps/web/vite.config.ts`, and no commit after `c42c2db` changed it, `packages/` or
  `scripts/`.
- **Release notes from merged PRs:** the sources were 3 merged GitHub PRs and 2 GitLab MRs, read from `gh` and from
  the merge commits, because the GitLab MCP was down. The draft was written straight into a Claude Docs document.

### Takeaways

- **A suite that has never been red proves nothing.** Two checks made it red:
  - **Mutation checks:** each test was run against the code before its change. On the first try, 2 of the 7 input
    tests still passed against the old code, so they were strengthened.
  - **A deliberately broken commit:** `433da2a` set the input limit to 5 lines. Both CI jobs failed, then the revert
    turned them green.
- **The review found the bug the Day 13 checks missed.** The input's height reset clamped the log's scroll position,
  so a log scrolled up 30 px jumped to 72 px in Firefox. No Day 13 check covered that case, and Chromium passes it,
  so a Chromium-only test would have missed it. Running the suite in a second browser made the bug reproducible.

---

## 1. The CI suite

| Job | Steps | Time (first run) |
| --- | --- | --- |
| `gate` | `pnpm install --frozen-lockfile`, `typecheck`, `lint`, `eslint apps/web/src apps/web/regression`, `format:check`, `pnpm test` (root 115 + web 110), `pnpm --filter web build` | 40 s |
| `regression` | install Chromium + Firefox, `pnpm --filter web test:regression` (Vite on :5174, `VITE_API_URL=http://localhost:2024`, API mocked) | 75 s |

How the mock works: on a reload with a stored thread ID, the app reads `GET /threads/<id>/state` and
`POST /threads/<id>/history`. Mocking those two calls (with CORS headers) restores a thread with an AI message. The
endpoints came from the Day 13 server log, and a spike checked them before any test was written.

| Run | Commit | Result |
| --- | --- | --- |
| [39736139751](https://github.com/nhatduong-agilityio/deep-agents/actions/runs/39736139751) | `100e1b2` | green (first run) |
| [39736447164](https://github.com/nhatduong-agilityio/deep-agents/actions/runs/39736447164) | `433da2a` (5-line cap, on purpose) | **red**: unit AC2 in `gate`; E1-02 AC2 and the #14 width test in `regression` (both browsers) |
| [39736911969](https://github.com/nhatduong-agilityio/deep-agents/actions/runs/39736911969) | `02a6339` (revert) | green |
| [39738212354](https://github.com/nhatduong-agilityio/deep-agents/actions/runs/39738212354) | `6453964` (merge, push to `main`) | green |

## 2. QA regression checklist

The full table is in `apps/web/regression/README.md`. Each test was run against the code before its change:

| Code | Result |
| --- | --- |
| `0e3e68a` (before E1-02) | All 7 input tests fail |
| `1e89c68` (before #14) | Only the 2 #14 tests fail |
| `a4618da` `App.tsx` (before E1-03) | The E1-03 AC1 test fails |

Not covered in the browser suite: the reset after a real send, which needs a mocked streaming run. A unit test covers
it.

## 3. `/code-review` findings

| # | Review | Finding | Severity | Result |
| --- | --- | --- | --- | --- |
| 1 | PR #19 | The `e2e` script (`playwright test`, no config) scanned all of `apps/web`, now including `regression/` | Low | Fixed: `playwright test e2e/` (3 tests) |
| 2 | PR #19 | The README said the AC3 test covers the reset "after a send"; it only clears the box | Low | Fixed: row corrected, unit test named |
| 3 | Day 13 range | The input's `height = 'auto'` reset clamps the log's `scrollTop` and never restores it | Low | Fixed: red test `1d2490e` (Firefox 30 → 72 px), fix `83873b5` |

## 4. Release notes

[Policy Analyst Chat — Release Notes, October 2026](https://claude.ai/artifact/AbsFgR2BLvYim99jDphEjb)

- **Content:**
  - What's new: Shift+Enter for a new line, your line breaks kept, a growing message box, and line breaks in
    answers.
  - The browsers tested.
  - One known limitation: the scroll gap while a new answer is still arriving.
  - A Sources table: GitHub #17, #11, #10 and GitLab !157, !155.
- **Correction while drafting:** a line claimed the checks "now run automatically" before #19 was merged. It was
  reworded, then set back to "now run on every change" after the merge.

## 5. Artifact log: Claude-assisted, human-edited?

| Artifact | Claude's part | My part | Human-edited? |
| --- | --- | --- | --- |
| Day 14 plan | Scouted and wrote it | Answered 3 questions (CI scope, review scope, notes range); approved it | Decisions only — **not met** |
| Regression suite + CI workflow | Wrote them, ran the mutation checks and the red proof | Chose one oversized PR; reviewed and asked for the merge | Decisions and review — **not met** |
| `/code-review` fixes | Fixed all 3 findings test-first | None | **Not met** |
| PR #19 description | Wrote it | None | **Not met** |
| Release notes | Drafted all of it; updated the CI sentence after the merge | Reviewed and approved it as written, with no changes (doc revision 7 is Claude's last write) | Approved, not edited — **not met** |
| This report | Wrote it | Reviewed and approved it as written, with no changes | Approved, not edited — **not met** |

## Open items

- The "human-edited" rule is not met for any Day 14 artifact: everything was approved as written (section 5).
- The GitLab sync of #18 and #19 is left for the next routine sync.
- Known gap, unchanged from Day 13: the log can stop short of the bottom if the input grows while a new answer is
  still scrolling in.
