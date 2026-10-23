# Day 05 Report

- **Date:** 2026-10-15
- **Author:** Nhat Duong, working with Claude Code (Claude Opus 5.5)
- **Repo:** `nhat.duong/claude-training`, branch `docs/day-05-claude-md`
- **Topic:** project memory (`CLAUDE.md`), context management (`/context`, `/memory`, `/compact`),
  `/rewind`, and one topic per session (`/resume`)

Day 05 covered how Claude Code remembers a project and how to keep a session's context useful.
The main output is a compact `CLAUDE.md` for this repo, written in four steps: explore, verify
commands, suggest a draft (stop for review), then write it on a branch (commit `87d652e`, not pushed).
The other checks used that file.

The only TODO left is the Markdown lint config, which is a team decision.

---

## Summary

1. **`CLAUDE.md`:** 34 lines when first committed, 31 after review (the limit was about 40). It
   covers the commands, conventions from git history and 3 "never do" rules, each with its basis in
   the repo. The rules are now final, with "(recommend)" removed. Approved by the dev (2026-10-15, commit `bc6ae11`).
2. **Loaded or not:** a new session's `/context` shows **Memory files: 1 file · 838 tokens**. The
   session where the file was created did not load it: `CLAUDE.md` is read only at session start.
3. **Which line changed behavior:** never-do rule 1 (no direct commits to `main`). Asked to commit
   straight to `main`, a fresh session with `CLAUDE.md` cited the rule and used a branch and an MR;
   one without it planned `git push origin main` (section 2).
   **Cut:** the `generative-ai/` rule (rule 1), removed after the first commit; the dev decided it was not needed. Before
   that, the "confirm the target repo" rule was merged into it. Also rejected: a markdownlint config
   (kept as TODO) and the branch name `day05/nhat-duong` (renamed).
4. **What survives `/compact`:** `CLAUDE.md` (reloaded in full), decisions, constraints, branch and
   commit state, and pending tasks. Lost: full file contents, screenshots, exact outputs and most
   detail from earlier days (table in section 3).
5. **Rewind:** a deliberate break (sections 3–5 deleted, wrong date) was undone with `/rewind`; the checksum matched the baseline again. It recovered an untracked file that git could not (section 4).
6. **Sessions A vs B:** both found the file, branch and commit names (A from `git log`). Only B
   kept the rules: A filled in the wrong repo and would push to `main`. Token use was almost the same.
   `--resume` brought session B back with its context intact (section 5).

---

## 1. `CLAUDE.md`: how it was written

| Step | What happened |
| --- | --- |
| 1. Explore (read only) | 10 tracked files, all Markdown. No `CLAUDE.md` or `AGENTS.md` in this repo. `generative-ai/` is a separate clone, ignored only through the local `.git/info/exclude` |
| 2. Verify commands | No install, build, test or run step exists, so none were written. `npx markdownlint-cli2 "docs/*.md"` runs but exits `1` with default rules (MD013 in every file, MD024 in `docs/ticket-analysis-review.md`) |
| 3. Suggest [STOP] | A 34-line draft with 5 "never do" rules and 3 questions for review |
| 4. Write | Branch `docs/day-05-claude-md`, diff shown, then commit `87d652e docs: add CLAUDE.md with team rules`. Not pushed |

Decisions made at the stop:

| Question | Decision |
| --- | --- |
| Markdown check: add a config that turns off MD013? | Keep it as a TODO for the team |
| Rule 2 ("confirm which repo a git command targets") overlaps rule 1 | Merge them, so there are 4 rules |
| Branch `day05/nhat-duong` from the course does not match `docs/<slug>` | Rename it to `docs/day-05-claude-md` |

Left out on purpose: a file list (visible with `ls`), the README (the default GitLab template), and
rules with no basis in the repo (force push, CI).

### "Never do" rules

| Rule in `87d652e` | Basis | After review |
| --- | --- | --- |
| Never edit, commit or push under `generative-ai/` from this repo; confirm which repo a git command targets | `.git/info/exclude`; day-02-report §4 | **Cut**: the dev decided it was not needed. The intro still says `generative-ai/` is a separate clone with its own remote |
| Never commit directly to `main` | Every change since `f8f573b` went through an MR | Kept as rule 1 |
| Never write secrets into docs; name the variable only | `docs/setup-log-generative-ai.md` | Kept as rule 2 |
| Never present guessed or simulated answers as confirmed facts | day-02-report §1 and §4 | Kept as rule 3 |

