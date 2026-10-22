# Day 13: Build — two tickets in parallel worktrees
Status: done · Source: Claude Code course, Developer track, Day 13 "Build" (pasted by the user, 2026-10-22) + user answers 2026-10-22

## Goal
Two deep-agents backlog tickets, **E1-02** (auto-grow the message input, GitLab #9) and **E1-03** (multi-line AI
Markdown messages), are built at the same time. Each one gets its own git worktree, its own interactive Claude Code
session that starts in plan mode, its own tests (written test-first), its own SPEC, and its own GitHub PR. The Day 13
report in `claude-training` shows the plan approvals, that the two sessions never touched each other's work, and
the human edit made to each artifact.

## Definition of done (from the Day 13 brief)
| Brief line | Phase | Evidence |
| --- | --- | --- |
| Devs implement in parallel isolated sessions | 1, 3, 4 | `git worktree list` with 2 worktrees; both sessions' work overlaps in time (commit timestamps) |
| Plan mode first: approve the plan before any code | 3, 4 | Each session's plan file and approval time, earlier than its first `test:` commit |
| PRs per ticket | 5 | 2 GitHub PR URLs on `nhatduong-agilityio/deep-agents`, each linking a PR report artifact |
| QA authors the automated suite alongside | 3, 4 | New test files per ticket, failing `test:` commit before `fix:`; Playwright check for E1-02 |
| BA updates the spec as questions resolve | 2, 3, 4 | SPEC "Open questions" tables with the BA answer and date, committed in each PR |
| Every artifact Claude-assisted and human-edited | 6 | Table: artifact → Claude draft → human edit (diff or note). An artifact with no human edit is listed as "not met" |
| Zero crosstalk | 5 | The two PRs touch no shared test file; any shared source file changes different hunks; the second PR rebases cleanly and its suite passes |

