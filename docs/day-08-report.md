# Day 08 Report

- **Date:** 2026-10-19 (the first connector check was on 2026-10-16)
- **Author:** Nhat Duong, working with Claude Code (Claude Opus 5.5)
- **Repos:** `nhatduong-agilityio/deep-agents`, `nhatduong-agilityio/claude-training` (GitHub, both public)
- **Topic:** MCP and connectors: the GitHub connector and the Playwright MCP server
- **Plan:** `plans/20261019-day-07-09-extend-automate/plan.md` (Phases 6–8)

The point of Day 08 is that Claude reads real PR and ticket state instead of guessing. Both servers are connected
and were used end to end. The GitHub MCP read a PR and posted a review comment that led to a real fix. Playwright drove
the running chat app and confirmed the E1-01 line-break fix. Running the real server also showed that the runbook's
health checks were wrong, which no amount of reading the docs would have found.

---

## Summary

1. **GitHub connector:** `github` (HTTP, user scope) ✔ connected. It read both repos on 2026-10-16. On 2026-10-19
   it listed PRs, read PR #1's files and posted a comment (section 1).
2. **Playwright MCP:** `@playwright/mcp@0.0.83` (pinned) added at user scope, ✔ connected (section 2).
3. **Exercise, GitHub:** the review comment on PR #1 found a real date bug in `/standup`, which was fixed in the same PR
   before the merge (section 3).
4. **Exercise, Playwright:** a message with Shift+Enter shows on two lines in the human bubble (screenshot). E1-01
   holds in the real app (section 3).
5. **What MCP gave that guessing wouldn't:** the real server showed `/ok` needs auth and `/info` doesn't, the
   opposite of the runbook (section 4).
6. **GitLab MCP:** still failing. The endpoint answers **HTTP 401** (it exists and needs auth), not 404, so "endpoint
   not found" is likely a sign-in or config problem (section 5).

---

## 1. GitHub connector

The course command is `claude mcp add --transport http github https://api.githubcopilot.com/mcp/`. The server was
already configured at user scope, so it was not added again. When it was first added was not recorded.

| Date | Call | Result |
| --- | --- | --- |
| 2026-10-16 | `get_me` | `nhatduong-agilityio` |
| 2026-10-16 | `list_commits` (both repos), `search_repositories`, `get_file_contents /` | Latest `c3e44ce` / `c42c2db`, same as `git ls-remote`; deep-agents is **public** |
| 2026-10-19 | `list_pull_requests` (open) | PR #1, head `8e5808e`, base `main` |
| 2026-10-19 | `pull_request_read get_files` | 4 files with full patches |
| 2026-10-19 | `add_issue_comment` on PR #1 | [comment 6262683274](https://github.com/nhatduong-agilityio/deep-agents/pull/1#issuecomment-6262683274), visible in `gh pr view 1 --json comments` |
| 2026-10-19 | `merge_pull_request` | First call blocked by the auto-mode classifier ("Merge Without Review"). After the dev said "merge it", the retry failed validation (`expectedHeadSha` needs the full 40-character SHA), and the classifier then blocked the `git rev-parse` lookup. The dev merged with `gh pr merge` |

`.env.example` in the public deep-agents repo was checked: placeholders only, checked by name (`OPENAI_API_KEY`,
`LANGSMITH_API_KEY`, `AUTH_TOKEN`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `TAVILY_API_KEY`, …). No action needed.

---

## 2. Playwright MCP

| Step | Result |
| --- | --- |
| `npm show @playwright/mcp version` | `0.0.83` (= `latest`) |
| README (Claude Code section) | `claude mcp add playwright npx @playwright/mcp@latest` |
| Ran instead, to pin the version | `claude mcp add -s user playwright -- npx -y @playwright/mcp@0.0.83` |
| `claude mcp list` | `github … ✔ Connected`, `playwright: npx -y @playwright/mcp@0.0.83 - ✔ Connected` |

A new MCP server loads only in a new session, so the exercise ran in a fresh headless session.

