# Day 09 Report

- **Date:** 2026-10-19
- **Author:** Nhat Duong, working with Claude Code (Claude Opus 5.5)
- **Repo:** `nhatduong-agilityio/deep-agents` (GitHub, public; local clone `generative-ai/`)
- **Topic:** hooks and automation: one hook shipped as a PR, the automation ladder, `@claude` in GitHub Actions
- **Plan:** `plans/20261019-day-07-09-extend-automate/plan.md` (Phases 9–12)

The hook is written, table-tested (33/33) and blocked a real `--no-verify` in a live session. `/goal` ran on a bounded
task and produced [PR #3](https://github.com/nhatduong-agilityio/deep-agents/pull/3), merged as `054d441`. Three steps need the dev's own hands
or browser: installing the Claude GitHub App (`/install-github-app`), creating the Routine, and the Desktop scheduled
task. The hook PR is held back until the `@claude` Action is on `main`, so that the review runs on it.

---

## Summary

1. **Hook `block-forbidden-command`:** a PreToolUse (Bash) hook that blocks with exit 2 and a reason: `--no-verify`,
   pushes to `main` or `deep-agents`, `git reset --hard`, and shell reads of `.env*`. Table test: **33/33**. A bare push
   while on `main` is blocked (3/3). In a live session `git commit --no-verify` was blocked and HEAD did not move. Branch
   `chore/claude-block-forbidden-command` (`1957a7c`, `80dbdcc`, `6895726`) is pushed; the PR is TODO (section 2).
2. **Hooks and trust:** project hooks **do** run in a headless session started in an untrusted folder. Only
   `permissions.allow` is ignored there. `format-on-edit` is confirmed to work (section 1).
3. **`@claude` Action:** the docs were checked (who can trigger it, secrets, cost). Installing it is TODO for the dev
   (section 3).
4. **`/goal`:** made `pnpm format:check` pass repo-wide in 1 headless run (5 turns, $0.26), giving PR #3 (merged). No evaluator
   verdict appears in the stream output (section 5).
5. **Routine and Desktop task:** both are TODO for the dev, with ready-to-paste settings (section 5).

---

## 1. Hooks already in deep-agents, and how they load

| Hook | Event / matcher | What it does |
| --- | --- | --- |
| `.claude/hooks/format-on-edit.sh` | PostToolUse `Edit\|Write` | Formats the edited file (Prettier here); never blocks |
| `.claude/hooks/reinject-context.sh` | SessionStart `compact\|resume` | Restores the in-progress task after a compact or resume |

Findings:

- **Hooks load only in sessions started in that project.** This working session was started in `claude-training/`,
  so deep-agents' hooks never fired on its edits. `standup.md` failed `prettier --check` right after it was written.
- **`format-on-edit` works in a session started in `generative-ai/`.** A headless `Write` of
  `{"a":1,   "b":[1,2,   3]}` came out as `{ "a": 1, "b": [1, 2, 3] }`. The probe file was deleted afterwards.
- **Trust:** that folder is untrusted ("Ignoring 12 permissions.allow entries"), yet both hooks ran. Per the docs,
  `/goal` follows the same trust rule as hooks.

---

## 2. Hook shipped: `block-forbidden-command`

File: `.claude/hooks/block-forbidden-command.sh`, registered in `.claude/settings.json` under `PreToolUse` with matcher
`Bash`. It splits the command on `; && || | ( )`, skips `VAR=…`, `sudo`, `env` and git global options (`-C`, `-c`), then
checks each simple command. If `python3` is missing or the input can't be parsed, it allows: it never blocks blindly.

| Blocks (exit 2) | Why permission rules aren't enough |
| --- | --- |
| `git commit/push --no-verify`, `git commit -n…` | Skips husky + commitlint; flag position varies |
| `git push` to `main`/`deep-agents`: `origin main`, `HEAD:main`, `+main`, `refs/heads/…`, `--delete main`, or a bare push while on them | `ask` on `git push *` can be clicked through; the refspec forms vary |
| `git reset --hard` | Discards uncommitted work |
| `cat/less/source/grep/cp … .env*` (not `.env.example`; `cp .env.example .env`, the setup step, is allowed) | `Read(./.env)` deny covers the Read tool, not the shell |

Already covered elsewhere, so not repeated: `git push --force/-f` (deny rule).

### Verification

| Test | Result |
| --- | --- |
| Table test, committed as `.claude/hooks/block-forbidden-command.test.sh`: 19 block rows + 14 allow rows (e.g. `git push -o merge_request.create origin chore/x`, `git commit -m "feat: add -n flag docs"`, `cp .env.example .env`, `git reset --soft`) | **33/33** as expected (exit 0) |
| Bare push from a temporary worktree on `main`: `git push`, `git push origin`, `git push origin HEAD` | 3/3 blocked; `git push` on a feature branch allowed |
| Live: fresh session asked to run `git commit --allow-empty --no-verify -m "probe: hook test"` | Tool result: `PreToolUse:Bash hook error: … Blocked by .claude/hooks/block-forbidden-command.sh: git commit --no-verify skips husky and commitlint.` HEAD unchanged |

Known limit: it matches only the listed patterns. A command hidden in a script, an alias or `bash -c "…"` is not
parsed. It's a guard against mistakes, not a security boundary.

PR: TODO. It opens after the `@claude` Action is merged, so the review fires on it (section 4).

---

## 3. `@claude` in GitHub Actions

From the [GitHub Actions docs](https://code.claude.com/docs/en/github-actions) and the
[action's security doc](https://github.com/anthropics/claude-code-action/blob/main/docs/security.md), read 2026-10-19:

| Question | Answer (quoted or summarized from the docs) |
| --- | --- |
| Setup | `/install-github-app` in a `claude` session in the repo: installs the Claude GitHub App, saves the secret, pushes a branch with the workflow(s) and opens the PR in the browser. Needs repo admin + `gh` |
| Secret | `ANTHROPIC_API_KEY` (API key) or `CLAUDE_CODE_OAUTH_TOKEN` (subscription, `claude setup-token`) |
| Who can trigger it (public repo) | Only users with **write access**; bots are blocked unless listed in `allowed_bots`. Don't set `allowed_non_write_users`. Fork PRs get no secrets, so reviews run only on same-repo branches |
| Review workflow | `pull_request` [opened, synchronize, ready_for_review, reopened]; posts inline comments or one summary comment (with `--comment`). Skips drafts and PRs it judges trivial |
| Cost | GitHub Actions minutes + API tokens (or subscription usage with an OAuth token). Cap runs with `--max-turns` and a workflow timeout |
| App permissions | One shared set, incl. Contents, Issues, PRs, Workflows (read/write). GitHub doesn't allow accepting only a subset |

Status: **done.**
- **Install:** the dev ran `/install-github-app` twice. The first run stopped after installing the App; the second set `CLAUDE_CODE_OAUTH_TOKEN` and pushed the workflow branch.
- **Workflow PR:** I opened [PR #4](https://github.com/nhatduong-agilityio/deep-agents/pull/4) and added `timeout-minutes: 15` to both jobs. It was merged as `0557091`.
- **First run on PR #4 itself:** skipped with *"workflow file must … have identical content to the version on the repository's default branch"*. This is expected until the file is on `main`.
- **TODO:** `@claude hello` on an issue, which tests the mention workflow. It hasn't been run.

---

## 4. `@claude` review on the next PR

The hook went through `/devkit:ship` first: 3 rounds with the `devkit:code-reviewer` subagent found 3 Critical and 11 Warning
issues, all fixed before the PR. Then [PR #6](https://github.com/nhatduong-agilityio/deep-agents/pull/6) was opened at `8cc78c6`.

| Run | Result |
| --- | --- |
| Claude Code Review, run 39231743719 | `success`; 42 s on the runner, 14 s of model time, 3 turns, $0.11 (subscription token) |
| Output | One PR comment by `claude`: "## Code review — No issues found. Checked for bugs and CLAUDE.md compliance." No inline comments |

| # | Comment | Verdict | Reason | Action |
| --- | --- | --- | --- | --- |
| 1 | "No issues found" | **Correct, but shallow** | The final code has 0 Critical and 0 Warning per the subagent's 3rd round. But 11 Optional gaps are still open (e.g. `export HUSKY=0`, `xargs`, `cd --`), and the review mentions none of them | None needed. Kept as a TODO list in the PR report |

Honest assessment:
- The automatic review is cheap ($0.11, 3 turns) and catches nothing a reviewer must act on here.
- In 3 turns it can't have exercised a 250-line shell parser the way the subagent did, with about 260 probe commands across 3 rounds.
- It never saw the earlier buggy versions, so it's unknown whether it would have caught the newline or `#` bypass (TODO: test it on a deliberately broken commit).
- For security-ish code, a dedicated adversarial review is worth more than the default plugin. The automatic review is a useful floor, not a replacement.

---

## 5. Automation ladder

| Rung | What it is for | Status |
| --- | --- | --- |
| `/goal` | Keep working until a checkable condition holds; a separate small model judges each turn | **Done** (below) |
| Desktop scheduled task | A recurring local prompt with access to local files, run by the Desktop app | **TODO (dev):** settings below |
| Routines (cloud) | A saved prompt + repos + connectors, run on Anthropic's cloud by schedule, API or GitHub event | **TODO (dev):** the dev approved creating one, but it can only be set up through `/schedule` or the web (below) |
| `@claude` in GitHub Actions | Review every PR automatically, or answer `@claude` | **Done**: review fired on PR #6 (sections 3–4); `@claude` mention not tried yet |

### `/goal` run

`claude -p '/goal `pnpm format:check` exits 0 for the whole repo; `git diff --stat` shows changes only in
apps/web/src/theme.css and reports/T-FS-00-report.md; `pnpm --filter web test` still passes. Do not commit. Stop after
8 turns.'` with only the needed tools allowed.

| Check | Result |
| --- | --- |
| Run | 29 s, 5 turns, $0.26; one Bash call was denied ("Contains simple_expansion") and retried another way |
| Condition | `format:check` → "All matched files use Prettier code style!"; diff touches only the 2 files; `pnpm --filter web test` 94 passed. I re-ran both on the branch myself and got the same results |
| `theme.css` | Whitespace, hex case and trailing decimal zeros only. I checked this myself by normalizing and diffing the old and new files |
| Shipped | [PR #3](https://github.com/nhatduong-agilityio/deep-agents/pull/3) (`770cb96`), which also drops the "don't count those" exception from the `verify` skill. `theme.css` is app code on GitHub, an exception to the `CLAUDE.md` rule; noted in the PR for the dev to decide |
| Evaluator | The stream shows `/goal` running as a built-in command, but **no evaluator verdict line**. Whether the evaluator ran once or was skipped is not visible in headless output (TODO: check interactively, where the transcript shows each verdict) |

Docs facts: `/goal` works headless (`claude -p "/goal …"`). One goal per session. The condition can be up to 4,000
characters. It clears when the condition is met, judged impossible, or an unrecoverable error occurs. The evaluator only reads the
transcript; it runs no commands.

### Routine (approved by the dev, not created)

`/schedule` asks follow-up questions, so it can't run headless. The remote-trigger API rejected a minimal create ("One
of job_config or session_request must be set"), and I didn't guess the payload for a billed resource. To create
it, paste into `/schedule` or set it up at [claude.ai/code/routines](https://claude.ai/code/routines):

- **Name:** deep-agents nightly tests. **Repo:** `nhatduong-agilityio/deep-agents` (default branch `main`).
- **Schedule:** daily 02:07 local (avoid :00, since on-the-hour runs can start late). The minimum interval is 1 hour.
- **Prompt:** "Run `pnpm install --frozen-lockfile` then `pnpm test` (offline; no `.env`). If it fails, open an issue
  titled `Nightly tests failed <date>` with the failing test names and the first error. Do not change code or push."
- **Connectors:** remove all except GitHub. **Environment:** Default (Trusted network), plus a setup script that
  provides Node 24 + pnpm 11 (the repo's runtime). TODO: unverified which versions the Default cloud environment has;
  without that script the first run probably fails at `pnpm install`.
- **Cost:** draws subscription usage on every run. This account was at **91% of its 7-day limit** on 2026-10-19,
  so start it after the window resets.

### Desktop scheduled task (morning briefing)

TODO (dev), in Claude.app → Code → Routines → New routine → **Local**: weekdays 08:30, folder `generative-ai/`,
prompt `/standup`, then list deep-agents PRs with failing checks (`gh pr list --json number,title,statusCheckRollup`).
It's read-only and needs no write permissions.

---

## Day 09 checklist

| Item | Status |
| --- | --- |
| Ship one hook as a PR | Done: [PR #6](https://github.com/nhatduong-agilityio/deep-agents/pull/6) via `/devkit:ship`, with a [report artifact](https://claude.ai/artifact/NN5zFRXfEeer76Dk84RD3R) |
| `/goal` on a bounded task | Done (PR #3, merged `054d441`) |
| Desktop scheduled task (morning briefing) | TODO (dev; settings in section 5) |
| Routines overview | Done (section 5); routine creation TODO (dev) |
| `@claude` GitHub Action; review fires on the next PR; comments evaluated | Done (sections 3–4) |

## Open items

- Try `@claude hello` on an issue. (PR #6 was merged by the dev with `gh pr merge`.)
- TODO: test whether the automatic review catches a deliberately broken commit.
- Dev: create the Routine and the Desktop task (section 5). (PR #2 and #3 merged by the dev with `gh pr merge`: `eab1160`, `054d441`.)
- TODO: check the `/goal` evaluator verdict in an interactive session.
