# Day 07 Report

- **Date:** 2026-10-19
- **Author:** Nhat Duong, working with Claude Code (Claude Opus 5.5, advisor: Opus 5.5)
- **Repo:** `nhatduong-agilityio/deep-agents` (GitHub; local clone `generative-ai/`)
- **Topic:** agent skills, custom slash commands, plugins (`/plugin`)
- **Plan:** `plans/20261019-day-07-09-extend-automate/plan.md` (Phases 1–5)

Day 07 is about putting team know-how into `.claude/`, so that every session picks it up without anyone installing
anything. Output: a team skill (`release-checklist`), a personal command (`/standup`) and a `CLAUDE.md` update,
shipped in [PR #1](https://github.com/nhatduong-agilityio/deep-agents/pull/1) and merged as `570bd7c`. Writing the
skill exposed wrong statements in the deep-agents docs, which led to a second PR. The plugin
evaluation found that `typescript-lsp` adds nothing to these tasks unless asked for explicitly.

---

## Summary

1. **`release-checklist` skill:** built from `docs/deploy.md`, `docs/runbook.md` and `CLAUDE.md`, and it stops (⛔)
   before every deploy, push, tag or paid API call. A fresh session listed it and **triggered it** on "prepare a
   release of HEAD", then stopped at the first ⛔ without running anything (section 1).
2. **Docs that were wrong:** writing the skill found 3 contradictions (`VITE_AUTH_TOKEN`, `/info` auth, image tag)
   and 1 gap (no backup procedure). A test against the running server (Day 08) showed the runbook's health checks
   had auth **inverted**. All of it is fixed in [PR #2](https://github.com/nhatduong-agilityio/deep-agents/pull/2),
   merged as `eab1160` (section 1).
3. **`/standup` command:** read-only Yesterday / Today / Blockers. Every SHA it cites matches `git log`. A
   review comment found a real bug (`--since=yesterday` means "24 h ago"), fixed in `ca0f0c1` (section 2).
4. **PR #1:** opened, reviewed (one comment), fixed and merged by the dev (section 3).
5. **Plugin `typescript-lsp`:** 0 tokens always-on, but it needs a separate binary. With the plugin installed, Claude
   did **not** use it on 2 real tasks and got the same correct answers with grep. Forced to use it, it worked, but only from a
   caller's file, not from the definition. Verdict: not worth installing for this repo yet (section 4).

---

## 1. Team skill: `release-checklist`

File: `.claude/skills/release-checklist/SKILL.md`. `.gitignore` gets a `!.claude/skills/release-checklist/`
exception, because `.claude/skills/*` is ignored.

### Why this skill, not `how-we-write-migrations`

deep-agents has real release documents (`docs/deploy.md`, `docs/runbook.md`) but almost no migrations (LangGraph
manages Postgres). A migrations skill would have been mostly `TODO` or invented. Decided by the dev on 2026-10-19.

### Design

| Choice | Why |
| --- | --- |
| Every step cites its source doc | A skill that adds rules of its own drifts from the docs. Anything with no source is `TODO` |
| ⛔ stop before deploy, push, tag, smoke and e2e | Smoke and e2e read `.env` and call paid APIs; deploys can't be undone. A dry run stops at the first ⛔ |
| Secrets by name only, and the human confirms them | `.env*` reads are denied in `.claude/settings.json`; the skill never reads `.env` |
| API before frontend | `LANGGRAPH_ALLOW_ORIGIN` must contain the frontend origin first, or SSE fails (`deploy.md` "CORS prerequisite") |
| Description lists trigger words | "releasing, deploying, shipping to production, tagging…", the words people actually use |

### What writing it uncovered in the docs

| Topic | Before | Evidence | Fixed in PR #2 (`eab1160`) |
| --- | --- | --- | --- |
| Token in the web bundle | `deploy.md` suggested `VITE_AUTH_TOKEN`; `.env.example` too | `CLAUDE.md`: never put tokens in `VITE_*` | Option removed. Dev uses the Vite `/api` proxy; prod uses a reverse proxy |
| Image tag | `deploy.md` built `:latest` only | Runbook §3 rollback needs the git SHA tag | SHA tag + `latest` |
| DB backup before deploy | Not mentioned anywhere | Runbook restores a dump no doc says how to make | Note added; the command stays `TODO` (dev: team decision) |
| `/ok`, `/info` auth | Runbook: `/ok` no auth, `/info` with token, readiness via `graphs.agent` | **Running server, 2026-10-19:** `/ok` → 401 without token; `/info` → 200 without auth and has no `graphs` key | `/ok` with token; readiness via `POST /assistants/search`; `security.md` "no auth in local dev" corrected |

The first version of PR #2 copied the runbook's wrong `/ok` / `/info` claim. Only the Day 08 test against the
running server caught it (`cf3ad7b`, explained in a [PR comment](https://github.com/nhatduong-agilityio/deep-agents/pull/2#issuecomment-6262941697)).
Lesson: a skill built from docs inherits the docs' errors, so check commands against the real system.
This covers only the `deploy.md` part of backlog item E2-03. The auth model itself (DDR-016) still waits on the BA.

### Verification (fresh headless sessions)

| Check | Command | Result |
| --- | --- | --- |
| Not gitignored | `git check-ignore -v .claude/skills/release-checklist/SKILL.md` | exit `1`, no output |
| Listed | `claude -p "Which project skills are available in this repo? …"` | `verify`, `release-checklist` |
| Triggers | `claude -p "prepare a release of HEAD" --permission-mode plan --output-format stream-json` | First tool call `Skill {"skill":"release-checklist"}`; 9 turns, $0.39 |
| Stops before acting | Same run | Read-only `git` calls only. It stopped at step 1 (tree not clean, because of these edits), asked for secrets by name and listed the doc conflicts |

Headless `claude -p` printed "Ignoring 12 permissions.allow entries … this workspace has not been trusted". Plan mode
still allowed read-only Bash. Trust is a one-time interactive step for the dev (open items).

---

## 2. Personal command: `/standup`

File: `.claude/commands/standup.md`. It is read-only and cites a SHA or PR number for every bullet. When it can't
check something, it says so, e.g. "GitLab MRs: not checked (MCP not connected)".

| Check | Result |
| --- | --- |
| `claude -p '/standup 2026-10-14' --permission-mode plan` | 3 sections, 5 turns, $0.24; cited `d8620e7`, `a04c57c`, `4bfae98`, `9dd5e1e`, … all present in `git log` |
| After the fix, `claude -p '/standup'` on Monday 2026-10-19 | First line `2026-10-16` (last Friday). It listed `8e5808e` and PR #1. 5 turns, $0.23 |
| Files touched by the runs | None |

Two bugs found and fixed:

- **YAML:** `argument-hint: [since, …]` parses as a YAML **list**. Prettier rewrote it, which showed the problem;
  quoting the value fixed it (checked with `yaml.safe_load`).
- **Date:** `git log --since=yesterday` means "24 h before now", so a 09:00 standup lost yesterday morning's commits.
  Found in the PR review (Day 08 exercise). The command now resolves the start of the previous working day first
  (`ca0f0c1`).

---

## 3. Shipping: PR to `.claude/`

| Item | Evidence |
| --- | --- |
| Commit | `8e5808e chore(claude): add release-checklist skill and /standup command` (husky + commitlint + lint-staged passed) |
| PR | [#1](https://github.com/nhatduong-agilityio/deep-agents/pull/1) into GitHub `main`; files: skill, command, `.gitignore`, `CLAUDE.md` |
| Review | One comment via GitHub MCP (Day 08). Fix `ca0f0c1` pushed to the same PR |
| Merge | `570bd7c`, merged by the dev with `gh pr merge 1 --merge`. My first attempt was blocked by the auto-mode classifier ("Merge Without Review"); details in the Day 08 report, section 1 |

`CLAUDE.md` now records the PR flow: `.claude/` tooling goes to GitHub `main` through PRs, app work stays on GitLab, and
the two can drift. TODO: bring these changes to GitLab `deep-agents` through an MR. The dev did not approve GitLab MRs
this session.

---

## 4. Plugin: `typescript-lsp`

### Browsing

`claude plugin marketplace list` shows 3 marketplaces (`claude-plugins-official`, `expo-plugins`, `typesafe-ai`).
`claude-plugins-official` has 315 plugins. Candidates for this TypeScript monorepo:

| Plugin | What | Why or why not |
| --- | --- | --- |
| `typescript-lsp` (Anthropic) | TS/JS language server: definition, references, diagnostics | **Chosen**: the course's code-intelligence example; matches the stack |
| `serena` (community-managed) | Semantic code analysis MCP server over LSP | Broader, but a third-party MCP server with more context cost |
| `context7` | Library docs lookup | Already used in `nodejs-training`; it doesn't help with navigation |

### Install

| Step | Result |
| --- | --- |
| `claude plugin install typescript-lsp@claude-plugins-official -s local` | ✔ installed, local scope (this clone only) |
| `claude plugin details typescript-lsp` | 1 LSP server, **~0 tokens always-on** ("out-of-process tooling; no model context cost") |
| Binary | **Not bundled.** It needs `typescript-language-server` on `PATH`. I didn't install it globally. Instead, `typescript-language-server@6.0.2` and `typescript@5.9.3` (the repo's version) went into a scratch folder, added to `PATH` only for the test sessions |

### Evaluation (fresh headless sessions, plan mode, same prompt with and without the plugin)

Ground truth from `grep`: task A, 13 files call `withBackoff` (12 in `experiments/` plus 1 test). Task B,
`useStream` is declared at `@langchain/react@1.2.3` `dist/use-stream.d.ts:370`, returning
`UseStreamReturn<T, InterruptType, ConfigurableType>`.

| Run | Correct | Time | Turns | Cost | Tool calls |
| --- | --- | --- | --- | --- | --- |
| A, no plugin | ✅ 13 files | 19 s | 3 | $0.23 | Bash ×2 |
| A, plugin | ✅ 13 files | 22 s | 3 | $0.21 | Bash ×2, **LSP ×0** |
| A, plugin, prompt says "use the LSP tool" | ✅ 13 files + per-file counts | 31 s | 6 | $0.28 | ToolSearch ×1, Bash ×2, LSP ×2 |
| B, no plugin | ✅ | 38 s | 5 | $0.27 | Bash ×4 |
| B, plugin | ✅ | 30 s | 5 | $0.24 | Bash ×4, **LSP ×0** |

What the forced run showed: `findReferences` on the **definition** in `packages/core/src/backoff.ts` returned 1
reference, the definition itself. On the **import** in a caller it returned 31 references across 15 files. The
reason is probably that callers import `@deep-agents/core` through the package entry point, so the server sees two copies
of the symbol (not verified).

### Verdict

- **Context cost:** none. It's honest about that, and nice to have.
- **Use in practice:** for these tasks, it added nothing. Claude didn't choose the LSP tool by itself; grep was
  enough and just as correct. When forced, it gave exact per-file counts, but only when called from the right place.
- **Setup friction:** the binary isn't installed by the plugin, and nothing warns you when it's missing.
- **Where it would earn its place:** renames, type errors after edits, or a symbol with a common name where grep
  is noisy. That was not tested today.
- **Decision for the dev (TODO):** install the binary globally and keep the plugin, or uninstall it with
  `claude plugin uninstall typescript-lsp -s local`. It stays installed at local scope for now. Without the binary on
  `PATH`, normal sessions can't start its server.

---

## Day 07 checklist

| Item | Status |
| --- | --- |
| One team skill, written and trigger-tested | Done (`release-checklist`) |
| One personal slash command | Done (`/standup`) |
| Shipped via a PR to the repo's `.claude/` | Done: PR #1 merged (`570bd7c`) |
| Browse a marketplace, install one plugin, evaluate it honestly | Done (section 4) |

## Open items

- Plugin: keep it with a global binary, or uninstall (section 4).
- TODO (team): the `langgraph-data` backup command; re-check the health checks on the production Docker image.
- TODO: mirror to GitLab `deep-agents` everything that went to GitHub: PR #1 (merged), #2, #3 and the hook PR (GitLab MRs not approved this session).
- Trust `generative-ai/` once interactively (`claude` there → accept), so its `permissions.allow` rules apply.