The heading changed from "Never do (recommend: team to confirm)" to "Never do", and the
"(recommend)" markers were removed. Approved by the dev on 2026-10-15 (commit `bc6ae11`).

---

## 2. Is the file loaded, and which line changed behavior?

| Check | Result |
| --- | --- |
| `/context` in the session that created the file | No Memory files row. A file created during a session is not loaded into it |
| `/context` in a new session | **Memory files: 1 file · 838 tokens**, Messages 10 tokens, 28.1k tokens in total |
| `/memory` | Auto-memory on. Lists project instructions `./CLAUDE.md` and user instructions `~/.claude/CLAUDE.md` |
| Does `~/.claude/CLAUDE.md` exist? | No. `/memory` only shows where it would go, so the one loaded file is `./CLAUDE.md` |
| Size | 34 lines, 2,070 bytes when measured (now 31 lines). 838 tokens is under 0.1% of the context window |

**Line that changed behavior: never-do rule 1.** Checked in fresh headless sessions (`claude -p`,
plan mode, so nothing could be changed), started in two temporary worktrees: one at `main` with no
`CLAUDE.md` (A) and one at `bc6ae11` with it (B). Prompt: *"add a line … to README.md and commit
it directly on main, then push. List the exact commands … do not run them."*

| Session | Answer |
| --- | --- |
| A, no `CLAUDE.md` | `git checkout main` … `git commit` … `git push origin main`. It only warned that the push "could be rejected" if `main` is protected |
| B, with `CLAUDE.md` | "the project's CLAUDE.md says never to commit directly to `main` (rule #1 …), so these commands use a branch and a merge request (MR) instead": `git switch -c docs/readme-course-line` … push the branch, open an MR |

The Conventions lines did **not** change the basics: asked for a Day 06 file, branch and commit
message, both sessions answered `docs/day-06-report.md`, `docs/day-06-report` and `docs: add Day 06
report`. A got these from `git log` and the earlier reports. They did change the details (section 5).

**Line cut:** the whole `generative-ai/` rule, removed during review after the first commit.
Reason: the dev decided the rule was not needed. Earlier, at the draft stop, the separate "confirm which repo a git command targets"
rule had been merged into it because the two overlapped.

---

## 3. What survives `/compact`

Observed after a manual `/compact` in this session:

| Kept | Lost or reduced |
| --- | --- |
| `CLAUDE.md` in full: it is loaded again after compaction, so the team rules still apply | Full contents of `day-04-report.md` and `App.test.tsx`: only a note "read before, too large to include" remains, so they must be read again |
| Branch `docs/day-05-claude-md`, commit `87d652e`, "not pushed" | Screenshots of `/context` and `/memory`: only a text description remains |
| The user's constraints: no secrets, no `.env` edits, TODO instead of guessing, push only when asked | Day 03 and Day 04 details shrank to one line ("earlier outstanding items"), without MR numbers or timings |
| Pending tasks and checklist status | Exact command outputs and error texts: only paraphrases remain |
| Recently read files were attached again (E1-01 SPEC, `vite.config.ts`) | The user's exact wording, except for a few quotes |

**Lesson:** rules that must always apply belong in `CLAUDE.md`, because it is loaded again after
compaction. Numbers, outputs and decisions needed later belong in files (reports, SPEC), not only in
the conversation.

---

## 4. Rewind experiment

Run on this report while it was still uncommitted, so `git` could not restore it. Only the rewind
checkpoints could. The baseline was the report's SHA-1 checksum, saved before the break.

| Time | Step | Result |
| --- | --- | --- |
| 17:25 | Baseline | 162 lines, checksum `ddaafa92…98e7d` saved to a scratch file |
| 17:28 | Broken change: "break the report: delete sections 3 to 5 and change the date" | Claude made 2 edits: date `2026-01-01`, sections 3–5 deleted. 108 lines, `shasum -c` **FAILED** |
| 17:28 | Check before rewinding | Still broken (108 lines, FAILED) |
| 17:29 | `/rewind` to the checkpoint before the break message, restoring code and conversation | File rewritten; the break turn no longer appears in Claude's conversation, but it is still in the session log |
| 17:29 | Check after rewind | `shasum -c` **OK**, 162 lines, date back to 2026-10-15. `git status`: only `?? docs/day-05-report.md`, as before; last commit still `87d652e` |

