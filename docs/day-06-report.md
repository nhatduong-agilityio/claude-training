# Day 06 Report

- **Date:** not recorded. It was between Day 05 (2026-10-15) and Day 07 (2026-10-19); no commit, report or session
  from that day exists in the repos to pin it.
- **Author:** Nhat Duong. The notes in section 1 are the author's own text, pasted on 2026-10-23 for the final
  checkpoint. The evidence check in section 2 was added by Claude Code (Claude Opus 5.5).
- **Topic:** flagship features and parallel work (subagents, artifacts, `/loop`, Remote Control, `/effort`, worktrees)
  and Developer Checkpoint 2
- **Source:** the author's notes. There was no Day 06 report when the course ended; `docs/day-05-report.md` had
  already named this file as the next one.

This report keeps the author's notes as written. Because nothing from Day 6 itself is in the repos (no commit, report
or session from that day was found on this Mac), section 2 grades every claim: **Evidenced** (a file, commit, PR or
run was checked), **Self-reported** (the notes say so; no trace found; it may exist elsewhere), or **Gap** (missing or
only partly covered). `CLAUDE.md` rule 3: nothing is presented as confirmed without evidence.

---

## Summary

### 1. The author's notes

**Completed course:** Introduction to subagents.

#### Artifacts

- Published a PR walkthrough from a Code session as an artifact with its own page and share link, and shared it with a
  peer.
- Useful for reviews and investigation timelines, since reviewers get one live page instead of a long chat.

#### `/loop`

- Ran `/loop 15m` on an open PR (built-in maintenance prompt) and a custom `/loop 5m` to check the deploy, then wrote a
  `loop.md` for the repo.
- Loops re-run only while the session is open; Esc stops them.

**Remote Control (`/rc`):** started a session at my desk, connected from the phone via claude.ai/code, and sent a
steer.

#### `ultrathink` and `/effort`

- Used `ultrathink` for one-off deep reasoning and compared `/effort` levels on the same bug.
- Deeper reasoning costs more time and tokens, so it pays off only on hard problems.

#### Parallel sessions and subagents

- Ran two isolated sessions on two tickets with git worktrees and watched both in agent view, with no crosstalk.
- Subagents (Explore, Plan) take bounded research off the main session; a cloud session can keep a long task running
  after the laptop is closed.

**Developer Checkpoint 2: completed** (as reported: two parallel sessions merged, one plan-mode change steered via
diff comments, one artifact, one Remote Control steer, one `/loop` run). The evidence check below finds
**partly completed**: one row has no evidence.

#### Takeaways

- Share results as artifacts instead of pasting long chat output; they are live and reviewable.
- Use `/loop` for repetitive watching (PRs, CI, deploys) so I don't have to poll by hand.
- Remote Control and cloud sessions let long tasks continue while I'm away from my desk.
- Spend deep reasoning (`ultrathink`, higher `/effort`) only where the problem justifies the cost.
- Worktrees make it safe to run two tickets in parallel with isolated agents.
- Delegate bounded investigation to subagents so the main session stays focused on coding.

---

## 2. Evidence check (2026-10-23)

| Item | Status | Evidence |
| --- | --- | --- |
| Course "Introduction to subagents" completed | Self-reported | No certificate or link in the repos |
| Artifact: PR walkthrough with its own page and share link, shared with a peer | **Partly evidenced** | Built on 2026-10-23: [PR #11 Walkthrough](https://claude.ai/artifact/2RmBAbrdN2knF7SnHTxr68). The Day 6 original is not among the 50 most recent artifacts (the only 16 October one is "T-1 report", a devkit sample report). Artifacts as a skill are evidenced from Day 7 on (a report per PR, e.g. [E1-02](https://claude.ai/artifact/JrJLquh5ZEyjjuAcKeEbnz)). Sharing with a peer: not done; an artifact stays private until the author shares it |
| `/loop 15m` on an open PR, `/loop 5m` on a deploy | Self-reported; skill evidenced later | Day 10: `/loop 3m` on PR #7 until `claude-review` passed (`docs/day-10-report.md` §5). Day 14: `/loop` and a Monitor on PR #19 until green (CI run 39736139751) |
| `loop.md` written for the repo | Evidenced (merge pending) | None existed in claude-training, deep-agents, nhat-kit or `~/.claude`. Written on 2026-10-23 for deep-agents: [PR #33](https://github.com/nhatduong-agilityio/deep-agents/pull/33), all 3 CI checks green, not yet merged when this was written |
| Remote Control: a steer from the phone | Self-reported; skill evidenced on Day 15 | `plans/20261022-day-15-review-merge-demo/evidence/phase5-remote-control.md`: a task and a follow-up from the phone. Approving a permission prompt remotely is not evidenced |
| `ultrathink` and `/effort` compared on one bug | Partly evidenced | Effort: `/code-review low` vs `high` on the same branch (`docs/day-10-report.md` §2 and §5). `ultrathink` one-off: self-reported |
| Two isolated sessions on two tickets with worktrees, no crosstalk | Evidenced (Day 13) | deep-agents PRs #10 and #11; two `claude -w` worktrees; the crosstalk check in `docs/day-13-report.md` §4. "Watched in agent view": self-reported |
| Subagents take bounded work off the main session | Evidenced | `devkit:code-reviewer` and `devkit:tester` on Days 10 to 15, e.g. the Day 13 report's fact-check. A cloud session continuing after the laptop is closed: self-reported |

### Developer Checkpoint 2

| Row | Status | Evidence |
| --- | --- | --- |
| Two parallel sessions merged | Evidenced | Day 13: deep-agents PRs #10 and #11 |
| One plan-mode change steered via diff comments | **Gap (not done)** | No evidence. It needs an interactive action in the Desktop app (comment on a diff hunk in plan mode). The Day 13 session plans were approved as written. The same item is an open `TODO` in `docs/day-04-report.md` ("plan mode use; a hunk comment") |
| One artifact | Evidenced | PR reports from Day 7 on; the Day 14 release notes; the Day 15 run-sheet and playbook |
| One Remote Control steer | Evidenced | Day 15, `evidence/phase5-remote-control.md` |
| One `/loop` run | Evidenced | Day 10 §5; Day 14 (PR #19) |

By the rule used on Day 11 (a checkpoint is "completed" only if every row has evidence): **Checkpoint 2 is partly
completed. The missing row is "one plan-mode change steered via diff comments".**

## 3. What is left

- **Diff-comment steering (also closes the Day 4 `TODO`):** not done. In plan mode in the Desktop app, comment on one
  hunk of the proposed change and send it; record the session link or a screenshot. It is the one row that keeps
  Checkpoint 2 at "partly completed".
- **`loop.md`:** written ([PR #33](https://github.com/nhatduong-agilityio/deep-agents/pull/33)); it counts as merged evidence once the PR is merged.
- **PR walkthrough artifact:** built ([PR #11 Walkthrough](https://claude.ai/artifact/2RmBAbrdN2knF7SnHTxr68)); sharing it with a peer is not done.
- **Session links** (claude.ai/code) for the Day 6 runs would turn the self-reported rows into evidence.
