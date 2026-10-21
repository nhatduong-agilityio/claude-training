# Day 10: review and quality
Status: in-progress · Source: Claude Code course, Developer track, Day 10 + the Day 10 report template (both pasted by the user, 2026-10-20)

## Goal
Day 10: score `/code-review` (two effort levels) and ultrareview (`/code-review ultra`) against a known answer key on a
seeded-buggy branch, walk through the security plugins on that same branch, and close a real hook branch through
`/code-review` → fixes → green PR #7. The day ends with an honest report in `claude-training/docs/`.
Day 11 has its own plan: `plans/20261020-day-11-role-day-web/plan.md`.

## Definition of done: the Day 10 report template
The report (Phase 7) fills the user's template line by line. Each placeholder below has a phase that produces it.
A line whose evidence doesn't exist is written as `TODO`, never filled from memory.

| Template line | Filled by | Evidence |
| --- | --- | --- |
| /code-review on a real branch: [branch name]. Findings: [number, type, how many valid] | Phase 6 | `fix/hook-optional-gaps`; `evidence/cr-real.md` + classification table |
| Ultrareview on the seeded-buggy branch "prepared by the lead" | Phase 3 | Reworded: "seeded by me (simulated): no lead branch existed" (`CLAUDE.md` never-do #3) |
| Compared signal with /code-review: [ultra-only catches, /code-review-only catches, time and cost] | Phase 3 | Scoring table vs `seeded-answer-key.md`; `cr-low/high/ultra.md` |
| Ran /security-review before committing | Phase 6 | `/security-review` output saved before the final commit, with the commit SHA that followed |
| security-guidance, Claude Security scan: [installed / reviewed, what they flagged] | Phase 4 | Security table, keep/remove verdicts |
| Used the Day 3 review-checklist skill on every review | Phases 5–6 | Skill on the PR branch; the transcript shows it loaded on the real-branch review |
| Fixed what the review found; PR is green: [PR link] | Phase 6 | PR #7 URL; `gh pr checks` output + local test run |
| False positives for the retro: [list or "none"] | Phases 3, 4, 6 | The FP rows of every classification table |
| 4 takeaways | Phase 7 | Each one is backed by a number from this day, or reworded to what the evidence shows |

## Decisions
User, 2026-10-20:
- Seeded-buggy branch: **I seed one myself**. It is labelled "simulated: not the lead's branch" everywhere.
- Real branch for `/code-review` and the "fix → PR green" exercise: **close some of the 11 Optional gaps in
  `block-forbidden-command`**.

Defaults in this plan (change them before approving if needed):
- **Report flow (user, 2026-10-20): GitHub PR** on branch `docs/day-10-report`. `CLAUDE.md` still describes the
  GitLab MR flow, so the Day 10 reports PR updates its Conventions (branch → GitHub PR into `main`; merge commit
  `Merge pull request #<n> from …`) in the same commit.
- **Effort comparison:** run `/code-review` at `low` and at `high` (this covers the "ultrathink + /effort" skill).
  Don't add a third local run.
- **`review-checklist` skill:** required (it is in the report template). It ships as the **first commit of PR #7**
  on `fix/hook-optional-gaps`, so the review of that branch can load it. Seeded-branch runs (Phases 3–4) use the
  built-in tools as they are, to keep the comparison about the tools.
- **AI-native SDLC playbook course:** out of scope (it is for leads and seniors).

## Context found
- deep-agents (`generative-ai/`, remote `github` = `nhatduong-agilityio/deep-agents`, **public**): on `main`, clean.
  PRs #1–#6 are all merged. There is no seeded or "lead" branch.
- `.github/workflows/` contains only `claude.yml` (`@claude` mentions) and `claude-code-review.yml` (automatic PR
  review). **There is no test CI.** "PR green" therefore means `gh pr checks` passing *plus* the local test run
  (Phase 6).
- `.claude/hooks/check-before-commit.sh` runs `pnpm typecheck && pnpm lint` before every `git commit` and blocks the
  commit on failure. `block-forbidden-command.sh` blocks `--no-verify`. So every seeded bug must type-check and lint
  clean.
- `block-forbidden-command.sh` is 249 lines; its table test `block-forbidden-command.test.sh` is 98 lines. The open
  Optional gaps are in `plans/20261019-day-07-09-extend-automate/evidence/hook-pr/report.json` (5 items grouping 11
  cases): `export HUSKY=0` / `git config core.hooksPath` / `GIT_CONFIG_*` (plus a false positive on
  `-c core.hooksPath=.husky/_`); wrappers with their own options (`nice -n 10`, `sudo -u`, `env -i`); `xargs`, `.env*`
  globs and `--include=.env`; `cd` forms and `cp -t`; `<<\EOF`, `bash script.sh -c`, `$(…)` refspec.
- `generative-ai/CLAUDE.md:81` describes the hook. Update it if the behavior it lists changes.
- Day 03 review checklist order (`docs/day-03-report.md:252`): correctness → tests → readability → security basics →
  scope.
- Plugins (checked in `~/.claude/plugins/marketplaces/claude-plugins-official/plugins/`):
  - `security-guidance` 2.0.14 is hooks only: regex warnings on Edit/Write, an LLM diff review on Stop, and an agentic
    reviewer on `git commit`. It needs `python3` and a sign-in.
  - `claude-security` 0.12.0 is the in-session version of the "Claude Security" product: `/claude-security` → Scan
    codebase / **Scan changes** / Suggest patches. Each scan has an effort tier and asks you to confirm its cost. It
    writes a `CLAUDE-SECURITY-<ts>/` directory **into the repo**.
  - `code-review` and `pr-review-toolkit` exist too, but are not used here.
- Built-ins: `/code-review [low…max|ultra]` and `/security-review`. Ultra is **user-triggered and billed**; I can't
  launch it. The no-argument form bundles the local branch, so no push is needed.
- Claude Code 2.1.286. Claude in Chrome: no `mcp__claude-in-chrome__*` tools are in this session yet. Playwright MCP
  was set up and used on Day 08.
- Day 09 finding: hooks and plugins load only in a session **started in** `generative-ai/`. Headless `claude -p` runs
  them (that is how `/goal` ran).
- The `claude-training/plans/*/evidence/` folder is ignored via `.git/info/exclude`. `generative-ai/` sits inside
  `claude-training/`, so a session started in `claude-training/` can read the answer key.
- The account was at 91% of its 7-day limit on 2026-10-19.

## Approach
Score each review tool against a ground truth. Phase 2 writes the answer key first, outside `generative-ai/`, with a
timestamp. Then every review of the seeded branch runs in a **fresh session whose working directory is
`generative-ai/`**, so no reviewer can see the key. The seeded branch is never pushed. The real hook branch follows
the normal flow: test first, review, fix, PR, then `/loop` babysits the checks.

Rejected:
- Asking the lead for the branch: the user chose to self-seed.
- Comparing ultra on the seeded branch with `/code-review` on the real branch: different inputs give no comparable
  signal.
- Adding a test CI workflow so that "green" means more: that is out of scope, and the report says CI runs no tests.
- Pushing the seeded branch for a PR-number ultra run: the repo is public, and the no-argument form works locally.

## Phases

### Phase 1 — Preconditions (riskiest: billed and external)
- [x] Dev: run `/usage` and confirm (a) quota is left for one ultra run plus about 3 local reviews, and (b)
      `/code-review ultra` is available on this claude.ai account. Record the answer
- [x] Probe headless review on a trivial diff: from `generative-ai/`, run
      `claude -p "/code-review low" --output-format json` on a throwaway branch with a one-line change. Record whether
      it returns findings text, plus its cost and duration. Delete the branch
- Verify: a 2-row table in `plans/20261020-day-10-11-review-quality/evidence/preconditions.md`, each row yes/no with
  evidence. **Stop and re-plan** if ultra is unavailable or quota is too low (Phase 3 would then drop the ultra column
  and the report would say so).

### Phase 2 — Seeded-buggy branch (simulated) and answer key
- [x] Read `apps/api` and `apps/web` and pick 6 bugs that pass typecheck, lint and tests, as realistic "tired human"
      bugs: at least **2 security** (e.g. missing auth or ownership check, path traversal, unsafe input in a query or
      shell call), 1 off-by-one or boundary, 1 async (missing `await` or unhandled rejection), 1 logic inversion, and
      1 state or cleanup bug
- [x] Write `evidence/seeded-answer-key.md` **before any commit**: id, file:line, class, severity, a one-line
      description, and the exact check that proves it. Record `date -u` and `shasum -a 256` of the file
- [x] Branch `review/seeded-bugs` from `github/main`. Make 2–3 commits with **neutral** messages (e.g.
      `refactor(api): simplify thread lookup`). No code comment may hint at a bug
- Verify: on the branch, `pnpm typecheck && pnpm lint && pnpm test` passes. `git ls-remote github review/seeded-bugs`
  is empty. `git log --format=%s github/main..` shows only neutral subjects. `git grep -n -i "bug\|seed" github/main..`
  finds no new hits. The key has 6 rows.

### Phase 3 — Compare signal on the seeded branch (Day 10 core)
- [x] Fresh session in `generative-ai/` on `review/seeded-bugs`: run `/code-review low`, then `/code-review high`
      (headless if Phase 1 showed it works, otherwise the dev runs them interactively). Save each output to
      `evidence/cr-low.md` and `evidence/cr-high.md`, with time and cost
- [x] Dev: run `/code-review ultra` (no argument) in a fresh `generative-ai/` session on that branch. Save the result
      to `evidence/cr-ultra.md`, with time and cost from the launch dialog and the result
- [x] Score each run against the key: a TP is a finding that names the seeded file and mechanism. Count FN and FP, and
      label every FP "valid but not seeded" or "wrong". Add a severity-weighted catch rate
- Verify: the scoring table has one row per key item × 3 runs and one row per reported finding, with none unclassified.
  Totals are recomputed by a command (`grep -c`), not by hand.

### Phase 4 — Security plugins walkthrough (same branch)
- [x] Fresh `generative-ai/` session: run `/security-review` (built-in) and save the output
- [x] `claude plugin install claude-security@claude-plugins-official --scope local` (in `generative-ai/`), then
      `/claude-security scan my branch at medium` (accept the stated cost only if it fits the Phase 1 quota). Copy
      `CLAUDE-SECURITY-*/CLAUDE-SECURITY-RESULTS.md` to `evidence/`, then delete the directory from the repo
- [x] Install `security-guidance` at local scope. On a scratch branch from `github/main`, re-apply **one** seeded
      security bug in a headless `generative-ai/` session and ask it to commit. Capture what the Edit-time pattern
      warning and the commit reviewer report. Delete the scratch branch
- [x] Score all three against the key's security rows (TP, FN, FP), and record mechanism, cost and friction. Give each
      a keep/remove verdict. Disable `security-guidance` again unless the verdict is keep (its Stop review costs money
      every turn)
- Verify: `git -C generative-ai status --porcelain` is empty (no `CLAUDE-SECURITY-*` left). `claude plugin list`
  matches the verdicts. The security table covers every security key row × 3 tools.

### Phase 5 — Real branch: `review-checklist` skill, then close hook Optional gaps (test first)
- [x] Branch `fix/hook-optional-gaps` from `github/main`
- [x] Commit 1: `.claude/skills/review-checklist/SKILL.md` from the Day 03 checklist (`docs/day-03-report.md:250-338`:
      correctness → tests → readability → security basics → scope; each comment = location + problem + suggestion;
      test each suspicion before writing it down). The description triggers on "review", "check my branch/PR/diff".
      Add a `!.claude/skills/review-checklist/` exception to `.gitignore` and list the skill in `CLAUDE.md`
- [x] Add failing table rows first for 3 gap groups: (a) `export HUSKY=0`, `git config core.hooksPath …`,
      `GIT_CONFIG_*` env, plus an allow row for `-c core.hooksPath=.husky/_` (the false positive); (b) wrappers with
      options: `nice -n 10`, `sudo -u x`, `env -i`; (c) `xargs cat` on `.env`, `.env*` globs, `grep --include=.env`.
      Run the test and record the red rows
- [x] Fix `block-forbidden-command.sh` so the rows pass. Keep the "never block blindly" rule. Update
      `generative-ai/CLAUDE.md:81` if the listed behavior changes
- Verify: `git check-ignore .claude/skills/review-checklist/SKILL.md` prints nothing (the file is not ignored). A fresh
  `generative-ai/` session asked "Which project skills are available? Names only." lists `review-checklist`.
  `bash .claude/hooks/block-forbidden-command.test.sh` exits 0, and the new rows were red before the fix (the output of
  both runs is saved). The other 2 gap groups are listed as still open.

### Phase 6 — `/code-review` the real branch, fix, PR #7 green
- [x] Fresh `generative-ai/` session: run `/code-review high` on `fix/hook-optional-gaps` and save it to
      `evidence/cr-real.md`. Then, in the same kind of session, run "review this branch with the review-checklist
      skill" and save that to `evidence/checklist-real.md`. Classify every finding from both as valid / false positive
      / nit, with a reason; mark which pass found it. Keep the false positives for the retro
- [x] Fix the valid findings, adding table rows first. Then run `/security-review` **before** the final commit, save
      its output with a timestamp, and fix anything valid it finds
- [x] Commits: `feat(claude): add review-checklist skill` (Phase 5) and `fix(claude): close hook bypass gaps for
      hooksPath, wrappers, xargs`. **Ask before push**, then `gh pr create --base main`. Build and publish the PR report artifact (memory rule) and link it in the body
- [x] Babysit with `/loop 5m` (re-run `gh pr checks <n>` and react to `@claude` review comments). Stop when all
      checks pass. Classify the `@claude` comments the same way
- Verify: `gh pr checks <n>` shows all checks passing; locally the table test, `pnpm typecheck` and `pnpm lint` exit 0.
  Every `/code-review`, checklist and `@claude` finding is classified. The `/security-review` timestamp is earlier
  than the final commit's (`git log -1 --format=%cI`). The report states that CI runs no tests.

### Phase 7 — Day 10 report (fills the template)
- [x] `docs/day-10-report.md` (drafted; ultra column TODO): the header lines (`**Date:**`, `**Author:**`, Repo, Plan), then `## Summary` with the
      template's sections in order: `/code-review`, Ultrareview, Security plugins, review-checklist skill, Exercise,
      Takeaways. Every placeholder is replaced by the value from the definition-of-done table
- [x] Below the summary, add the detail sections behind those lines: seeded branch (labelled simulated; a key
      summary without exploit details), the 3-run scoring table and the low-vs-high effort delta, the security table
      and verdicts, the PR #7 classification tables, the `/loop` note, and open items
- Verify: `grep -n "\[" docs/day-10-report.md` shows no template placeholder left (only links). `grep -c "^## "` ≥ 5.
  Every number traces to an `evidence/` file or PR URL. Anything not run is marked `TODO`.

### Phase 8 — Day 10 reports PR
- [ ] Branch `docs/day-10-report`. Update `CLAUDE.md` Conventions to the GitHub PR flow in the same commit as the
      report; commit; **ask before push**; `gh pr create --base main`. Build and publish the PR
      report artifact
- [ ] Ask the dev whether to delete the local `review/seeded-bugs` branch
- Verify: `npx markdownlint-cli2 "docs/day-10-report.md"` shows no rule types beyond the known MD013. The PR URL is
  returned.

Day 11 (role day, Checkpoint 3) moved to `plans/20261020-day-11-role-day-web/plan.md`.

## Risks
| Risk | Signal | Mitigation |
| --- | --- | --- |
| **High:** quota runs out mid-day (ultra, claude-security, security-guidance Stop review, `@claude` all bill) | `/usage` near 100%; a run refused | Phase 1 gate; ultra once; `security-guidance` disabled after the test; claude-security at medium only |
| **High:** the answer key leaks to a reviewer, inflating its score | A reviewer quotes key wording, or its cwd is `claude-training/` | Fresh sessions with cwd `generative-ai/` only; key outside it; neutral commits; Phase 2 grep check |
| **High:** seeded bugs pushed to the public repo | `git ls-remote` shows the branch | Never push it; the `block-forbidden-command` push rules don't cover it, so the Phase 2 verify checks it |
| Self-seeded bias: the same model family plants and reviews the bugs | Very high or very low scores | State the bias in the report; label it simulated; the lead's real branch stays a TODO |
| Headless `/code-review` not supported | Phase 1 probe fails | The dev runs it interactively and pastes the output |
| A hook fix breaks existing rows or blocks legitimate commands | Table test red; the live session gets blocked | Test first, and keep all 33 old rows |
| `claude-security` leaves files in the repo | `git status` not clean | Copy, delete, then the Phase 4 verify |

## Out of scope
- The AI-native SDLC playbook course; the BA/QA track; Day 11 (separate plan).
- A test CI workflow for deep-agents.
- The remaining 2 Optional gap groups (`cd`/`cp -t`; `<<\EOF`, `bash -c` scripts, `$(…)` refspec).
- Fixing the GitLab MCP endpoint and a markdownlint config.
- Merging PR #7 (the dev merges).

## Notes on this plan
- Scouting was done inline (one small repo, already mapped on Days 07–09), and the plan was written directly, not by
  the planner subagent. The advisor reviewed the approach before writing. Not red-teamed; run
  `/devkit:plan red-team <this file>` if wanted.