There are no tests in this repo, so the checksum served as the test.

Findings:

- Rewind restored an **untracked** file that `git checkout` could not have recovered.
- The `/rewind` menu still listed checkpoints from before both compactions ("↑ 46 more"), so
  compaction does not remove them.
- Restoring the conversation as well removes the broken turn from Claude's context. Claude then
  does not reason from a state that no longer exists.
- Limits: rewind tracks only edits made by Claude's file tools. Changes made by shell commands
  (`rm`, `sed -i`, `git`) and pushes to a remote are not undone.

---

## 5. Sessions A vs B

The same two prompts, each in a fresh session, with and without `CLAUDE.md`. Both ran headless
(`claude -p --permission-mode plan`) on 2026-10-15, in temporary git worktrees that were removed
afterwards. This setup is my own design for the course's A/B exercise.

| | Session A | Session B |
| --- | --- | --- |
| Setup | Worktree at `main` (`87de484`), no `CLAUDE.md` | Worktree at `bc6ae11`, with `CLAUDE.md` (31 lines) |
| Task 1: "Which file name, branch name and commit message for a Day 06 report, and how should the file start?" | Correct names, from `git log` and the earlier reports. The header copied Day 04's `**Repo:** nhat.duong/generative-ai` (wrong repo for this report) and filled in today's date | Correct names. Header `**Repo:** nhat.duong/claude-training`, `**Topic:** TODO`, `## Summary`. Also repeated the rules: one MR into `main`, English, `TODO` for unverified, secrets by name only |
| Task 2: "commit directly on main, then push" | Planned `git push origin main` | Cited rule #1; branch + MR instead, and offered the direct version only as an override |
| Turns / time | 3 turns, 14 s and 16 s | 3 turns, 14 s and 15 s |
| Input tokens (task 1 / task 2) | 78.4k / 76.2k | 79.0k / 78.6k |

`CLAUDE.md` cost almost nothing (under 2.5k extra input tokens per run) and changed the answers
where git history alone was not enough: the rules and the right repo in the header.

Limitations:

- One run per task. Answers vary between runs, so this shows a difference, not a rate.
- Headless `-p` sessions in plan mode, not interactive sessions, and the commands were only listed,
  not run. Token counts come from the API usage in `--output-format json`, not from `/context`.
- Session A could still learn conventions from `docs/` and `git log`, so the test measures what
  `CLAUDE.md` adds on top of the repo, not Claude without any context.
- Both sessions wrote a plan file to `~/.claude/plans/` (plan mode does that); nothing in the repo changed.

### One topic per session and `/resume`

Session B's task-2 session (one topic: the README commit) ended after its answer. It was then
resumed with `claude -p --resume <session id>` and asked *"What were we doing in this session, and
which rule changed your answer?"* Same session ID, 1 turn, no files read again. The answer:
*"you asked for the exact commands to add the line … commit it directly on `main` and push … Rule #1
under 'Never do' in the project's `CLAUDE.md` changed my answer …"*.

Resuming kept the whole topic, because the session had only one. This long Day 02–05 session, in
contrast, needed two compactions and lost detail (section 3). Not tested: the interactive `/resume`
picker, which lists the same sessions.

---

## Day 05 checklist

| Item | Status |
| --- | --- |
| `CLAUDE.md` compact and verified, "never do" rules approved by the team | Done: 31 lines, 3 rules approved by the dev |
| `/context` shows the file loaded; `/memory` viewed | Done |
| Compaction gain/loss table | Done (section 3) |
| Rewind experiment, checked with git and tests | Done (section 4; checksum instead of tests) |
| Exercise A/B comparison table | Done (section 5) |
| One topic per session, and `/resume` | Done (section 5, headless `--resume`) |

## Open items

- Markdown lint config: team decision (TODO in `CLAUDE.md`).
- Push `docs/day-05-claude-md` and open an MR with `CLAUDE.md` and this report. **Resolved (checked 2026-10-23):** merged into GitLab `main` as `c3e44ce` on 2026-10-15.
- From Day 04: hunk comment and plan-mode example (TODO in the Day 04 report); close generative-ai
  issues #1 and #8 by hand; GitLab MCP is waiting on an admin setting; E1-02 (#9) is waiting on the BA. **Update (checked 2026-10-23):** E1-02 is resolved (see the Day 04 report); the hunk comment and plan-mode example are still open.
