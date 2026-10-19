# Days 07–09: skills, plugins, MCP, hooks and automation
Status: in-progress · Source: Claude Code course, Developer track, Days 07–09 (pasted by the user, 2026-10-19)

## Goal
Encode team know-how in `deep-agents/.claude/` and ship it through GitHub PRs: a
`release-checklist` skill and a `/standup` command (Day 07), and a `block-forbidden-command` hook
(Day 09). Use MCP end to end (GitHub, Playwright; Day 08), get the `@claude` review Action running on a PR,
and write an honest Day 07/08/09 report in `claude-training/docs/` for each day.

## Decisions (user, 2026-10-19)
- Target repo for `.claude/` work and the `@claude` Action: **deep-agents** (local clone
  `claude-training/generative-ai`, remote `github` = `nhatduong-agilityio/deep-agents`).
- PR host for that work: **GitHub PRs**, base `main` (on GitHub it already holds the `deep-agents` content,
  `c42c2db`).
- Team skill: **release-checklist**.
- Defaults chosen in this plan (change them before approving if needed): personal command `/standup`;
  Day 09 hook `block-forbidden-command` (`format-on-edit` already exists); plugin to evaluate:
  TypeScript LSP (code intelligence); Day reports keep the claude-training GitLab MR flow.

## Context found
- `generative-ai/.claude/` already has `settings.json` (permissions plus 2 hooks), `hooks/format-on-edit.sh`,
  `hooks/reinject-context.sh`, `skills/verify/SKILL.md`, `commands/{start-task,finish-task,ddr}.md`,
  `agents/ui-verifier.md`. Follow their frontmatter and style.
- `generative-ai/.gitignore:6-7`: `.claude/skills/*` is ignored except `verify/`. A new team skill
  needs its own `!` exception or it never reaches the PR.
- `generative-ai/CLAUDE.md:44-48` says "Integration branch is `deep-agents`" and "Remote is self-hosted
  GitLab (MRs, not PRs)"; `:76-82` lists the `.claude/` contents. Both must be updated in the same
  commit as the change (conventions: a convention change and a stale `CLAUDE.md` never ship separately).
- `generative-ai/settings.json` `deny` already blocks `git push --force/-f`, and `ask` covers `git push *`.
  The hook should cover what deny rules can't express (see Phase 7).
- Release source material: `docs/deploy.md` (3 deploy paths, runtime secrets by name, Docker SHA tag),
  `docs/runbook.md:78-160` (rollback, DB-volume warning, `/ok` and `/info` health checks,
  `pnpm smoke-server`, `pnpm smoke-permissions`, `pnpm test:e2e`), `package.json:6-21` scripts,
  `.claude/skills/verify/SKILL.md` (pre-release gate).
- No `.github/` in deep-agents yet; the only PR/MR template is `.gitlab/merge_request_templates/Default.md`.
- MCP (`claude mcp list`, 2026-10-19): `github` ✔ connected (user scope); Playwright not installed;
  GitLab ✘ (endpoint not found). `gh` is logged in as `nhatduong-agilityio` (ssh).
- Plugins installed today: expo-app-design (user scope), plus context7 and skill-creator (project scope in
  `nodejs-training`). Claude Code 2.1.286.
- Report format: `claude-training/docs/day-05-report.md` (title, Date/Author/Repo/Topic lines, `## Summary`,
  numbered sections, checklist, open items).
- deep-agents on GitHub is **public**. Anything pushed, commented or run in Actions there is public.

## Approach
Work in deep-agents on short-lived `chore/<slug>` branches from `github/main`. Ship one PR per day:
Day 07 (skill and command), Day 09 (hook). Install the `@claude` Action before the Day 09 PR so the review
runs on it. Each report goes to claude-training on a `docs/day-NN-report` branch through the existing GitLab MR flow.
Anything simulated or not checked is marked `TODO` or "simulated".

Rejected:
- One PR for all three days: too big to review, and the Day 09 exercise needs a *later* PR for `@claude` to review.
- Shipping the Day 07 command only in `~/.claude/commands/`: the course asks for a PR to the repo's `.claude/`.
  The command is still personal in purpose (my standup); `$ARGUMENTS` keeps it generic.
- A second formatter hook: `format-on-edit` already exists, so it would repeat existing work.

## Phases

### Phase 1 — release-checklist skill (Day 07)
- [x] Branch `chore/claude-release-checklist` from `github/main` in `generative-ai/`
- [x] Write `.claude/skills/release-checklist/SKILL.md`: frontmatter `name`, a trigger-rich `description`
      ("use before deploying/releasing/tagging…"). Body: pre-release gate (invoke `verify`), version and SHA tag,
      secrets present **by name only**, choose a deploy path (LangSmith / Docker / frontend), post-deploy
      `/ok` + `/info` checks, smoke scripts, rollback plan with the DB-volume warning. It stops for
      approval before any deploy, push or tag. Every step cites `docs/deploy.md` / `docs/runbook.md`.
      Anything those docs don't cover (e.g. changelog, version bump policy) is marked `TODO`
