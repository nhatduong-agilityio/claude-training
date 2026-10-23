# Day 10 Report

- **Date:** 2026-10-20
- **Author:** Nhat Duong, working with Claude Code (Claude Opus 5.5)
- **Repo:** `nhatduong-agilityio/deep-agents` (GitHub, public; local clone `generative-ai/`)
- **Topic:** review and quality: `/code-review`, ultrareview, security plugins, the review-checklist skill
- **Plan:** `plans/20261020-day-10-11-review-quality/plan.md`

Day 10 had two parts:

- **Comparison:** every review tool ran on the same branch, where I had seeded 6 bugs with a written answer key, and
  was scored against it.
- **Real branch:** the hook gaps left open in PR #6 went through test-first fixes, three local reviews and a green PR #7.

The seeded branch is **simulated**: no lead branch existed, so I seeded one myself.

---

## Summary

### /code-review

- **Branch:** ran `/code-review high` on the real branch `fix/hook-optional-gaps`.
- **Findings:** 9. Eight were hook bypasses or false positives in the shell parser, and one was in the new skill (it
  assumed `main` as the base). All 9 were valid and none were wrong. I reproduced every bypass claim as a table row
  before fixing it.
- **All reviews of the branch together:** the review-checklist pass and `/security-review` add to this, for 16 distinct
  items. 15 were acted on, 1 is won't-fix (plain `grep -r` reading `.env`), and 0 were wrong.

### Ultrareview (`/code-review ultra`)

- **Branch:** ran ultrareview on the seeded-buggy branch `review/seeded-bugs` (**simulated**: I seeded it myself
  because no lead branch existed). It ran locally, without a push, as the no-argument form.
- **Comparison with `/code-review`:** all three found all six seeded bugs, and none reported a false positive.
  - **Ultra:** **6/6**, with a fix for each, in 2 min 49 s, at $0 (a free run, 1 of 3).
  - **`/code-review high`:** **6/6** plus one real bug that was already in the code (a non-ASCII token makes
    `timingSafeEqual` throw, giving a 500 instead of a 401), in 42 s for $0.31.
  - **`/code-review low`:** **6/6**, but 2 of them only in a "didn't make the cap" line, in 11 s for $0.15.
  - **Ultra caught nothing `/code-review` missed. `high` caught one thing ultra missed.** On a small, obvious diff,
    the local pass gives the same signal for less.
  - Ultra first refused the branch because it diffed against GitLab `origin/main` (37,688 lines). It worked once the
    base was named: `/code-review ultra github/main`.
- **When to use it:** ultrareview is a multi-agent cloud review, so it is worth using on risky branches rather than
  on every change.

### Security plugins

- **`/security-review` before committing:** ran it on the real branch before the final commit (started 10:46:08Z;
  final commit `19da9c2` at 10:48:22Z). It found no high-confidence issue. Its one low-severity note (`cat .env.e*`
  allowed) was valid and fixed.
- **On the seeded branch:** `/security-review` caught **both** seeded security bugs: the auth bypass and the
  `/skills/**` write. It also found that a code comment states the wrong permission-rule order.
- **security-guidance:** installed at local scope. Its commit reviewer flagged the seeded auth bypass as **CRITICAL**,
  but only *after* the commit had landed, because it is a PostToolUse hook: it reports, it doesn't block. Disabled
  again afterwards, because its review on Stop bills every turn.
- **Claude Security scan (`claude-security`):** installed at local scope and run with `/claude-security scan …
  at medium` on the seeded branch. It caught **both** seeded security bugs, each confirmed by its review panel, with
  no false positives ($5.22, 336 s). It needs the Workflow tool: a first run without it did nothing ($0.39); passing
  `--settings '{"enableWorkflows":true}'` made it work.

### review-checklist skill

- Wrote the Day 03 review checklist as the project skill `review-checklist`, so the checklist is applied on every
  review.
- Its order is correctness → tests → readability → security basics → scope, and it proves every suspicion with a probe.
- It shipped in PR #7. A fresh session lists it, and on the real-branch review it loaded (a `Skill` call is in the
  transcript) and returned 10 rows with a verdict.

### Exercise