## Decisions
User, 2026-10-22:
- **Tickets:** E1-02 + E1-03 in deep-agents `apps/web`.
- **Tracker:** GitHub (the user's answer). The issues and PRs go to `nhatduong-agilityio/deep-agents`.
- **E1-02 open questions:** Claude proposes answers and the user confirms them, acting as BA (list below).
- **QA/BA:** done by the user with Claude's help, inside each ticket's worktree, not in a third session.

Decisions needed at approval:
1. **PR target is GitHub `main`, not a GitLab MR into `deep-agents`.** `generative-ai/CLAUDE.md` says app work goes to
   GitLab, but GitLab is down (MCP `ENDPOINT_NOT_FOUND`) and you chose GitHub. Base: local `main` (`0e3e68a`). It
   already contains GitLab `deep-agents` (`c42c2db` is an ancestor, 30 commits behind). The GitLab back-sync MR the
   rule asks for is a TODO, out of scope today.
2. **E1-02 BA answers** (proposed by Claude; confirmed by the user at plan approval, 2026-10-22):
   - The box grows up to **6 lines**. After that it scrolls.
   - The drag-resize corner is removed (`resize: none`); with auto-grow it isn't needed.
   - After a send, the box resets to 1 row.
   - It shrinks again when lines are deleted.
   - Cap: 6 × line height + vertical padding. It is set as a CSS `max-height`, so CSS owns the limit, not JS.

## Context found
- `generative-ai/apps/web/src/App.tsx:308-316`: `<textarea rows={1} … className="input-text">`. Its value is set by
  `setInput`, and `handleSubmit` (`:114-122`) clears it with `setInput('')`. Nothing resizes it.
- `generative-ai/apps/web/src/theme.css:819-834`: `.input-text` sets `min-height: 38px`. It has no `resize` and no
  `max-height`. The `resize: both` seen on Day 04 is the browser default.
- `generative-ai/apps/web/src/App.tsx:217`: `{isAI ? <Markdown>{content}</Markdown> : content}`, rendered with
  `react-markdown` 10.1.0 and no remark plugins. In CommonMark a single `\n` is a soft break, which shows as a space.
  So E1-03 is probably "broken" for single line breaks (not checked yet).
- `generative-ai/apps/web/src/__tests__/App.test.tsx:288-326`: the E1-01 pattern. It mocks `useStream`, renders
  `<App />`, and asserts computed style. This works because `vite.config.ts` processes `theme.css`
  (`test.css.include`). jsdom has **no layout**, so `scrollHeight` and `clientHeight` are 0 there.
- `generative-ai/docs/tasks/E1-01-human-message-line-breaks/SPEC.md`: the SPEC format, with an open-questions table
  and a BA-answer column. The template is at `docs/tasks/_TEMPLATE/SPEC.md`.
- `generative-ai/docs/BACKLOG.md:12-13`: E1-02 (M, Todo) and E1-03 (S, Todo, depends on E1-01, which is Done).
- `generative-ai/.claude/hooks/check-before-commit.sh`: before every `git commit` it runs only
  `pnpm typecheck && pnpm lint`, not the tests. So a failing `test:` commit is allowed; E1-01 did this (`d8620e7`, then
  `a04c57c`).
- `generative-ai/.gitignore` already ignores `.claude/worktrees/`. `claude --help`: `-w, --worktree [name]` creates a
  worktree for the session, and `--permission-mode` accepts `plan`.
- Worktrees don't share `node_modules` (pnpm), so each one needs `pnpm install`. `CLAUDE.local.md` and `.env` are
  untracked and won't be there. Unit tests are offline and need no `.env`.
- deep-agents rules: exact dependency pins (`npm show <pkg> version` first); test-first for fixes; never push without
  approval; every PR links a devkit PR report artifact.

## Approach
This session is the **coordinator**. It creates the issues, checks the worktrees, writes the Day 13 report, and
builds the PR report artifacts, since subagents have no Artifact tool. The user runs **two real interactive
sessions** in two terminals:
`claude -w e1-02 --permission-mode plan` and `claude -w e1-03 --permission-mode plan`.
Each session runs `/devkit:task E1-0x` in plan mode. The user reads, edits, and approves its plan before any file
changes. Each ticket's tests go in a **new test file**, so the two branches never edit the same test file.

Rejected:
- Subagents with `isolation: worktree`: they can't stop for a plan-mode approval, and the brief is about trusting
  approved plans.
- A third QA worktree: the user chose per-ticket QA. It would also add a third branch that touches both tickets' code.
- Appending tests to `App.test.tsx`: both branches would edit the same file, which means a likely conflict, and that is
  crosstalk.

## Phases

### Phase 1 — Worktrees and baseline (riskiest: proves isolation works)
- [x] User: in terminal A run `claude -w e1-02 --permission-mode plan`, and in terminal B run
      `claude -w e1-03 --permission-mode plan`, both from `generative-ai/` on `main`
- [x] In each session: `pnpm install`, then `pnpm typecheck && pnpm test`. Write down which branch and base each
      worktree got
- [x] Coordinator: `git -C generative-ai worktree list` and `git -C <wt> log -1 --format=%h` for each worktree. If a
      worktree was not made from `0e3e68a`, stop and rebase it before any ticket work
- Verify: `git worktree list` shows 3 entries (main + 2). Both worktrees are at `0e3e68a` (or have been rebased onto
  it). `pnpm typecheck && pnpm test` exits 0 in **both** worktrees.

### Phase 2 — Tickets and SPEC drafts (BA, Claude-assisted)
- [x] Coordinator, after approval (done 2026-10-22: E1-02 = deep-agents #8, E1-03 = #9; E1-02 mirrors GitLab #9; E1-03 has no GitLab issue): create 2 GitHub issues on `nhatduong-agilityio/deep-agents` with `gh issue create
      --body-file`, one per ticket. Each one links the GitLab origin (#9 for E1-02; E1-03 is backlog-only)
- [x] In each worktree's session, as the first step after its plan is approved (plan mode allows no file writes
      before that): draft `docs/tasks/E1-02-auto-grow-input/SPEC.md` and
      `docs/tasks/E1-03-ai-message-line-breaks/SPEC.md` from `_TEMPLATE`. Proposed ACs:
      - **E1-02:** the box grows from 1 row as lines are added; it stops at 6 lines and then scrolls; it resets to 1 row
        after a send; it shrinks when lines are deleted; there is no resize corner; Enter and Shift+Enter work as
        before.
      - **E1-03:** first record what happens to an AI message with a single `\n`, with `\n\n`, with a list, and with a
        code block. The ACs then follow the BA decision (Phase 4).
- [x] User (BA): edit each SPEC and record the answers in the open-questions table with a date. This is the
      human-edit evidence for the SPECs
- Verify: `gh issue view <n>` returns both issues. Each SPEC has ACs and an open-questions table, and each blocking
  row has a BA answer with a date.

### Phase 3 — E1-02 in session A (plan mode → test-first → fix), runs in parallel with Phase 4
- [x] Plan mode: the session writes its plan. The user edits it if needed and approves. Note the approval time
- [x] QA: new file `apps/web/src/__tests__/ChatInputAutoGrow.test.tsx` (copy the `useStream` mock from
      `App.test.tsx`).
      - jsdom covers the logic, using a stubbed `scrollHeight`: the height follows the content, the cap comes from CSS
        `max-height`, the height resets after a send, and `resize` is `none`.
      - Commit `test(web): add failing tests for input auto-grow` while the tests are red.
- [x] Fix in `App.tsx` (a ref plus a resize on input and after a send) and in `theme.css` (`.input-text`: `resize:
      none`, `max-height`, `overflow-y: auto`). Commit `fix(web): auto-grow the message input up to 6 lines`
- [x] Browser proof: Playwright on this worktree's Vite dev server. Typing needs no backend.
      - Measure `clientHeight` at 1, 3, 6 and 8 lines and again after a send (or after clearing, if a send needs the
        server).
      - Save screenshots to `plans/20261022-day-13-build-parallel/evidence/`.
- Verify:
  - `pnpm --filter web exec vitest run src/__tests__/ChatInputAutoGrow.test.tsx` was red at the `test:` commit and
    is green now.
  - `pnpm typecheck && pnpm test` exits 0.
  - Playwright shows the height grows from 1 to 3 to 6 lines, 8 lines gives the same height as 6 with
    `scrollHeight > clientHeight`, and after a reset the height is back to 1 row.

### Phase 4 — E1-03 in session B (plan mode → investigate → fix or document), parallel with Phase 3
- [x] Plan mode: the plan starts with a short investigation, an AI message rendered in jsdom with `\n`, `\n\n`, a
      list, and a code block, and has two branches. The user approves it
- [x] User (BA) decides from the findings whether a single `\n` in an AI message should become a visible line break.
      Record the decision in the SPEC
      - **(a) Broken, fix:** the fix is probably `remark-breaks`, a new dependency. Run `npm show remark-breaks version`
        first and pin the exact version. Session B's plan names the dependency and the lockfile change for approval.
        - Add a new test file `apps/web/src/__tests__/AiMarkdownLineBreaks.test.tsx`: a single `\n` gives `<br>`,
          `\n\n` gives 2 `<p>`, and lists and code blocks still render. Commit it red as a `test:` commit, then commit
          the `fix:`.
        - Keep E1-01's AC4: the AI bubble's `white-space` stays `normal`.
      - **(b) Not broken:** no code change. The SPEC records the evidence and the decision, and the PR is
        `docs: record E1-03 findings`
- Verify:
  - (a) The new test file was red at the `test:` commit and is green now; E1-01's 4 tests still pass;
    `pnpm typecheck && pnpm test` exits 0.
  - (b) The SPEC shows the rendered HTML for each of the 4 inputs and the BA decision with a date.

### Phase 5 — Review, PRs, crosstalk check
- [x] In each session: `devkit:code-reviewer` against the SPEC. Fix the important findings. Mark the ticket Done
      in `docs/BACKLOG.md` (E1-02 row in A, E1-03 row in B; different lines)
- [x] Crosstalk check, done by the coordinator:
      - `git diff --name-only main...<branchA>` and `git diff --name-only main...<branchB>`: no test file is in both
        lists.
      - For any shared file (`App.tsx`, `theme.css`, `BACKLOG.md`), list the hunks and check they don't overlap.
- [x] **Ask before each push.** Push, and open 2 PRs into `main` with `Closes #<issue>`. The coordinator builds and
      publishes each PR report artifact (`render-report.mjs`) and links it under `## Full report`
- [x] After the first PR merges (user merges), rebase the second onto `main` and run `pnpm typecheck && pnpm test`
- Verify: 2 PR URLs. Each body has `Closes #n` and an artifact link. The crosstalk check shows no shared test file
  and no overlapping hunks. After the rebase, the second branch has no conflicts and its suite exits 0.

Coordinator findings (2026-10-22):
- Both PR branches are on `0e3e68a` (`git merge-base`). Each session's warning that the *other* worktree was on
  `8ded608` was false: `8ded608` ("add README", 2026-07-30) is an old commit that every branch contains.
- PRs: E1-03 = deep-agents #10, E1-02 = #11. Report artifacts were linked under `## Full report`.
- Crosstalk: no shared test file. `App.tsx` auto-merges. `docs/BACKLOG.md` **conflicts**: rows 12 and 13 are next
  to each other, so this plan's "different lines" assumption was wrong. Keep both Done rows. A trial merge with that
  resolution passed typecheck, root 115/115 and web 104/104.
- Worktree side effect: in the main checkout, root `pnpm test` also runs `.claude/worktrees/*/apps/web` tests in a
  node environment (557 tests, 205 failed). The cause is that `vitest.config.ts` excludes `apps/**` only at the root.
  Follow-up: add `.claude/worktrees/**` to the exclude list.

- Merged 2026-10-22 after the user's review: #11 → `a4618da` (closes #8), then #10 → `94f81de` (closes #9).
  #10 was updated by merging `main` into it (`2063149`), not by a rebase, so no force push was needed. The
  `BACKLOG.md` conflict was resolved by keeping both Done rows. Before the push: typecheck, web tsc and eslint
  exit 0; root 115/115; web 104/104; `claude-review` passed.

- Follow-ups (2026-10-22):
  - PR #12, `fix(test): exclude Claude Code worktrees from the root vitest run`: before 562 tests, 209 failed;
    after 115/115. Open, waiting for the user's review.
  - Issues filed: #13 (E1-03 real-browser check), #14 (E1-02 resize on width change and the border token), #15
    (E1-02 in Firefox, Safari and mobile), #16 (GitLab back-sync).
  - Worktrees `e1-02` and `e1-03` are kept: their sessions were still running. Remove them when you exit those
    sessions.

### Phase 6 — Day 13 report (claude-training), human-edit log
- [x] Branch `docs/day-13-report` in `claude-training`. Write `docs/day-13-report.md`:
      - header and `## Summary`;
      - parallel sessions (worktree list, timeline);
      - plan-mode approvals (what the user changed in each plan);
      - per-ticket result;
      - QA suite;
      - BA spec updates;
      - crosstalk check;
      - **artifact log**: one row each for this plan, the 2 session plans, the 2 SPECs, the tests, the 2 PR bodies and
        this report, with the Claude draft → the human edit → the evidence;
      - 2 takeaways.
- [x] Mark the GitLab back-sync MR as a TODO, and label anything role-played "simulated"
- [ ] Commit `docs: add Day 13 report and plan`. Ask before the push. Open the PR with its report artifact
- Verify:
  - `grep -c "^## " docs/day-13-report.md` ≥ 5.
  - Every artifact-log row has evidence or says "not met".
  - `npx markdownlint-cli2 docs/day-13-report.md` shows only MD013.
  - The PR URL is returned.

## Risks
| Risk | Signal | Mitigation |
| --- | --- | --- |
| `claude -w` puts the worktree on an unexpected base or path | `git -C <wt> log -1` ≠ `0e3e68a` | Phase 1 stops; rebase before any ticket work |
| jsdom can't measure height, so the tests pass for the wrong reason | Tests green without the fix | The `test:` commit must be red; Playwright is the AC proof for E1-02 |
| Both branches edit `App.tsx` and `theme.css` | Conflict on rebase | Different regions (textarea at `:308`, Markdown at `:217`, `.input-text` vs bubbles); separate test files; rebase + full suite in Phase 5 |
| E1-03 adds a dependency to a public repo | `package.json` and lockfile in the diff | Exact pin, `npm show` first, named in session B's plan for approval; branch (b) has no dependency |
| Two Vite dev servers clash on port 5173 | "Port in use" | Vite picks the next port; only session A needs a browser |
| Rule drift: GitHub PRs for app work while the GitLab rule stands | GitLab `deep-agents` falls behind | Recorded as a decision; back-sync MR is a TODO |
| The "human-edited" claim has no proof | An artifact with no diff or note | The log marks it "not met" rather than claiming it |

## Out of scope
- The GitLab back-sync MR into `deep-agents` (TODO, when GitLab is back).
- E1-03's follow-ups beyond line breaks: tables, Markdown styling, blank-line runs in human messages.
- A shared e2e suite with a live backend and LLM keys (E2-02); the Day 12 report.

## Notes on this plan
- Mode: standard (no flag). Scouting and planning were done inline in the coordinator session, not by the planner
  subagent. No research was needed. Not red-teamed; an advisor review was applied before writing.