- [x] Add `!.claude/skills/release-checklist/` to `.gitignore`
- [x] Update `CLAUDE.md` `.claude/` section (skill listed)
- Verify: `git status --porcelain .claude/skills/release-checklist` shows the file untracked (not ignored),
  then in a **fresh** session: `claude -p "Which project skills are available? Answer with names only."`
  lists `release-checklist` and `verify`. Dry run: "prepare a release of HEAD" triggers the skill. It runs
  the verify gate and stops before any deploy. Record the transcript excerpt.

### Phase 2 — `/standup` personal command (Day 07)
- [x] Write `.claude/commands/standup.md` (frontmatter `description`, `argument-hint: [since, default "yesterday"]`).
      Read-only: `git log --since=$ARGUMENTS --author` on the current branch, open PRs and their review state
      (GitHub MCP or `gh pr list`), `docs/PROGRESS.md` next item. Output: Yesterday / Today / Blockers, no edits
- [x] Update `CLAUDE.md` Task workflow list with `/standup`
- Verify: in a fresh session `/standup` returns 3 sections built from real `git log`/PR data (spot-check one
  commit SHA against `git log`). `git diff --stat` shows only the command and `CLAUDE.md`.

### Phase 3 — Day 07 PR on GitHub
- [x] Update `CLAUDE.md` "Git & review": GitHub `main` + PRs for `.claude/` work, GitLab `deep-agents` + MRs
      still the app flow. Note that the two can diverge (see Risks)
- [x] Commit (`chore(claude): add release-checklist skill and /standup command`), **ask before push**,
      `gh pr create --base main`. The body follows the GitLab template sections (What / Why / How tested)
- Verify: `gh pr view --json url,state,files` → `OPEN`, files = skill, command, `.gitignore`, `CLAUDE.md`.

### Phase 4 — Plugin: install and evaluate (Day 07)
- [x] `/plugin` → browse `claude-plugins-official`; note 3 candidates and why. Install the TypeScript LSP plugin
      (TODO: confirm exact name in the marketplace) at **local** scope in `generative-ai/`
- [x] Evaluate it on 2 real tasks: (a) find all callers of one exported function in `packages/`;
      (b) jump to a type definition used by `apps/web`. Run each with and without the plugin. Record
      correctness, tool calls, time and `/context` token cost of the plugin, plus any setup friction
- Verify: plugin listed as enabled in `/plugin` (installed tab) and the session shows its tools or
  skills. The evaluation table has both runs for both tasks. If it adds nothing, the verdict says so.

### Phase 5 — Day 07 report
- [x] `claude-training/docs/day-07-report.md` on branch `docs/day-07-report` (Day 05 format):
      skill design and trigger test, command, PR link, plugin evaluation table, open items
- Verify: `grep -c "^## " docs/day-07-report.md` ≥ 4; every claim links a SHA, PR URL or transcript excerpt;
  unverified items marked `TODO`. MR opened after approval.

### Phase 6 — MCP: GitHub connector and Playwright (Day 08)
- [x] GitHub connector: already added at user scope and connected (tested 2026-10-16). Record evidence,
      no reinstall
- [x] Playwright MCP: `npm show @playwright/mcp version`, then
      `claude mcp add -s user playwright -- npx -y @playwright/mcp@<exact-version>` (TODO: verify the package and
      flags against the official README before running). Restart the session
- Verify: `claude mcp list` → `github ✔` and `playwright ✔`; `/mcp` lists Playwright tools.

### Phase 7 — MCP end to end (Day 08 exercise)
- [x] GitHub: list open PRs on deep-agents, read the Day 07 PR diff via MCP, draft one review comment.
      **Show the text and ask before posting** (public repo); post it via `add_issue_comment` or a review
- [x] Playwright: start `pnpm dev:server` + `pnpm dev:web`, open the chat app, send one message with a line break
      (re-checks E1-01), screenshot to `plans/20261019-day-07-09-extend-automate/evidence/` (gitignored; test data only)
- Verify: comment URL returned by the tool and visible in `gh pr view --comments`; screenshot file exists and shows
  the line break.

