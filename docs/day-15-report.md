# Day 15 Report

- **Date:** 2026-10-22 to 2026-10-23
- **Author:** Nhat Duong, working with Claude Code (Claude Opus 5.5, then Claude Sonnet 5.5)
- **Repo:** `nhatduong-agilityio/deep-agents` (GitHub, public; local clone `generative-ai/`)
- **Topic:** review, merge, demo, and the final checkpoint
- **Plan:** `plans/20261022-day-15-review-merge-demo/plan.md`

Day 15 closed the capstone. The deep-agents chat UI was cross-reviewed from three angles, the same-day gaps were fixed,
and `v0.1.0` was tagged, released and deployed with Docker. A session was steered from a phone. The retro became owned
issues, the playbook was written, and the Day 3, 6 and 11 checklists were mapped to evidence. Checking `docs/` for
missing reports led to a Day 06 report and a note on every open item in the older reports.

The QA and BA reviews were done by Claude in those roles and are **simulated**: this is a solo track.

---

## Summary

### Cross-review (simulated roles)

- **Dev reviews QA's test code** (the regression suite from #19): 0 Critical, 7 Warnings, 7 Optional.
  - The main finding: the "no ResizeObserver errors" check could never fail, because it listened for `pageerror`, and
    the loop error is a `window` `error` event. So the #14 width test had no real evidence for that requirement.