---

## 3. Exercise: MCP tools end to end

### GitHub: query a PR, comment on it

1. Listed open PRs and read PR #1's diff through MCP. No shell, no guessing.
2. Found a real problem in `/standup`: `git log --since=yesterday` means 24 h ago and drops yesterday morning.
3. Posted the comment (the dev had approved posting on the public repo).
4. Fixed it on the same branch (`ca0f0c1`) and checked the fix: `/standup` on Monday 2026-10-19 resolved `2026-10-16`.
5. The dev merged PR #1 (`570bd7c`).

### Playwright: drive the running app

Started `pnpm dev:server` and `pnpm dev:web`. Then, in a fresh session limited to `mcp__playwright__*` tools: open
`http://localhost:5173`, type `line one`, Shift+Enter, `line two`, Enter, and take a screenshot.

| Check | Result |
| --- | --- |
| Run | 14 turns, 53 s, $0.35: navigate ×1, snapshot ×3, type ×2, press_key ×2, wait ×1, screenshot ×2 |
| Human bubble | Screenshot shows "line one" / "line two" on **separate lines**: E1-01 holds |
| Snapshot vs screenshot | The accessibility snapshot reads `line one line two` (it collapses whitespace), so only the screenshot proves the line break |
| AI reply | Echoed both lines as a list (one real model call, within `THREAD_BUDGET_USD`) |
| Console | 1 error at page load, not investigated (TODO) |

Two pieces of setup friction:
- Playwright MCP refused to save a screenshot outside the session's project ("outside allowed roots"). It wrote to
  `generative-ai/.playwright-mcp/` instead.
- That folder was **not** in deep-agents' `.gitignore`, so it was deleted after copying the screenshot. Now ignored
  (`80dbdcc`, on the Day 09 hook branch).

Evidence (kept local, not committed): `plans/…/evidence/AC-human-bubble-linebreak.png`, `playwright-run.jsonl`.

---

## 4. What MCP and the running app gave that docs and guessing didn't

While the dev server was up, I ran the runbook's health checks against it:

| Runbook said | The running server did (langgraph-api 1.5.1, `AUTH_TOKEN` set) |
| --- | --- |
| `/ok`: no auth, `{"status":"ok"}` | **401** without the token; `{"ok":true}` through the Vite proxy (token injected) |
| `/info`: needs the token; readiness = `graphs.agent` present | **200 without auth**; the response has **no `graphs` key**, so the readiness assert could never pass |
| `security.md`: "no auth layer in local dev" | Auth is active in dev whenever `AUTH_TOKEN` is set (`langgraph.json` has `auth.path`) |

Fixed in [PR #2](https://github.com/nhatduong-agilityio/deep-agents/pull/2) (`cf3ad7b`, merged as `eab1160`). The new readiness check is
`POST /assistants/search` for `graph_id: agent`, which passed through the proxy. TODO: re-check on the Docker image.

---

## 5. GitLab MCP

`claude mcp list`: `GitLab … ✘ Failed to connect — MCP endpoint not found`.
`curl -sI https://gitlab.asoft-python.com/api/v4/mcp` returns `HTTP/2 401`, so the endpoint exists and needs auth.
TODO (dev or admin): sign in again through `/mcp`, or check the instance's "Allow access to the MCP server" setting.
Not resolved this session.

---

## Day 08 checklist

| Item | Status |
| --- | --- |
| Add the GitHub connector | Done |
| Add the Playwright MCP server | Done (`0.0.83`, user scope) |
| Use one MCP tool end to end (query PRs, comment on one) | Done: PR #1 comment → fix → merge |
| Playwright drives and verifies the running app | Done: E1-01 screenshot |

## Open items

- TODO: look at the 1 console error on page load. (`.playwright-mcp/` is now gitignored, `80dbdcc`.)
- TODO: re-check the health checks on the production Docker image.
- GitLab MCP: the 401 needs a sign-in or the admin setting (section 5).