### Phase 8 — Day 08 report
- [x] `claude-training/docs/day-08-report.md` on `docs/day-08-report`: connector setup, Playwright setup, both exercises,
      MCP vs `gh`/manual comparison (what MCP gave that guessing wouldn't)
- Verify: same checks as Phase 5.

### Phase 9 — `@claude` GitHub Action (Day 09)
- [ ] Run `/install-github-app` for `nhatduong-agilityio/deep-agents` (installs the Claude GitHub App, a workflow PR and
      the repo secret). Refer to the secret **by name only** (`ANTHROPIC_API_KEY` or `CLAUDE_CODE_OAUTH_TOKEN`). TODO: confirm which one it sets
- [x] Before merging the workflow PR, check who can trigger it on a public repo (TODO: verify that the action
      ignores users without write access) and add a `paths`/actor guard if needed
- Verify: `gh workflow list` shows the Claude workflows; `gh secret list` shows the secret name; `@claude hello`
  comment on a test issue gets a reply (`gh run list --workflow` → success).

### Phase 10 — block-forbidden-command hook (Day 09)
- [x] Branch `chore/claude-block-forbidden-command` from updated `github/main`
- [x] `.claude/hooks/block-forbidden-command.sh` (PreToolUse, matcher `Bash`; same JSON parsing as `format-on-edit.sh`).
      Blocks with exit 2 and a reason on stderr: `git commit`/`git push` with `--no-verify` (bypasses husky/commitlint),
      `git push` to `main` or `deep-agents` directly, `git reset --hard`, and `cat`/`less`/`source` of `.env*` (closes
      the Bash gap in the `Read(./.env)` deny rule). Allows everything else with exit 0
- [x] Register it in `.claude/settings.json`; update `CLAUDE.md` `.claude/` section
- Verify: script table test, with every row as expected:
  `printf '{"tool_input":{"command":"git push origin main"}}' | .claude/hooks/block-forbidden-command.sh; echo $?` → `2`;
  same for `--no-verify`, `cat .env`, `git reset --hard`; `git status`, `git push origin chore/x` → `0`.
  Then live: ask the session to `git commit --no-verify` and it is blocked with the reason shown.

### Phase 11 — Day 09 PR and `@claude` review evaluation
- [ ] Commit (`chore(claude): add block-forbidden-command hook`), **ask before push**, `gh pr create --base main`
- [ ] Wait for the review workflow. Classify every `@claude` comment as valid / nitpick / wrong, with the reason.
      Fix the valid ones in follow-up commits
- Verify: `gh run list --branch chore/claude-block-forbidden-command` → review run `success`; the classification table
  covers 100 % of its comments (`gh pr view --comments` count matches).

### Phase 12 — Automation ladder and Day 09 report
- [x] `/goal` on one bounded task with a checkable end state (TODO: pick it; candidate: "`pnpm format:check` passes
      for `docs/`"). Record turns, stop condition and result. TODO: verify `/goal` exists in 2.1.286
- [ ] Desktop scheduled task: morning briefing (weekday 08:30, read-only: open PRs and failing runs). If the Desktop app
      is not available, mark it "not done" and do not simulate it as done
- [x] Routines: read the docs and write a short overview, with one routine design for "nightly
      `pnpm test` on `main`". Create it only after the user approves, because it is billed
- [ ] `claude-training/docs/day-09-report.md` on `docs/day-09-report`: hook, Action setup, review evaluation table,
      ladder rungs (what each is for, what was done vs only read)
- Verify: same checks as Phase 5, plus each ladder rung marked done / read-only / TODO with evidence.

## Risks
| Risk | Signal | Mitigation |
| --- | --- | --- |
| **High:** public repo exposure: Action logs, PR comments and the `.env.example` file are public | Real values in `.env.example`, or a secret in a log | Read `.env.example` before Phase 9 and run `/devkit:security-scan`; secrets by name only; keep Action output free of env dumps |
| **High:** `@claude` Action triggered by outsiders on a public repo, which costs money | Runs from unknown actors | Phase 9 trigger check; actor guard; set a spend limit on the key |
| GitHub `main` and GitLab `deep-agents` diverge | `git log github/main..origin/deep-agents` not empty | Note it in `CLAUDE.md`; after merge, cherry-pick or push to GitLab `deep-agents` via MR (ask first) |
| Skill doesn't trigger, because the description is too vague | Dry-run prompt doesn't load it | Rewrite the description with the words people actually use ("release", "deploy", "ship to prod") |
| Hook blocks legitimate work (false positive), or misses a variant like `git push -u origin HEAD:main` | Table test | Add those variants to the table test; the hook only matches what is listed |
| Plugin evaluated on toy tasks makes the verdict look better than it is | — | Use real symbols from `packages/` and count tool calls and tokens |
| `/goal`, Routines or Desktop features differ in 2.1.286 from the course | Command not found | Mark `TODO` / "not available"; never simulate as done |

## Out of scope
- Actually deploying or releasing deep-agents (the skill is dry-run only).
- `how-we-write-migrations` skill; `notify-on-finish` hook.
- Fixing the GitLab MCP endpoint and a markdownlint config (existing TODOs).
- BA/QA track content.

## Notes on this plan
- Scouting was done inline (one repo, small surface), and the plan was written directly, not by the planner
  subagent. Not red-teamed; run `/devkit:plan red-team <this file>` if wanted.
