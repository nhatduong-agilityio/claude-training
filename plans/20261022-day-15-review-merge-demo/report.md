# Day 15 cook report

Plan: `plans/20261022-day-15-review-merge-demo/plan.md` · Dates: 2026-10-22 to 2026-10-23

## Phases

| Phase | Result | Evidence |
| --- | --- | --- |
| 1 Deploy dry run | Done | `evidence/phase1-deploy.md`: image built, stack healthy, `smoke-permissions` PASS; `smoke-server` failed with 401 (→ #20) |
| 2 Cross-review | Done (simulated roles) | `evidence/phase2-ba.md`: 16 BA checks, all met; dev review 0 Critical / 7 Warning / 7 Optional; QA review 14 gaps; same-day issues #20, #21, #22 |
| 3 Same-day fixes | Done | PRs #23 (`f508c24`) and #24 (`9d829ac`); #20–#22 closed; CI on `main` green |
| 4 Tag, release, deploy | Done | `v0.1.0` (annotated, on `9d829ac`), GitHub release, redeploy, health and smoke pass, GitLab MR !159 merged as `6d673e8` (`evidence/phase4-release.md`) |
| 5 Remote Control demo | Done, partly | `evidence/phase5-remote-control.md`: task and steer from the phone; approving a permission prompt is not evidenced |
| 6 Demo run-sheet | Done | https://claude.ai/artifact/F7BB9AkRgXjS3o1bX7BQvM, 9 minutes, links checked with `gh api` |
| 7 Retro to issues | Done | 12 issues, all assigned: deep-agents #25–#32, claude-training #8 and #9, nhat-kit #41 and #42 |
| 8 Playbook | Done; hand-edited by the author | https://claude.ai/artifact/XTMCeoMNS5zH6b6C3PerWo; the author removed 3 of 4 Sources bullets (doc revisions 11 to 17) |
| 9 Final checkpoint and report | Done; checkpoint **not all green** | `evidence/checkpoint-map.md`; `docs/day-15-report.md`; `docs/day-06-report.md`; resolved-item notes in 7 older reports |

## Files changed (claude-training, branch `docs/day-15-report`)

- New: `docs/day-06-report.md`, `docs/day-15-report.md`, `plans/20261022-day-15-review-merge-demo/` (plan, this report).
- Edited: `docs/day-03-report.md`, `day-04`, `day-05`, `day-07`, `day-08`, `day-09`, `day-10` (9 lines, resolved-item notes).
- deep-agents: `.claude/loop.md` in PR #33 (closes the Day 6 `loop.md` gap once merged).

## Review

- Fact-check by `devkit:code-reviewer` of the new reports and the resolved-item notes: 0 Critical, 4 Warnings, 2
  Optional. Every other number, SHA, PR, issue and CI run checked out. Fixed:
  - the MR !159 date in the Day 07 note (2026-10-22, not 10-23), as its own commit;
  - the run-sheet claim "every link checked", now limited to the GitHub links checked with `gh api`;
  - claims with no saved source (the `/code-review` counts, the Sources bullets): sourced or labelled "from the session
    record";
  - "all 4 rows" for Day 11: worded to say the role-day row has two parts.
- Also found while fixing: my own "4 errors" figure for the ResizeObserver check was wrong. The Playwright diff said
  `Received + 4`, which counts diff lines; re-running shows 2 errors per browser. Corrected in the Day 15 report and in
  the published PR #24 report (version 2).

## Closing the gaps (2026-10-23)

- Done: `loop.md` (deep-agents PR #33, CI green); a PR walkthrough artifact (PR #11 Walkthrough); the Day 6 date stated
  as "not recorded"; every `TODO` in the Day 15 report replaced by a final state; the size gate met by splitting the
  docs into three PRs.
- Simulated peer review (a fresh Claude instance given only the pages) of the PR #11 walkthrough and the demo run-sheet:
  8 findings, all fixed; it also surfaced that Docker holds the API only (no frontend host), now stated in the reports.
  A simulation: it does not count as a real peer or as the demo.
- Not done, because each needs the author: plan-mode diff-comment steering, sharing the walkthrough with a peer, the
  10-minute demo, a real partner's Day 3 feedback, and approving a permission prompt from the phone.

## Out-of-scope issues found

- The still-open items in the older reports are listed in `docs/day-15-report.md` section 1.
- Retro and backlog issues: deep-agents #25–#32, claude-training #8 and #9, nhat-kit #41 and #42.

## Process notes

- `claude remote-control --help` started a real session instead of printing help (stopped at once).
- A zsh `$ref:path` modifier produced empty files in a mutation loop; re-run with `${ref}` (claude-training #9).
