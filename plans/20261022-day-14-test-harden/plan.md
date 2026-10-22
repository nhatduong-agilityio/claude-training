# Day 14: Test and harden
Status: done · Source: Claude Code course, Developer track, Day 14 "Test and harden" (pasted by the user, 2026-10-22) + user answers 2026-10-22

## Goal
Every PR into deep-agents `main` gets an automated CI suite: the offline gate plus a Playwright regression suite for the
Day 13 chat UI behaviour, in Chromium and Firefox, with no API keys. `/loop` watches the CI run on the PR that adds it.
`/code-review` reviews that PR and the Day 13 web changes, and its findings are fixed. A client-facing release notes
artifact describes the chat UI changes. The Day 14 report in `claude-training` records all of it.

## Definition of done (from the Day 14 brief)
| Brief line | Phase | Evidence |
| --- | --- | --- |
| QA regression + automated suite in CI | 1–3 | A workflow run on the PR that is green; a regression spec mapped to the Day 13 ACs; a deliberately broken commit turns it red |
| `/loop` babysits the build | 3 | The `/loop` session's checks on the PR's CI run, until it is green, and what it did on red |
| Devs run `/code-review` (ultrareview if auth/data touched) | 4 | `/code-review` output for the CI PR and for the Day 13 web range; findings fixed or recorded. Ultrareview skipped with the reason |
| BA drafts a client-facing release notes artifact | 5 | A published artifact link; every item traced to a merged PR or MR |
| Every claim backed | 6 | `docs/day-14-report.md`, merged via PR |

## Decisions
User, 2026-10-22:
- **CI scope:** an offline gate plus a Playwright UI regression suite (Chromium and Firefox). No API keys in CI.
- **Review:** `/code-review` only. Nothing merged since Day 13 touched auth or data: auth is the shared `AUTH_TOKEN`
  injected by `apps/web/vite.config.ts`, and no commit after `c42c2db` changed it, `packages/` or `scripts/`. So
  ultrareview is skipped, and the report records why.