- **Fixed what the review found; the PR is green:** [PR #7](https://github.com/nhatduong-agilityio/deep-agents/pull/7)
  ([PR report](https://claude.ai/artifact/C21LnskqRA3cK3rzJRtvVz)).
  - Table test 139/139, `pnpm typecheck && pnpm lint` exit 0.
  - The `claude-review` check passed.
  - CI runs no tests, so "green" also rests on the local runs.
- **False positives noted for the retro:** no reviewer finding was wrong. The noise worth noting:
  - `/security-review` first diffed against an unrelated base (6.5 MB) before correcting itself.
  - `/code-review high` said "four commits" when there were three.
  - The checklist pass marked one claim "unverified" because a probe needed a permission prompt.
  - The `@claude` review on PR #7 posted nothing at all.
  - Ultrareview's first launch refused the branch: it diffed against `origin/main` (GitLab, README only), saw
    232 files and 37,688 lines (limit 8,000), and needed the base named (`/code-review ultra github/main`).

### Takeaways

- Use `/code-review` as the default pass, and ultrareview for risky branches.
- Review output is a list of candidates to verify, not a verdict. Each false positive should be noted for the retro.
  - Today every candidate was reproduced first. That turned 30 claims into 30 red table rows before any code changed.
- Running a security review before committing catches issues earlier than waiting for PR review.
  - Here, `/security-review` and the local reviews found 16 items before the PR. The PR's automatic review found none.
- A review checklist written as a skill becomes enforced practice instead of a document nobody opens.
  - The skill pass found things the `/code-review` pass didn't: a bypass (`find -name "*env" | xargs cat`), the
    happy-path-only test gap, and a scope note.

---

## 1. Seeded branch and answer key (simulated)

- **The key came first.** `plans/…/evidence/seeded-answer-key.md` was written and hashed before the first seeded
  commit (2026-10-20T10:29:11Z, sha256 `7001df46…`).
- **The branch:** `review/seeded-bugs` from `github/main` (`e35533a`), 3 commits with neutral `refactor` messages.
  Typecheck, lint and `pnpm test` (115 + 94) all pass, because no existing test covers these paths. It was never
  pushed: `git ls-remote github review/seeded-bugs` is empty.
- **Keeping the key away from the reviewers:** every review ran in a fresh session started in `generative-ai/`, so no
  reviewer could see the key.

| Id | Where | Class | Severity |
| --- | --- | --- | --- |
| K1 | `apps/api/src/auth.ts` | Auth bypass: no `Authorization` header → `'anonymous'` | Critical |
| K2 | `apps/api/src/agent.ts` | `/skills/**` gets `write` on a real-disk backend | High |
| K3 | `packages/core/src/backoff.ts` | Retry-hint regex keeps one digit (24 s → 2 s) | Medium |
| K4 | `packages/core/src/backoff.ts` | `sleep(delay)` not awaited: retries fire back to back | High |
| K5 | `apps/web/src/App.tsx` | Budget check inverted: the thread is cleared on every other error | Medium |
| K6 | `apps/web/src/App.tsx` | Auto-scroll effect deps `[]` | Low |

A probe confirmed K1 and K3/K4 on the branch. With no header the request got in as `anonymous` (a wrong token still
got 401). Retries reported 3.9 s of waiting against a hint of 24 s, and the real elapsed time was 0 ms.

## 2. Comparing the reviews on the same input

| Run | Caught | Missed | Wrong | Extra (valid, not seeded) | Cost | Time |
| --- | --- | --- | --- | --- | --- | --- |
| `/code-review low` | 6/6 (2 of them under "didn't make the cap") | 0 | 0 | 0 | $0.154 | 11 s |
| `/code-review high` | 6/6 | 0 | 0 | 1: `timingSafeEqual` throws on a same-length non-ASCII token (500 instead of 401), already in the code before this branch | $0.305 | 42 s |
| `/code-review ultra` (base `github/main`) | 6/6 | 0 | 0 | 0 | $0 (free run 1 of 3) | 2 min 49 s |

- **Ultra vs local:** ultra matched `high` on the seeded bugs and gave a fix line for each, but found no extra bug
  in the 4 files. Its value is depth on a large or risky diff; on 25 lines it adds nothing over `high`.
- **Effort low vs high:** both levels found all six. `high` cost 2× and took 4× as long. It ranked all six in its
  main list, added the extra real bug, and cross-checked against repo files (the T-DA-02 report, the
  smoke-permissions script). `low` caps its list at 4 and puts the rest in one line.
- **Honest limits:**
  - The same model family planted and reviewed the bugs.
  - Each bug is a small, visible diff on a 3-commit branch.
  - So 6/6 shows that the tools catch obvious one-line regressions. It doesn't show they would catch a lead's
    realistic bugs.

## 3. Security plugins

| Tool | How it works | Seeded security bugs | Cost | Verdict |
| --- | --- | --- | --- | --- |
| `/security-review` (built in) | One command, reviews the diff | K1 ✔, K2 ✔ (plus the wrong "last rule wins" comment: deepagents uses the first matching rule) | $1.75, 173 s | **Keep**: run before committing auth or permission changes |
| `security-guidance` 2.0.14 | Hooks: regex warnings on Edit/Write, an LLM diff review on Stop, a reviewer on `git commit` | K1 ✔ (CRITICAL), but reported after the commit landed | $0.28 for the session | **Opt-in**: useful on security-sensitive branches; off by default because it bills every turn |
| `claude-security` 0.12.0 | `/claude-security` scan of codebase or changes; a panel verifies each finding; writes MD/JSONL/SARIF to `CLAUDE-SECURITY-*/` | K1 ✔ (critical), K2 ✔ (high), both "verified"; also flags `virtualMode:false` letting `/skills/<host path>` reach any file | $5.22, 336 s (needs `enableWorkflows`) | **Keep for risky branches**: the deepest security pass, but about 3× `/security-review`'s cost for the same two catches |

There was one more security-relevant result, which didn't come from a plugin. A fresh session was asked to apply K1
as a "refactor", and the model itself refused. It explained the bypass before any hook ran.

## 4. Real branch: `fix/hook-optional-gaps` → PR #7

| Commit | What |
| --- | --- |
| `8ed1512` | `feat(claude): add review-checklist skill` |
| `c86255e` | `fix(claude): close hook bypass gaps for hooksPath, wrappers, xargs`: 30 rows first (21 red), then 106/106 |
| `ecb3044` | `fix(claude): close hook bypasses found in review`: 33 more rows (30 red), then 139/139 |
| `19da9c2` | `fix(claude): review against the change's target branch` (skill base branch, read-only wording) |

On `main`, 44 of the 63 new rows fail, and the 76 old rows still pass after the change.

The review findings are classified in `plans/…/evidence/real-classification.md`. Every finding was valid; one is a
regression from my own first commit (`cat < .env*`).

| Pass | Findings | Cost | Time |
| --- | --- | --- | --- |
| `/code-review high` | 9 | $0.713 | 159 s |
| `review-checklist` skill | 10 rows + "nothing found" for security | $0.751 | 130 s |
| `/security-review` (before the final commit) | 0 high-confidence, 1 low note | $0.795 | 103 s |
| `@claude` review on the PR | 0 comments | $0.067 | 40 s |

- **Overlap between the passes:** 16 distinct items; 15 were fixed, and 1 is won't-fix (`grep -r KEY .`, because
  blocking it would stop every recursive grep).
- **Still open (out of scope):** 2 of the original Optional gap groups: `cd`/`pushd` scope and `cp -t`;
  `<<\EOF`, `bash script.sh -c` and a `$(…)` refspec.

## 5. `/loop`, `/effort` and headless reviews

- **`/loop 3m`:** watched PR #7's checks and stopped itself when `claude-review` passed. The first version of its
  prompt passed `--comments` and `--json` together, which `gh pr view` rejects, so it was fixed and recreated.
- **Effort:** comparing `/code-review low` and `high` on the same branch was the effort test (section 2).
- **`/code-review` and `/security-review` run headless** with `claude -p "/code-review high" --output-format json`
  (the probe cost $0.18). That makes them easy to script and compare. `claude-security` doesn't run headless.

## Day 10 checklist

| Item | Status |
| --- | --- |
| `/code-review` on a real branch | Done (section 4) |
| Ultrareview on a seeded-buggy branch, signal compared | Done on the simulated branch (section 2) |
| `/security-review` before committing | Done (`security-review-real.md`) |
| Security plugins walkthrough | Done: `/security-review`, security-guidance, claude-security (section 3) |
| review-checklist skill | Done, shipped in PR #7 |
| Fix what the review found; PR green | Done: [PR #7](https://github.com/nhatduong-agilityio/deep-agents/pull/7) |
| False positives for the retro | Done (Exercise above) |

## Open items

- Merge PR #7 (dev). Delete the local `review/seeded-bugs` branch once ultra is recorded. **Resolved (checked 2026-10-23):** [PR #7](https://github.com/nhatduong-agilityio/deep-agents/pull/7) was merged on 2026-10-21 (`0e3e68a`); the `review/seeded-bugs` branch no longer exists locally, on GitHub or on GitLab.
- TODO: repeat the comparison on a branch the lead seeds, which removes the self-seeding bias.
