# Day 10 cook report

Plan: `plan.md` (Status: done). All 8 phases complete.

| Phase | Result | Evidence |
| --- | --- | --- |
| 1 Preconditions | Headless `/code-review` works ($0.18); quota confirmed by dev | `evidence/preconditions.md` |
| 2 Seeded branch (simulated) | 6 bugs, key hashed first, tests green, never pushed; branch deleted 2026-10-21 | `seeded-answer-key.md`, `seeded-probe.txt` |
| 3 Compare signal | low 6/6, high 6/6 + 1 extra, ultra 6/6 ($0, 2 min 49 s), 0 FP | `seeded-scoring.md`, `cr-*.md` |
| 4 Security plugins | `/security-review` 2/2, security-guidance 1/1 (post-commit), claude-security 2/2 ($5.22) | `security-review-seeded.md`, `sg-probe-*.jsonl`, `claude-security/` |
| 5 Skill + hook gaps | `8ed1512`, `c86255e`: 21 red → 106/106 | `hook-test-red.txt`, `hook-test-green.txt` |
| 6 Review → PR #7 | 16 items, 15 fixed, 1 won't-fix, 0 wrong; 139/139; `claude-review` pass | `real-classification.md`, deep-agents PR #7 |
| 7 Report | `docs/day-10-report.md` | — |
| 8 Reports PR | claude-training PR #2 with report artifact | https://github.com/nhatduong-agilityio/claude-training/pull/2 |

Not done by Claude: merging PR #7 and PR #2 (dev).
Out-of-scope issues found: pre-existing `timingSafeEqual` byte-length 500 in `apps/api/src/auth.ts`; wrong
"last matching rule wins" comment in `apps/api/src/agent.ts` (deepagents uses the first match); `virtualMode:false`
on `/skills/` and `/corpus/` lets paths reach the host filesystem.
