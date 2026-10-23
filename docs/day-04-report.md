# Day 04 Report

- **Date:** 2026-10-15
- **Author:** Nhat Duong, working with Claude Code (Claude Opus 5.5)
- **Repo:** `nhat.duong/generative-ai`, branch `deep-agents`
- **Ticket 1:** issue #1, Shift+Enter submits instead of adding a line break (Day 03, MR !155)
- **Ticket 2:** issue #8, sent messages show line breaks on one row (backlog E1-01, MR !157)

Day 04 set up Claude Code properly for the project and then ran a full ticket through it. There were three pieces of work:

1. Bootstrap Claude Code for the repo (`/devkit:bootstrap`, MR !156): permissions, hooks, project memory, rules, an agent, a verify skill and templates.
2. Connect GitLab through MCP. Blocked on the server side; see the Open items.
3. Ticket 2, issue #8, from start to finish with `/devkit:task`: spec, gap check, plan approval, test-first fix, review, browser evidence, MR !157, merge.

Related records: [day-04-tickets.md](day-04-tickets.md) (#8 and #9 as filed), [day-03-report.md](day-03-report.md) (ticket 1). The E1-01 spec is in the generative-ai repo at `docs/tasks/E1-01-human-message-line-breaks/SPEC.md`.

---

## Summary

1. **Permission modes:**
   - **Plan mode** is for reading and planning: ticket intake, specs, bootstrap analysis.
   - **Default** (ask before edits and commands) is for unfamiliar repos and anything that touches GitLab or secrets.
   - **Accept edits** is for implementing a plan that has already been approved, test first.
   - **Auto mode**, used this session, relies on the project's allow/ask/deny rules and the safety classifier. `git push` still asks.
   - **Bypass permissions** is never used on a company repo.
2. **Claude's claims about the codebase, checked:** 8 claims, 5 true and 3 false (table in section 2). Every verdict comes from running a command, a test or a browser check, not from reading the claim.
3. **What the plan gate caught:** the first E1-01 plan would have shipped the ticket's suggested `white-space: pre-wrap` alone, with acceptance criteria 1 and 2 checked only by hand. The gap check before plan approval showed this had two problems: long URLs would still overflow (confirmed in Chrome), and there would be no failing test first, which the repo's rule requires. The approved plan fixed both. Use of Claude Code's own plan mode (Shift+Tab): TODO.
4. **Hunk comment:** TODO. No hunk comment was used in this session. The closest step was a written correction that changed direction ("include the URL-overflow fix").
5. **Ticket 1 vs ticket 2:**
   - Ticket 2 went from first code commit to merge in **14 minutes**, against **27 minutes** for ticket 1.
   - Ticket 2 needed **no fixes after the MR was opened**; ticket 1 needed 5 commits after review.
   - Ticket 2 was faster because the setup existed (`CLAUDE.md`, rules, allowlist, verify recipe, MR template), and because the gap check and review ran *before* the MR.
6. **MR and results:**
   - MR [!157](https://gitlab.asoft-python.com/nhat.duong/generative-ai/-/merge_requests/157) was merged into `deep-agents` at `c42c2db`.
   - The bug tests went from **2 failed, 92 passed** to **94/94**; the root suite passes 115/115; type check and lint pass.
   - In Chrome, the bubble shows 2 lines, with no overflow at 1280px or 375px.

---

## 1. Permission modes, and which mode for which task

| Mode | What Claude may do without asking | When I use it | Example from Day 03–04 |
| --- | --- | --- | --- |
| **Plan** | Read and search only; no edits, no commands that change anything | Understanding a ticket, writing a spec or plan, first look at a repo | Ticket intake, the E1-01 spec and gap check, the bootstrap analysis (Steps 0–2) |
| **Default** | Nothing risky: asks before each edit and each command not on the allowlist | Unfamiliar repo; anything outward-facing (GitLab, pushes, MRs); anything near secrets | MCP setup, pushing branches, opening MRs, the GitLab OAuth sign-in |
| **Accept edits** | File edits inside the project; commands still follow the allowlist | Implementing a plan I've already approved, with tests first | E1-01 commits 1–3 (test config → failing tests → 2-line CSS fix) |
| **Auto** | Most actions; a classifier blocks risky ones, and the project's `deny` and `ask` rules still apply | Long, well-specified sessions in a repo that has a permission file | This whole session. The classifier blocked using the OpenAI key directly on Day 02, and the bootstrap's `deny` rules block reading `.env*` |
| **Bypass permissions** | Everything, with no checks | Never on a company repo. Only in a throwaway sandbox or container | — |

**Project rules that apply in every mode** (`.claude/settings.json`, from MR !156):

- **allow:** only commands that passed when tested: `pnpm typecheck`, `lint`, `test`, `build`, single-file Vitest, `eslint`, `prettier --write`, and read-only git.
- **ask:** `git push`.
- **deny:** reading `.env*`; editing generated folders; force-push.

So even in auto mode, a push asks first and secrets can't be read.

**Rule of thumb:** the riskier and more outward-facing the action, the more restrictive the mode. Read-only work goes in plan mode, and approved, test-first edits in accept edits. Anything another person will see (pushes, MRs, issue comments) stays behind an approval.

---

## 2. Claude's claims about the codebase, checked

| # | Claim (who made it) | Verdict | How I know |
| --- | --- | --- | --- |
| 1 | `CLAUDE.md` says 6 skills and PostToolUse hooks are installed, but they don't exist (Explore subagent) | ✅ True | `ls -a .claude` showed only `commands/`; no `skills/` folder, no `settings.local.json` |
| 2 | Ticket #9's line reference `theme.css:699` has drifted (requirements-analyst subagent) | ❌ False | `grep` showed `.input-text {` starts at line 699, and `min-height: 38px` (line 711) is inside that rule. The reference is correct. |
| 3 | "Running Vitest on a folder pulls in the e2e tests, which fail without API keys" (Claude, written into the draft `CLAUDE.md`) | ❌ False | The real cause was `dist/`, created by my own `pnpm build` check: the root config doesn't exclude it. After `rm -rf dist`, the folder run passed 115/115. The gotcha was corrected before committing. |
| 4 | A long URL already overflows the human bubble, and `pre-wrap` alone won't fix it (gap check, B1) | ✅ True | Chrome with the real `theme.css`: overflow at 1280px and 375px today; still overflowing with `pre-wrap` only; no overflow with `pre-wrap` plus `overflow-wrap: anywhere` |
| 5 | jsdom can read `theme.css` styles if Vitest's `test.css` includes it (gap check, B2) | ✅ True | A throwaway test read `.files-content` `pre-wrap` and the bubble's `max-width: 82%` |
| 6 | The AC4 test "passes even if theme.css never loads" (code-reviewer subagent) | ✅ True | The old check `not.toBe('pre-wrap')` also passes when the value is `''`. The tightened test was mutation-checked: adding `pre-line` to all bubbles now makes it fail. |
| 7 | GitLab's MCP endpoint exists on our server (Claude) | ✅ True, but it wasn't the whole story | `/api/v4/mcp` → 401 with an MCP sign-in header, while a made-up path → 404. After sign-in it still failed: most likely the instance setting is off, which needs an admin. |
| 8 | The pasted npm GitLab config works with `GITLAB_URL` (from the pasted example) | ❌ False | The package source reads `GITLAB_API_URL` (`dist/index.js:18`). `GITLAB_URL` is ignored, so it would fall back to gitlab.com. The package is also deprecated and has no tools to read issues or comment. |

**Lesson:** subagents' claims needed the same checking as my own. Two of the three false claims were plausible and confidently stated (#2, #3). One check each, a `grep` or deleting `dist/` and re-running, was enough to settle them.

---

## 3. A wrong or redundant part of Claude's plan, blocked before approval

**What happened:** `/devkit:task` won't let any code be written until the plan is approved, and a gap check runs before the plan. In this session that gate did the job plan mode is for.

| Draft (spec v1, before the gap check) | Problem | What the approved plan did instead |
| --- | --- | --- |
| Fix = the ticket's suggestion, `white-space: pre-wrap` | **Wrong / incomplete:** long URLs would still overflow, at both widths (claim #4) | Added `overflow-wrap: anywhere` to the same rule and a new AC2, after the scope was confirmed |
| AC1 and AC2 tested only "manual / browser" | **Wrong process:** nothing would fail first, which breaks `.claude/rules/testing.md` | A throwaway test proved jsdom can read the CSS; the plan added a `test.css` commit, then failing tests, then the fix |
| AC4 "AI bubbles unchanged" with no style assertion | **Redundant check:** it would pass whatever happened | Made the rule apply to `.msg-bubble--human` only, and asserted the AI bubble's style. Tightened again after the review (claim #6). |

**In the bootstrap:** the approved plan included a project `.mcp.json` for GitLab. That turned out to be **redundant** once GitLab's docs recommended one entry per user, so it was removed (`107c2a9`). The plan gate didn't catch this one; it was found afterwards, when the connection failed.

**Plan mode itself (Shift+Tab):** TODO. Record here if you used it, and what it stopped.

---

## 4. Using a hunk comment to change direction

**TODO.** No hunk comment (a comment on a specific changed block in the diff view) was used in this session.

The closest event was a direction change by plain message. After my plan put the long-URL fix in as an assumption ("ok, continue" was read as *Include*), you confirmed it explicitly ("include the URL-overflow fix"). I then recorded the decision in the spec (`65247d3`) and the MR description.

To do it properly next time: open the diff, comment on the hunk (for example on the `overflow-wrap` line in `theme.css`), and let Claude adjust only that hunk.

---

## 5. Ticket 1 vs ticket 2

| | Ticket 1: #1 Shift+Enter (Day 03, !155) | Ticket 2: #8 line breaks (Day 04, !157) |
| --- | --- | --- |
| Starting point | Bug report only; reproduced and analyzed on Day 02 | Ticket written with evidence; project bootstrapped with `CLAUDE.md`, rules, allowlist and verify recipe |
| Spec / acceptance criteria | None written; the test described the behavior | `SPEC.md` with AC1–AC4, gap check, open questions with proposed answers |
| Plan gate | Informal | Plan written into the spec and approved before any code |
| First code commit → merge | 08:59 → 09:26 (**27 min**) | 15:36 → 15:50 (**14 min**) |
| Review | After the MR was opened: 7 comments, **5 more commits** | Before the MR: 0 critical, 2 warnings, both fixed before pushing |
| Fixes after the MR opened | 5 commits (Safari IME, two missing tests, refactor, casts) | 0 code commits (docs only: recording decisions) |
| MR description | Draft missed run steps, the test-fail steps and the script; fixed after the peer swap | Built from the spec's evidence table, using the new MR template |
| Browser evidence | Playwright script, written and debugged during the task | Same approach, and the commands were already known; screenshots at 2 widths |

### Where ticket 2 was faster

- **Setup:** I didn't have to work out commands again. `CLAUDE.md` and the allowlist already had the single-file test command, the dev servers and the gotchas.
- **Review shifted earlier:** the gap check and code review ran before the MR, so nothing came back after it was opened.
- **Description:** the spec's evidence table *was* the How-tested section, so the peer-swap fixes from ticket 1 (missing run steps, missing fail-first commands) didn't happen again.

**Where ticket 2 took longer, on purpose:** the spec, gap check and throwaway experiment came before any code. That time is what stopped the incomplete fix from shipping (section 3).

### Habits learned

1. **Spec and acceptance criteria before code.** Each criterion names how it will be checked: a unit test, the browser, or a control.
2. **Gap check before planning,** and settle technical questions with a quick throwaway test instead of guessing.
3. **Test first, in its own commit,** failing for the bug's reason, plus control tests for what must not change.
4. **Prove the tests themselves:** a mutation check showed the AC4 test can actually fail.
5. **Real-browser evidence** for anything jsdom can't lay out.
6. **Record decisions where they live:** the spec's open-questions table and the MR's scope section, not just the chat.

---

## 6. MR links and test results

| MR | What | Status |
| --- | --- | --- |
| [!157](https://gitlab.asoft-python.com/nhat.duong/generative-ai/-/merge_requests/157) | Ticket 2: `fix(web): keep line breaks and wrap long words in human bubbles` (Closes #8) | Merged into `deep-agents` at `c42c2db` |
| [!156](https://gitlab.asoft-python.com/nhat.duong/generative-ai/-/merge_requests/156) | `chore: bootstrap claude code setup` | Merged at `a04364e` |
| [!155](https://gitlab.asoft-python.com/nhat.duong/generative-ai/-/merge_requests/155) | Ticket 1 (Day 03), for comparison | Merged at `99b6938` |

### Test results for !157

| Point in history | Command | Result |
| --- | --- | --- |
| `435fa5e` (test config only) | `pnpm --filter web exec vitest run` | 90/90: the config change broke nothing |
| `d8620e7` (failing tests) | same | **2 failed, 92 passed**: AC1 `expected '' to be 'pre-wrap'`, AC2 `expected 'normal' to be 'anywhere'` |
| `a04c57c` (fix) | same | 94/94 |
| Merged `deep-agents` (`c42c2db`) | `pnpm typecheck` · `pnpm lint` · `pnpm exec eslint apps/web/src` · `pnpm test` | All pass; root 115/115, web 94/94 |

**Browser check** (Chrome, running app, after a real send)

| Criterion | 1280px | 375px |
| --- | --- | --- |
| AC1: two lines | `innerText "line one\nline two"`, 2 rendered lines | Same, visible in the screenshot |
| AC2: long URL wraps (scrollWidth/clientWidth) | bubble 605/605, chat area 778/778 | bubble 307/307, chat area 373/373 |

---

## Open items

- **Close issue #8 by hand.** "Closes #8" only works on the default branch, and the merge went into `deep-agents`. Issue #1 is still open for the same reason.
- **GitLab MCP:** sign-in works, but the connection fails. Ask the admin to turn on *Allow access to the MCP server* (GitLab 18.6+), or the feature flags `mcp_server` and `oauth_dynamic_client_registration` (18.3–18.5).
- **E1-02 (#9, growing input box):** waiting on the BA's answers about the maximum height and the resize corner. **Resolved (checked 2026-10-23):** the BA answered on 2026-10-22 (6 lines, no resize corner) and E1-02 shipped in deep-agents [PR #11](https://github.com/nhatduong-agilityio/deep-agents/pull/11).
- **Missing from this report (TODO):** plan mode (Shift+Tab) use; a hunk comment.
- **Follow-up:** add `dist/` to `vitest.config.ts`'s exclude list (found during the bootstrap).