- **Release notes:** chat UI changes only:
  - Shift+Enter adds a new line (GitLab !155);
  - line breaks show in your messages (!157);
  - the input grows as you type (#11, #17);
  - line breaks show in AI replies (#10).

  Internal tooling, CI and docs PRs are left out.

Defaults (change before approving if needed):
- PRs go to GitHub `main`, as on Day 13. The GitLab sync is the next routine sync, not part of today.
- The plan lives in `claude-training`, like earlier days. The code goes in deep-agents on one branch, `ci/web-regression-suite`.

## Context found
- `generative-ai/.github/workflows/`: only `claude-code-review.yml` and `claude.yml`. **No test CI.**
- Locally on `main` (`2a54fae`), 2026-10-22, all exit 0:
  - `pnpm typecheck`, `pnpm lint`, `pnpm exec eslint apps/web/src`, `pnpm format:check`;
  - `pnpm --filter web build` (`apps/web/dist` deleted afterwards);
  - `pnpm test`: root 115/115, web 110/110.
- `package.json:5`: `packageManager: pnpm@11.22.0`. Node is v24.14.0 locally. CLAUDE.md says `pnpm test` is offline
  and needs no keys.
- `apps/web/e2e/chat.spec.ts` needs `pnpm dev:server` and a real LLM, and there is no `playwright.config`. It stays
  out of CI. The regression suite gets its own folder and config so `pnpm --filter web e2e` keeps working as before.
- `apps/web/vite.config.ts` vitest `exclude: ['e2e/**', 'node_modules/**']`. A new `regression/` folder must be
  excluded too, or vitest would try to run the Playwright specs.
- Thread restore (Day 13 server log): after a reload with a `sessionStorage` thread ID, the app calls
  `GET /threads/<id>/state`, `POST /threads/<id>/history` and `POST /threads/<id>/stream/events`
  (`App.tsx:35-43, 66-94`). Mocking these with `page.route` should render an AI message with no backend. **This is
  not tested yet, so it is the riskiest step and goes in Phase 1.**
- Day 13 measurements to turn into assertions:
  - Chromium and Firefox give 50 / 98 / 170 px at 1 / 3 / 6 lines and 171 px with scrolling at 8.
  - `resize: none`.
  - A 40-word line is 98 px at 1280 px and 146 px at 500 px.
  - The assertions use line counts and relations, not exact pixels, so they don't break on font differences.
- Playwright browsers: `@playwright/test` 1.64.0 in `apps/web`. CI needs `playwright install --with-deps chromium
  firefox`. WebKit is left out: Playwright's WebKit crashed on macOS 26.0.1, and Safari was checked by hand.
- The `loop` skill is available in this session. `/code-review` is the built-in review skill. `/code-review ultra` is
  user-triggered and billed.

## Approach
Build the riskiest part first: prove that a mocked thread restore renders an AI bubble in Playwright. Then write the
regression spec and the CI workflow on one branch. Push it and open a PR. `/loop` watches its CI run, and one
deliberately failing commit proves the suite can go red, then is reverted. `/code-review` reviews the PR and the Day
13 web range, and the findings are fixed on the branch. The release notes artifact is drafted from the merged PRs
and MRs while CI runs.

Rejected:
- Running `chat.spec.ts` in CI: it needs LLM keys and costs money on every PR, and the user chose no keys.
- WebKit in CI: the Linux runner might work, but it was never checked against real Safari, and Safari was already
  checked by hand on Day 13. It can be added later.
- A third session or worktree: today's work is one branch. Parallel sessions were Day 13's skill.

## Phases

### Phase 1 — Spike: mocked thread restore renders an AI bubble (riskiest)
- [x] Branch `ci/web-regression-suite` from deep-agents `main`. Add `apps/web/playwright.regression.config.ts`:
      - `testDir: 'regression'`;
      - projects `chromium` and `firefox`;
      - `webServer`: `pnpm exec vite --port 5173 --strictPort`, reusing an existing server outside CI.
- [x] `apps/web/regression/ai-line-breaks.spec.ts`: set the `sessionStorage` thread ID, `page.route` the 3 thread
      endpoints with a fixture state holding one AI message (`Line one\nLine two\nLine three`, a list, a code block),
      reload, and assert 2 `<br>` in one `<p>`, a `<ul>`, and a `<pre><code>`
- [x] Add `regression/**` to the vitest `exclude`, and a `test:regression` script in `apps/web/package.json`
- Verify:
  - `pnpm --filter web test:regression` passes in both projects.
  - Swapping in the pre-E1-03 `App.tsx` (`git show a4618da:apps/web/src/App.tsx`) makes the `<br>` assertion fail;
    restore it with `git stash` or a copy, **not** `git checkout --`, which wiped uncommitted work on Day 13.
  - If the mock can't render a bubble after about 1 hour: fall back, keep the AI line-break regression in vitest
    (`AiMarkdownLineBreaks.test.tsx`), and record why.

### Phase 2 — Input regression spec (QA, Claude-assisted)
- [x] `apps/web/regression/input-auto-grow.spec.ts`, one test per Day 13 AC:
      - **E1-02 AC1:** the box grows from 1 to 3 to 6 lines;
      - **E1-02 AC2:** at 8 lines the height equals the 6-line height and `scrollHeight > clientHeight`;
      - **E1-02 AC3:** clearing resets it to 1 row;
      - **E1-02 AC4:** deleting lines shrinks it;
      - **E1-02 AC5:** computed `resize: none`;
      - **#14:** a long line grows when the viewport narrows to 500 px and shrinks back, with 0
        "ResizeObserver loop" errors from `page.on('pageerror')`;
      - **#14 pin:** with the log filled and pinned, two quick newlines keep the gap at 0.
- [x] A `regression/README.md` table: AC → spec → test name (the QA regression checklist)
- Verify:
  - `pnpm --filter web test:regression` passes in Chromium and Firefox.
  - With `App.tsx` and `theme.css` from `0e3e68a` swapped in (restored as above), the AC1–AC5 tests fail.

### Phase 3 — CI workflow + `/loop` babysit
- [x] `.github/workflows/ci.yml`, on `pull_request` and `push` to `main`, `ubuntu-latest`, Node 24,
      `pnpm/action-setup` (version from `packageManager`), `pnpm install --frozen-lockfile`. Two jobs:
      - **gate:** `pnpm typecheck`, `pnpm lint`, `pnpm exec eslint apps/web/src`, `pnpm format:check`, `pnpm test`,
        `pnpm --filter web build`;
      - **regression:** `pnpm --filter web exec playwright install --with-deps chromium firefox`, then
        `pnpm --filter web test:regression`. On failure, upload `playwright-report`.
- [x] Commit, **ask before the push**, push, and open the PR into `main`. Build the PR report artifact (memory rule)
- [x] `/loop` (Skill `loop`, self-paced): poll `gh pr checks <PR>`. On red, read the failing job's log
      (`gh run view --log-failed`), fix it, and push. Stop when everything is green
- [x] Red proof: push one commit that breaks an assertion target, for example `max-height` back to 5 lines. `/loop`
      reports the regression job red. Revert the commit, and it is green again
- Verify:
  - `gh pr checks <PR>` shows `gate` and `regression` passing on the final commit.
  - The red-proof run's URL shows `regression` failing on the deliberate commit.

### Phase 4 — `/code-review` and fixes
- [x] Run `/code-review` on the CI PR. Fix every correctness finding on the branch, with a test-first commit when it
      is a code bug, and record the rest
- [x] Run `/code-review` on the Day 13 web range: `0e3e68a..main`, `apps/web/src`. Each finding is fixed in this PR,
      if small and in scope, or filed as an issue
- [x] Record in the report: ultrareview was skipped (auth/data untouched, with the evidence command), and the
      user can run `/code-review ultra` themselves
- Verify:
  - Each finding is listed with fixed / filed (#N) / won't-fix and the reason.
  - CI is green after the fixes (`gh pr checks`).

### Phase 5 — Client-facing release notes artifact (BA, Claude-assisted)
- [x] Gather the sources:
      - GitLab MRs !155 and !157, from the merge commits in `git log` (the GitLab MCP is down);
      - GitHub PRs #10, #11 and #17 (`gh pr view`).
- [x] Draft the release notes, starting with Artifact `quickstart` (intent `document`): a title, the date, a
      "What's new" list in client language (no file names), "Fixed" items, a known limitation (the new-message
      scroll gap), and the browsers checked (Chromium, Firefox, Safari).
      - Each item traces to its PR or MR in a "Sources" section.
- [x] The user (BA) edits the draft. That edit is the human-edit evidence (not done: the user approved the draft as written on 2026-10-22, recorded as not met)
- Verify: the artifact link is published. Every item cites a merged PR or MR. A `grep` finds no file paths or
  internal IDs in the client-facing sections.

Results so far (2026-10-22):
- PR [#19](https://github.com/nhatduong-agilityio/deep-agents/pull/19). CI was green on its first run (39736139751).
- Red proof: `433da2a` failed gate and regression (39736447164); the revert `02a6339` is green (39736911969).
- `/code-review` found 3 low issues, all fixed:
  - the e2e script picked up `regression/`;
  - the README's AC3 row overstated what the test covers;
  - the log scroll jumped while typing (Firefox 30 → 72 px; red test `1d2490e`, fix `83873b5`).
- Final CI run on `83873b5` is green. `claude-review` hit HTTP 429 once and passed on a re-run.
- The release notes draft is at https://claude.ai/artifact/AbsFgR2BLvYim99jDphEjb; it is waiting for the user's edit.

### Phase 6 — Merge and Day 14 report
- [x] The user merges the CI PR. Confirm that the `push` run on `main` is green (`6453964`, run 39738212354)
- [x] `docs/day-14-report.md` in `claude-training`, on branch `docs/day-14-report`:
      - the CI suite, with the job list and the run links (green, and the red proof);
      - the regression checklist;
      - the `/loop` log;
      - the code-review findings and fixes;
      - why ultrareview was skipped;
      - the release notes link;
      - an artifact log with Claude draft → human edit, as on Day 13;
      - 2 takeaways.
- [x] Commit. Ask before the push. Open the PR with its report artifact
- Verify:
  - `grep -c "^## " docs/day-14-report.md` ≥ 5.
  - `npx markdownlint-cli2 docs/day-14-report.md` shows only MD013.
  - The PR URL is returned.

## Risks
| Risk | Signal | Mitigation |
| --- | --- | --- |
| The SDK needs more than the 3 thread endpoints, or a specific response shape | No AI bubble after the reload | Phase 1 spike first; log the requests (`page.on('request')`) and mock what's missing; fall back to vitest after about 1h |
| CI on Linux renders different pixel heights | Exact-pixel assertions fail in CI only | Assert relations (grows, equal at the cap, back to 1 row), not pixels |
| `pnpm/action-setup` or Node 24 setup doesn't match `packageManager` | Install step fails | Read the version from `packageManager`; `/loop` catches it on the first run |
| The `/loop` keeps polling after green, or polls too often | Wasted runs | Self-paced with a stop condition (all checks pass); about 2–3 min between checks |
| Restoring swapped files loses uncommitted work (it happened on Day 13) | Missing changes after a mutation check | Commit before each mutation check, and restore with `git stash`/a copy, not `git checkout --` |
| The release notes leak internal details | File paths, ticket IDs, tool names in the client text | IDs only in the "Sources" section; a grep check |
| The red-proof commit stays on the branch | Red CI at merge | The revert is part of Phase 3; Phase 6 confirms the final run is green |

## Out of scope
- Ultrareview (the user can run `/code-review ultra`; it is billed and user-triggered).
- Running the LLM e2e (`chat.spec.ts`) in CI; WebKit in CI; branch protection rules.
- The GitLab sync of today's PR; a "morning maintenance" scheduled routine (only `/loop` on the PR today).

## Notes on this plan
- Mode: standard (no flag). Scouting was done inline in this session (CI files, local checks, the thread-restore
  requests from the Day 13 server log). No external research was needed. Not red-teamed.
