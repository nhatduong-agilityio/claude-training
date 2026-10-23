# Day 15: Review, merge, demo — Final checkpoint
Status: done · Source: Claude Code course, Day 15 (pasted by the user, 2026-10-22) + user answers 2026-10-22

## Goal
The capstone (deep-agents chat UI, E1-01 to E1-03 and the follow-ups) gets four things:
- a cross-review from three angles, with any gaps filed as same-day tickets;
- a release tag `v0.1.0`, deployed with the self-hosted Docker path and checked for health;
- a Remote Control session approved and steered from a phone;
- a 10-minute demo of the flow: ticket → plan → PR → review → tests → artifact → shipped.

Also: retro outcomes become repo issues with an owner, and a one-page personal playbook built from `nhat-kit` is
shared as an artifact. The final checkpoint maps the Day 3, 6 and 11 checklists to evidence, green or gap. The Day 15
report is merged.

## Definition of done (from the Day 15 brief)
| Brief line | Phase | Evidence |
| --- | --- | --- |
| Cross-review: dev reviews QA's test code | 2 | Review notes on `apps/web/regression/` (#19), with findings fixed or filed |
| QA reviews a dev PR | 2 | A QA-angle review of #17 (app code), with test gaps fixed or filed |
| BA checks merged behavior against the ACs; gaps become same-day tickets | 2–3 | Each AC of E1-02, E1-03 and #14 checked on `main` in a browser, met or gap; gap issues opened and closed the same day |
| Merge, tag a release, run the deploy | 1, 4 | `v0.1.0` tag + GitHub release; Docker stack up; `/ok` 200 with auth; `pnpm smoke-server` passes; rollback written down |
| Remote-Control/Dispatch demo from a phone | 5 | The user approves a permission prompt and steers a session from the Claude mobile app; a screenshot or note |
| Demo, 10 minutes, the flow and not slides | 6 | A demo run-sheet artifact walking E1-02 (#8) from ticket to shipped, with real links |
| Retro: what to standardize, as repo issues owned by named people | 7 | Issues in deep-agents (or nhat-kit for kit items), each assigned to `nhatduong-agilityio` |
| Personal playbook (one page), shared as an artifact | 8 | Published artifact built from `nhat-kit` (skills, agents, hooks, guardrails) + the Day 2–14 reports |
| Final checkpoint: capstone shipped; Day 3/6/11 checklists green | 9 | Checklist table: each item → evidence link or gap; Day 15 report PR merged |

## Decisions
User, 2026-10-22:
- **nhat-kit:** used as the source for the playbook only. No fixes to the kit today.
- **Deploy:** the self-hosted Docker path (`docs/deploy.md` §2 + `.claude/skills/release-checklist`), on this Mac.
  The user starts Docker Desktop. `.env` values are never read or printed (the deny rule plus CLAUDE.md rule 2).
- **Checkpoints:** the user pastes the Day 3 and Day 6 checklist items. Day 11 is already recorded
  (`docs/day-11-report.md:62`, "Developer Checkpoint 3: completed").

Defaults (change before approving if needed):
- **Roles:** this is a solo track. The QA and BA reviews are done by Claude and labelled by role, and the user
  approves each one. Anything role-played is labelled "simulated", per CLAUDE.md rule 3.
- **Release name:** `v0.1.0` on deep-agents `main`, the first tag. The release notes reuse the Day 14 notes doc,
  written for clients.
- **GitLab:** the routine sync of #18, #19 and the tag goes after the release (an MR, asked first).

## Context found
- deep-agents `main` = `6453964`. There are no tags or releases. CI runs on every PR and on pushes to `main`
  (`.github/workflows/ci.yml`).
- `docs/deploy.md`: LangSmith Deployments or self-hosted Docker. Docker builds the image tagged with the git SHA
  (`langgraphjs dockerfile`). The backup command is a TODO in the doc.
- `docker-compose.yml`: `langgraph-redis`, `langgraph-postgres` (pgvector pg16), `langgraph-api` (port mapping at
  `:35`), `llm-guard` (`ghcr.io/protectai/llm-guard-api:latest`).
- `docs/runbook.md`:
  - Health check: `GET /ok` with `Authorization: Bearer $AUTH_TOKEN` gives 200, and 401 without it.
  - Smoke test: `pnpm smoke-server`.
  - Rollback: §3.
- Docker 29.4.0 is installed, but the daemon is not running.
- `.claude/skills/release-checklist/SKILL.md` covers the gate, secrets by name, backup, API before the frontend,
  health and smoke, and rollback. It stops before every deploy, push and tag.
- The devkit skills `deploy`, `retro`, `review` and `check` are available (`claude-kit/plugins/devkit/skills/`).
- Remote Control: `claude --remote-control [name]` starts a session that can be controlled from claude.ai/code or the
  Claude mobile app. `claude remote-control` starts one too.
- nhat-kit:
  - It is `github.com/nhatduong-agilityio/nhat-kit`, public. Its local clone is `../claude-kit`, 15 commits behind
    `origin/main`, so pull first.
  - It holds devkit v2.6.0: 18 skills, 10 agents, hooks, templates, `CLAUDE.md`, `UPSTREAM.md`, proposals.
- Checkpoints:
  - Only Checkpoint 3 is recorded.
  - There is no `docs/day-06-report.md`.
  - The Day 3 report has no checkpoint section.

## Approach
Run the riskiest part first: a deploy dry run of current `main` on Docker. The image build, `llm-guard`, the
Postgres volume or `/ok` with auth could each fail for reasons that have nothing to do with code, and they need time.
Then the three-angle cross-review. Any gap becomes a same-day issue, is fixed test-first, and is merged with CI green.
Then tag, release, final deploy and health. The Remote Control demo, the demo run-sheet, the retro issues and the
playbook come next. The final checkpoint and the Day 15 report close the day.

Rejected:
- LangSmith Deployments: the user chose local Docker. It may also need a paid plan.
- Tag without a deploy: the brief says "run the deploy".
- A separate QA or BA person: none exists on this solo track. The roles are labelled instead.

## Phases

### Phase 1 — Deploy dry run on Docker (riskiest)
- [x] User: start Docker Desktop. Check: `docker info` exits 0
- [x] Follow `release-checklist` up to the deploy:
      - the gate: CI green on `main`, `pnpm typecheck && pnpm test`;
      - secrets: `.env` keys checked **by name only** (`grep -c '^KEY=' .env`, never values; if the deny rule
        blocks it, the user checks);
      - a backup step, or the TODO noted.
- [x] `docker build -t deep-agents:$(git rev-parse --short HEAD) .`, then `docker compose up -d`
Result: see `evidence/phase1-deploy.md`. The stack is healthy and auth works; smoke-server fails (no token in the script), so it becomes a same-day ticket.
- Verify:
  - `docker compose ps` shows all services healthy or running.
  - `/ok` returns 200 with auth and 401 without; the user supplies the header through `--env-file`, and the token
    never appears in output.
  - `pnpm smoke-server` passes.
  - If a service fails, the logs are captured and the fix or TODO recorded before Phase 4.

### Phase 2 — Cross-review (three angles, simulated roles)
- [x] **Dev reviews QA's test code** (`apps/web/regression/`, `mock-api.ts`, `ci.yml`): `/code-review` plus a
      reading for false passes, missing negative cases, and mock drift from the real API (compare the shapes with
      the Day 13 server log)
- [x] **QA reviews a dev PR** (#17, the `App.tsx` and `theme.css` changes): which behaviours have no test, which
      only jsdom tests; a list of the test gaps
- [x] **BA checks merged behavior on `main` against the ACs:**
      - every AC in the E1-01, E1-02 and E1-03 SPECs and the #14 issue;
      - checked in the running app (Playwright, plus the Docker stack from Phase 1 for a real reply);
      - each one met or gap, with evidence.
Result: all 16 ACs met (`evidence/phase2-ba.md`). The dev review found 7 warnings and 7 optional items; the QA review found 14 gaps. Same-day issues: #20 (smoke-server auth), #21 (deploy docs), #22 (regression hardening). The rest goes to the backlog in Phase 7.
- Verify: a table per angle with each item and its evidence. Each gap → `gh issue create` with the label
  `same-day`. The count is reported, 0 if none.

### Phase 3 — Fix the same-day tickets
- [x] For each gap issue: a branch, a failing test first, the fix, `/code-review`, a PR, CI green, and the user
      merges. The issue closes the same day
- Verify: `gh issue list --label same-day --state open` is empty, and `gh run list --branch main -L 1` is green.

### Phase 4 — Tag, release, deploy
- [x] `git tag -a v0.1.0` on `main` (asked first). Then `gh release create v0.1.0`, with notes from the Day 14
      release notes doc (the client sections only) and the merged PR list
- [x] Rebuild the image at the tagged SHA and deploy it (`docker compose up -d`), API first. Then health and smoke as
      in Phase 1
- [x] Rollback: record the previous image tag and the exact rollback commands (`docs/runbook.md` §3). Run them only
      if the health check fails
- [x] GitLab sync of #18, #19 and the tag: an MR, asked first
- Verify:
  - `gh release view v0.1.0` exists.
  - `docker image ls deep-agents` shows the tagged SHA.
  - `/ok` returns 200 with auth, and `smoke-server` passes on the deployed stack.

### Phase 5 — Remote Control demo (user on the phone)
- [x] User: in a terminal, run `claude --remote-control day15-demo` in deep-agents. On the phone (Claude app → Code),
      open the session and give it a small, safe task, for example running `pnpm test` and summarizing it
- [x] (partly) When a permission prompt appears (the Bash command), approve it from the phone. Then steer it with one
      follow-up message from the phone
Result: see `evidence/phase5-remote-control.md`. Task and steer message done from the phone; approving a permission prompt is not evidenced (the commands were pre-allowed).
- Verify: the user's screenshot or note (time, task, prompt approved, steer message), plus the session's result in
  the terminal.

### Phase 6 — Demo run-sheet (10 min, the flow)
- [x] An artifact run-sheet for E1-02:
      - the ticket (GitLab #9 → GitHub #8);
      - plan mode;
      - the SPEC with BA answers;
      - the red test `28fdef3` → the fix;
      - review;
      - PR #11 with its report artifact;
      - the CI regression job;
      - the release `v0.1.0` and the deploy.

      Each step gets a minute budget, the exact link or command to show, and a fallback if something is down.
Result: https://claude.ai/artifact/F7BB9AkRgXjS3o1bX7BQvM. 9 steps, 9 minutes, every link checked with `gh api`.
- Verify: the artifact is published; every link resolves (`gh pr view`, `git show`); the minutes add up to ≤ 10.

### Phase 7 — Retro → owned issues
- [x] Run the devkit `retro` skill over Days 2–15 (the reports, takeaways, "not met" rows and process slips). Pick
      what to standardize:
      - CLAUDE.md rules (for example `&&` check-then-commit, never `git checkout --` over uncommitted work);
      - skills or hooks (for example web `tsc` in the commit hook; `claude-review` retry on 429);
      - the review checklist.
- [x] Create one issue per item in the repo that owns it: deep-agents, claude-training, or nhat-kit for devkit
      items. Each is assigned to `nhatduong-agilityio` with a "retro" label
Result: done by hand, because the devkit `retro` skill is not installed in this session. 12 issues, all assigned to `nhatduong-agilityio`:
- deep-agents: `retro` #25–#28 and `backlog` #29–#32;
- claude-training: `retro` #8 and #9;
- nhat-kit: `retro` #41 and #42.
- Verify: `gh issue list --label retro` in each repo lists them, each with an assignee.

### Phase 8 — Personal playbook from nhat-kit (one page, artifact)
- [x] `git -C ../claude-kit pull --ff-only`. Scan the devkit `README`/`CLAUDE.md`, the skill descriptions, agents,
      hooks and `UPSTREAM.md`, plus this week's reports
- [x] Write a one-page "How I work with Claude": favourite workflows (plan → cook → ship, task/issue queue,
      worktrees), prompts that worked, guardrails (hooks, deny rules, test-first, PR report, ask before push), and
      what not to do (from the retro). Each item links to its source in nhat-kit or a report
- [x] The user edits it. That edit is the human-edit evidence (done 2026-10-23: the user deleted 3 of the 4 bullets in "Sources"; doc revisions 11 → 17)
Draft: https://claude.ai/artifact/XTMCeoMNS5zH6b6C3PerWo, about 430 words. User edit seen in the doc history (revision 17); the playbook now cites only `nhat-kit` under Sources, so the "every claim cites a source" check below is only partly met.
- Verify: the artifact is published, it fits one page (about 600 words or fewer), and every claim cites a kit
  file or a report.

### Phase 9 — Final checkpoint + Day 15 report
- [x] User: paste the Day 3 and Day 6 checklists. Map every item of Days 3, 6 and 11 to evidence (a report section,
      PR or commit) as green or gap; a gap is never written as green
- [x] "Capstone shipped end-to-end": `v0.1.0` released and deployed, with health evidence
- [x] `docs/day-15-report.md`, on branch `docs/day-15-report`:
      - the cross-review;
      - the same-day tickets;
      - the release and deploy;
      - the Remote Control demo;
      - the demo run-sheet link;
      - the retro issues;
      - the playbook link;
      - the final checkpoint table;
      - takeaways.

      Commit, ask before the push, and open the PR with its report artifact
Result: the checklists were pasted on 2026-10-23. Day 11 is green; Day 3 and Day 6 have gaps (`evidence/checkpoint-map.md`), so the checkpoint is not all green. Docs audit added at the author's request: Day 06 report written, resolved items marked in 7 older reports.
- Verify:
  - `grep -c "^## " docs/day-15-report.md` ≥ 6.
  - markdownlint shows MD013 only.
  - Every checkpoint row has evidence or is marked gap.
  - The PR URL is returned.

## Risks
| Risk | Signal | Mitigation |
| --- | --- | --- |
| The Docker stack fails (image build, `llm-guard` pull, Postgres volume, missing env) | `compose ps` unhealthy or `/ok` failing | Phase 1 first; capture logs; fix or record a TODO; the deploy waits until it is green |
| A secret leaks while checking `.env` or the auth header | Token text in output or logs | Names only; the header comes from an env file; output is grepped for the key prefix before anything is shared |
| The tag or release is wrong or early | A tag on a red commit | Tag only after Phase 3, with CI green on that SHA; asked first |
| Remote Control can't run (plan, app, network) | No session on the phone | Record why with the error; it is the user's demo step |
| Simulated roles are presented as real people | No role label | Every QA/BA review is labelled "Claude as QA/BA, simulated, approved by the user" |
| The checkpoint is claimed green without evidence | A row with no link | Rows without evidence are "gap"; the user's checklist text is quoted |
| The playbook runs past one page | > 600 words | Cut to the top items; detail stays in the links |

## Out of scope
- Fixes to nhat-kit (user decision); LangSmith Deployments; production hosting beyond this Mac.
- Writing a missing Day 06 report after the fact (the checkpoint maps evidence; it does not backfill a report).

## Notes on this plan
- Mode: standard (no flag). Scouting was done inline. A first try at `claude remote-control --help` started a real
  session and was stopped right away; no session stayed open. Not red-teamed.