- **QA reviews a dev PR** (#17): 14 test gaps. The ones that matter most are a new message arriving while the input
  grows, and no WebKit project in CI.
- **BA checks the merged behavior** against the acceptance criteria: 16 checks (E1-01, E1-02, E1-03 and #14) on `main`,
  one of them with a real model reply through the deployed stack. All 16 met, so no acceptance-criteria gaps.
  `evidence/phase2-ba.md` has the table.

### Same-day tickets

| Ticket | Gap | Fix |
| --- | --- | --- |
| [#20](https://github.com/nhatduong-agilityio/deep-agents/issues/20) | `pnpm smoke-server` sent no `AUTH_TOKEN`, so it failed with 401 against the Docker stack | [PR #23](https://github.com/nhatduong-agilityio/deep-agents/pull/23): the token is sent when set. Before: 401. After: PASS, 25 events |
| [#21](https://github.com/nhatduong-agilityio/deep-agents/issues/21) | The runbook said `/ok` is 401 without a token; on the Docker image it is 200. The rollback steps named an image compose never builds | PR #23: runbook, deploy guide and release checklist corrected; `pg_restore` marked untested |
| [#22](https://github.com/nhatduong-agilityio/deep-agents/issues/22) | The regression-suite findings above | [PR #24](https://github.com/nhatduong-agilityio/deep-agents/pull/24): 22 → 30 tests; the ResizeObserver check now collects `window` errors; flaky tests fail CI; the mock records unhandled requests |

Every changed check was proven red against the code it guards: the ResizeObserver check fails on `4dcf4b7` in both
browsers (2 errors per browser), and the "scrolled far up" test fails when the log is always pinned (moved 248 px). Both PRs
merged with CI green, and `main` stayed green (runs on `f508c24` and `9d829ac`).

### Release and deploy

- **Release:** `v0.1.0` (annotated tag on `9d829ac`) and a [GitHub release](https://github.com/nhatduong-agilityio/deep-agents/releases/tag/v0.1.0)
  with client-language notes and the merged PR list.
- **Deploy:** the self-hosted Docker path, on this Mac, following the release checklist: a volume snapshot first
  (5.5 MB), the previous image kept as `:pre-6453964` and `:pre-9d829ac`, API first. Health: `/ok` 200 with the token,
  readiness `"graph_id":"agent"`, `POST /threads` 401 without it. `smoke-server` and `smoke-permissions` both pass.
- **GitLab:** MR !159 merged by the author as `6d673e8`; `v0.1.0` is in GitLab `deep-agents` too.
- **Rollback** (written down before "done"): `docker compose down`, set `image: generative-ai-langgraph-api:pre-9d829ac`
  in place of `build: .`, `docker compose up -d`. Only docs, CI, web tests and `scripts/` changed between the two
  deployed versions, so no volume restore is needed. `evidence/phase4-release.md` has the table.

### Remote Control demo

A session started with `/remote-control` (`day15-demo`) was driven from the phone: a task ("run the web unit tests and
summarize") and one steer ("now show only the slowest test file"). Results: 110 tests passed in 1.65 s; the slowest
file was `App.test.tsx` (371 ms). The phone did not list the session at first; opening the session link directly
worked. **Not evidenced:** approving a permission prompt from the phone, because both commands were already allowed.

### Demo run-sheet, retro, playbook

- **Demo run-sheet:** [E1-02 from ticket to shipped](https://claude.ai/artifact/F7BB9AkRgXjS3o1bX7BQvM): 9 steps, 9
  minutes. The GitHub links were checked with `gh api`; the private PR #11 report link was not opened. The 10-minute demo: there is no record that it was given.
- **Retro:** 12 issues, all assigned to `nhatduong-agilityio`: deep-agents [#25–#28](https://github.com/nhatduong-agilityio/deep-agents/issues?q=label%3Aretro)
  (hook, CLAUDE.md, claude-review retry, review checklist) and backlog #29–#32; claude-training #8 and #9; nhat-kit #41
  and #42.
- **Playbook:** [How I Work with Claude](https://claude.ai/artifact/XTMCeoMNS5zH6b6C3PerWo), built from `nhat-kit`
  (devkit 2.6.0) and this course's reports, with the ticket → plan → PR → review → tests → artifact → shipped flow
  step by step. The author edited it by hand (see section 8).
- **PR walkthrough and `loop.md`** (closing Day 6 gaps): [PR #11 Walkthrough](https://claude.ai/artifact/2RmBAbrdN2knF7SnHTxr68), a one-page tour of the E1-02
  PR for reviewers (private until shared); and `.claude/loop.md` for deep-agents in [PR #33](https://github.com/nhatduong-agilityio/deep-agents/pull/33), so a bare `/loop`
  watches the open PRs and CI.

### Final checkpoint

| Checklist | Result |
| --- | --- |
| Capstone shipped end to end | Yes: `v0.1.0` released and deployed, with health and smoke evidence |
| **Day 11** (Checkpoint 3) | **Completed**: all 4 rows evidenced (the role-day row has a Web part and a Mobile and Game part); 3 platform limits recorded as such |
| **Day 3** | 4 of 6 items evidenced. The **peer swap was simulated** (a real partner's feedback was never recorded), and the takeaways are not a section of the report |
| **Day 6** (Checkpoint 2) | **Partly completed.** The Day 6 runs are self-reported (nothing from that day is in the repos). Skills shown later with evidence: worktrees (Day 13), `/loop` (Days 10, 14), `/effort` (Day 10), Remote Control (Day 15). **Closed today:** a `loop.md` was written ([deep-agents PR #33](https://github.com/nhatduong-agilityio/deep-agents/pull/33), merge pending), and a PR walkthrough artifact was built ([PR #11 Walkthrough](https://claude.ai/artifact/2RmBAbrdN2knF7SnHTxr68)). **Still open:** no plan-mode change steered via diff comments, and the walkthrough is not shared with a peer |

So the final checkpoint is **not all green**: Day 11 is, Day 3 and Day 6 are not. `evidence/checkpoint-map.md` has every
row and its evidence; `docs/day-06-report.md` holds the Day 6 notes and the same grades.

### Takeaways

- **Review from more than one angle, because each finds something the others can't.** The BA check found 0 gaps in the
  product. Running the real deploy found a smoke test that could not pass with auth on. The dev review found a check
  that could not fail.
- **A test that has never failed proves nothing.** The ResizeObserver check passed from the day it was written (Day 14)
  while checking nothing. The fix was confirmed only by running it against the old code.

---

## 1. Docs audit

### Missing reports

| Report | Finding |
| --- | --- |
| Day 06 | Was missing. Written today from the author's own notes, with an evidence check (`docs/day-06-report.md`). Its date is not recorded (the repos cannot pin it) |
| Day 01, Day 12 | No report. The author decided on 2026-10-23 that they are not part of this track |
| Day 15 | This report |

### Open items in the earlier reports

Resolved items were marked in place (each now ends with a "Resolved (checked 2026-10-23)" note):

| Report | Item | Resolved by |
| --- | --- | --- |
| Day 03 | Follow-up tickets (box doesn't grow; line breaks) | E1-01 (MR !157) and E1-02 (PR #11) |
| Day 04 | E1-02 waiting on the BA | BA answered 2026-10-22; PR #11 |
| Day 05 | Push the Day 05 branch and open the MR | Merged as `c3e44ce` |
| Day 07 | Mirror PRs #1, #2, #3, #6 to GitLab | Inside GitLab `deep-agents` via MRs !158 and !159 |
| Day 07, Day 08 | Re-check the health checks on the Docker image | Done 2026-10-22; docs fixed in PR #23. (The backup command is still open) |
| Day 09 | Does the automatic review catch a deliberately broken commit? | No: `claude-review` passed on `433da2a`, while CI failed |
| Day 10 | Merge PR #7; delete the seeded-bugs branch | Merged 2026-10-21; the branch is gone everywhere |

**Still open:**

| Report | Item |
| --- | --- |
| Day 03 | Feedback from a real partner; before and after screenshots; Safari with a real Vietnamese keyboard; close GitLab issue #1 by hand (needs the GitLab MCP) |
| Day 04 | Plan-mode use and a hunk comment (the same gap as Checkpoint 2); add `dist/` to the root vitest exclude |
| Day 05 | A Markdown lint config (a team decision) |
| Day 07 | Keep or uninstall the plugin binary; trust `generative-ai/` once; the team's backup command |
| Day 08 | The one console error on page load; the GitLab MCP endpoint (still failing) |
| Day 09 | `@claude hello` on an issue; the Routine and the Desktop task; the `/goal` evaluator verdict |
| Day 10 | Repeat the review comparison on a branch the lead seeds |

## 2. Deploy dry run

`evidence/phase1-deploy.md`. On `main` (`6453964`): the gate passed (typecheck, lint, format, root 115/115, web 110/110,
build), CI was green, and the user confirmed the secrets by name (the `.env` file was never read). The image built in 1
minute 24 seconds with no `.env` inside it (only `.env.example`). All three services came up healthy, and
`smoke-permissions` passed. `smoke-server` failed with 401 (#20). Another difference from the docs: `docker-compose.yml`
builds its own image (`generative-ai-langgraph-api`), not `deep-agents:<sha>` (#21).

## 3. Cross-review detail

- **Dev review of QA's tests:** besides the ResizeObserver check, retries could hide flaky tests (fixed with
  `failOnFlakyTests` in CI), the mock sent only string content, and an unhandled API route would fail silently.
- **QA review of #17:** 14 gaps. Fixed today: a log scrolled far up, a paste of 50 lines, a 320 px window.
  Filed for later (issues #29 to #32): a message arriving while the input grows, WebKit in CI, a failed thread
  restore (needs a BA decision), high-DPR, IME, and the loading state.
- **Review of the fixes:** `/code-review` on both PRs found 1 issue in #24 (a CI concurrency group: queued `main` runs
  could still be replaced) and 5 low documentation issues in #23. All were fixed before merge. (From the session
  record; the review output was not saved as a file.)

## 4. Remote Control

`evidence/phase5-remote-control.md`. The brief asks to approve and steer a session from a phone. The steer is
evidenced. The approval is not: a command that is not on the allow list would have triggered the prompt.

## 5. Artifact log: Claude-assisted, human-edited?

| Artifact | Claude's part | My part | Human-edited? |
| --- | --- | --- | --- |
| Day 15 plan | Scouted and wrote it | Answered 3 questions (playbook source, deploy path, checkpoints); approved it | Decisions only — **not met** |
| Cross-reviews, same-day fixes, release notes | Wrote them (QA and BA roles simulated) | Said "go" for the deploy and the tag; reviewed and merged #23, #24 and the GitLab MR | Approvals and merges — **not met** |
| Demo run-sheet | Wrote it | None | **Not met** |
| Playbook | Wrote it, then added the step-by-step flow when asked | Edited it by hand: removed 3 of the 4 bullets under Sources (doc revisions 11 to 17; the doc history shows the 3 removed list items) | **Met** (a deletion, not a rewrite) |
| Day 06 report | Formatted and graded it | The notes are the author's own text | The text is the author's; the grades are Claude's |
| Old-report notes | Verified and wrote them | Chose to edit the old reports | Choice only — **not met** |
| PR #11 walkthrough, `loop.md` | Wrote them | None | **Not met** |
| This report | Wrote it | Not hand-edited before it was published | **Not met** |

## Open items

- Not done, because each needs the author: the plan-mode diff-comment steering, sharing the PR #11 walkthrough with a peer, the 10-minute demo, a real partner for Day 3's peer swap, and approving a permission prompt from the phone.
- Merge [deep-agents PR #33](https://github.com/nhatduong-agilityio/deep-agents/pull/33) (`loop.md`); the Day 6 row counts as merged evidence after that.
- The final checkpoint is not all green (Days 3 and 6, section "Final checkpoint").
- The still-open items in section 1.
- The retro items (#25 to #28) are filed as issues, not fixed.
