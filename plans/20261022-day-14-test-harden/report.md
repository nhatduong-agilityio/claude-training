# Day 14 cook report

Plan: `plans/20261022-day-14-test-harden/plan.md` · Date: 2026-10-22

## Phases

| Phase | Result | Evidence |
| --- | --- | --- |
| 1 Spike: mocked thread restore | Done | Only `GET /threads/<id>/state` and `POST /threads/<id>/history` were needed. E1-03 AC1 fails with the `a4618da` `App.tsx` |
| 2 Input regression spec | Done | 7 input tests (later 8). All fail on `0e3e68a`; the #14 tests fail on `1e89c68`. Two were strengthened after they passed on old code |
| 3 CI + `/loop` | Done | #19: first run green (39736139751). Red proof `433da2a` (39736447164), revert green (39736911969). Merge `6453964` push run green (39738212354) |
| 4 `/code-review` | Done | 3 low findings fixed. One was an app bug: log scroll jump (red `1d2490e`, Firefox 30 → 72 px; fix `83873b5`) |
| 5 Release notes | Done; not human-edited | https://claude.ai/artifact/AbsFgR2BLvYim99jDphEjb. The user approved it without changes |
| 6 Day 14 report | Done | `docs/day-14-report.md`: 7 `##` sections, MD013 only |

## Files changed

- deep-agents (#19, merged):
  - `.github/workflows/ci.yml`;
  - `apps/web/regression/*` (2 specs, `mock-api.ts`, README);
  - `apps/web/playwright.regression.config.ts`;
  - `apps/web/package.json`, `tsconfig.json`, `vite.config.ts`, `src/App.tsx`;
  - `.gitignore`.
- claude-training: `docs/day-14-report.md`, this plan folder.

## Review

- Two `/code-review` passes: on #19 and on the Day 13 web range. 3 low findings, all fixed. Ultrareview was skipped:
  no change touched auth or data.

## Out of scope / found

- `claude-review` can fail on HTTP 429 while installing Claude Code (seen once; a re-run fixed it).
- GitHub `main` is 2 merges ahead of GitLab (#18, #19); left for the next sync.
- Process: twice a commit went in with a web type error, because `;` chaining ran the commit after a failed `tsc`.
  Both were amended before any push. Use `&&` for check-then-commit.
