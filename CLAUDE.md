# claude-training

Training log for the Claude Code course (Developer role): Markdown reports only, no app code.
`generative-ai/` is a separate clone with its own GitLab remote; it is ignored only by the local
`.git/info/exclude`, not by `.gitignore`. Work on that app follows `generative-ai/CLAUDE.md`.

## Commands

- No install, build, test or run step: no package.json, Makefile or CI in this repo.
- Markdown check (not configured, TODO: team to agree on a config): `npx markdownlint-cli2 "docs/*.md"`.
  With default rules it currently fails on MD013 (line length) everywhere and MD024 in
  `docs/ticket-analysis-review.md`.

## Conventions (from git history)

- Files: `docs/<kebab-case>.md`. Daily reports: `docs/day-NN-report.md`, starting with
  `# Day NN Report`, then `**Date:**` / `**Author:**` lines and a `## Summary` section.
- Branches: `docs/<slug>` from `main` (e.g. `docs/day-04-report`).
- Commits: Conventional Commits; so far always `docs: …` (e.g. `3c5345d docs: add Day 04 report`).
- One MR per branch into `main`. Merge commit: `Merge branch '<branch>' into 'main'` +
  `See merge request nhat.duong/claude-training!<n>`.
- Write in English. Anything not verified is marked `TODO`; simulated role-play is labelled "simulated".

## Never do

1. Never commit directly to `main`; use a branch and an MR. Basis: every change since
   `f8f573b` was merged through an MR.
2. Never write secrets (API keys, `.env` values, tokens) into docs; name the variable only.
   Basis: docs/setup-log-generative-ai.md refers to keys by name only.
3. Never present guessed or simulated answers as confirmed facts; mark them `TODO` or
   "simulated". Basis: day-02-report §1 and §4 (invented role-play answers).
