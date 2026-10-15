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

Items marked TODO need results that are not recorded in this session yet.

---

## Summary

1. **`CLAUDE.md`:** 34 lines (the limit was about 40). It covers the commands, conventions from git history and
   4 "never do" rules, each with its basis in the repo. The 4 rules are recommendations until the
   team confirms them (TODO).
2. **Loaded or not:** a new session's `/context` shows **Memory files: 1 file · 838 tokens**. The
   session where the file was created did not load it: `CLAUDE.md` is read only at session start.
3. **Which line changed behavior:** TODO, waiting on the check in a new session (section 2).
   **Cut** at review: the separate "confirm the target repo" rule (merged into rule 1). Also
   rejected: a markdownlint config (kept as TODO) and the branch name `day05/nhat-duong` (renamed).
4. **What survives `/compact`:** `CLAUDE.md` (reloaded in full), decisions, constraints, branch and
   commit state, and pending tasks. Lost: full file contents, screenshots, exact outputs and most
   detail from earlier days (table in section 3).
5. **Rewind:** a deliberate break (sections 3–5 deleted, wrong date) was undone with `/rewind`; the checksum matched the baseline again. It recovered an untracked file that git could not (section 4).
6. **Sessions A vs B:** TODO.

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

| # | Rule | Basis | Team approval |
| --- | --- | --- | --- |
| 1 | Never edit, commit or push under `generative-ai/` from this repo; confirm which repo a git command targets | `.git/info/exclude`; day-02-report §4 | TODO |
| 2 | Never commit directly to `main` | Every change since `f8f573b` went through an MR | TODO |
| 3 | Never write secrets into docs; name the variable only | `docs/setup-log-generative-ai.md` | TODO |
| 4 | Never present guessed or simulated answers as confirmed facts | day-02-report §1 and §4 | TODO |

---

## 2. Is the file loaded, and which line changed behavior?

| Check | Result |
| --- | --- |
| `/context` in the session that created the file | No Memory files row. A file created during a session is not loaded into it |
| `/context` in a new session | **Memory files: 1 file · 838 tokens**, Messages 10 tokens, 28.1k tokens in total |
| `/memory` | Auto-memory on. Lists project instructions `./CLAUDE.md` and user instructions `~/.claude/CLAUDE.md` |
| Does `~/.claude/CLAUDE.md` exist? | No. `/memory` only shows where it would go, so the one loaded file is `./CLAUDE.md` |
| Size | 34 lines, 2,070 bytes. 838 tokens is under 0.1% of the context window |

**Line that changed behavior:** TODO. Planned check in a new session (no history, only `CLAUDE.md`):

1. Ask "I want to add a Day 05 report here. What branch and commit message should I use?" If it answers
   `docs/<slug>` and `docs: …` without reading `git log`, the Conventions lines changed behavior.
2. Ask it to "commit this straight to main". If it refuses and cites rule 2, that rule changed behavior.

This report follows the Conventions lines (file name, header, branch, commit type). It was written in
the same long session that wrote `CLAUDE.md`, though, so it does not prove the file caused that.

**Line cut:** the separate "confirm which repo a git command targets" rule, merged into rule 1
because the two overlapped. No line has been removed after use yet.

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

TODO: results not recorded yet.

| | Session A | Session B |
| --- | --- | --- |
| Setup | TODO | TODO |
| Task | TODO | TODO |
| Result | TODO | TODO |
| Context used (`/context`) | TODO | TODO |

Limitations: TODO.

### One topic per session and `/resume`

TODO: keep one session to a single topic, exit, run `/resume` and record whether the session continues
with its context intact.

---

## Day 05 checklist

| Item | Status |
| --- | --- |
| `CLAUDE.md` compact and verified, "never do" rules approved by the team | Compact and verified; team approval TODO |
| `/context` shows the file loaded; `/memory` viewed | Done |
| Compaction gain/loss table | Done (section 3) |
| Rewind experiment, checked with git and tests | Done (section 4; checksum instead of tests) |
| Exercise A/B comparison table | TODO |
| One topic per session, and `/resume` | TODO |

## Open items

- Team approval of the 4 "never do" rules; then remove "(recommend)" from `CLAUDE.md`.
- Markdown lint config: team decision (TODO in `CLAUDE.md`).
- Push `docs/day-05-claude-md` and open an MR with `CLAUDE.md` and this report.
- From Day 04: hunk comment and plan-mode example (TODO in the Day 04 report); close generative-ai
  issues #1 and #8 by hand; GitLab MCP is waiting on an admin setting; E1-02 (#9) is waiting on the BA.
