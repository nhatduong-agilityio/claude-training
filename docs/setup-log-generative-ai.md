# Setup log: generative-ai (branch `deep-agents`), run from scratch

- **Date:** 2026-10-13
- **Machine:** macOS (Darwin 25.0.0), zsh
- **Path:** README "Path A: Local dev (Node process, no Docker)"
- **Repo:** <https://gitlab.asoft-python.com/nhat.duong/generative-ai/-/tree/deep-agents>

"From scratch" means a new clone, a clean install, new env files, and dev servers started fresh. Every command below was actually run, in order. Secret values are never printed.

## Summary

| Result | Detail |
| --- | --- |
| **Final status** | **Running.** The agent replies through the frontend proxy (step 24). |
| Failures hit | 3: LangSmith 403 (step 7), OpenAI 401 placeholder key (step 13), OpenAI 401 expired key (step 21) |
| Time to first working reply | About 5 minutes of commands, plus the time to get a valid OpenAI key |
| Code changes needed | None. Every failure was configuration (API keys). |

---

## Run 1: temporary folder

### Step 1: Clone

```bash
git clone --branch deep-agents git@gitlab.asoft-python.com:nhat.duong/generative-ai.git
cd generative-ai && git log --oneline -1
```

```text
Cloning into 'generative-ai'...
2701be1 Merge branch 'feat/verification' into 'deep-agents'
```

✅ OK

### Step 2: Check prerequisites

```bash
node -v
pnpm -v
corepack --version
grep -n '"packageManager"' package.json
```

```text
v24.14.0
11.22.0
0.34.6
5:  "packageManager": "pnpm@11.22.0",
```

✅ Matches the README (Node 24, pnpm 11). `corepack enable` was not needed.

### Step 3: Install dependencies

```bash
pnpm install
```

```text
...
. prepare$ husky
. prepare: Done
Done in 4.8s using pnpm v11.22.0
```

✅ OK. Checked again with `pnpm install 2>&1 | grep -iE "warn|ignored|err|deprecat"`: no output, so no warnings.

### Step 4: Create the env files

```bash
cp .env.example .env
cat > apps/web/.env.local <<'EOF'
VITE_API_URL=http://localhost:5173/api
AUTH_TOKEN=changeme-dev
API_TARGET=http://localhost:2024
EOF
```

✅ Files created. `.env` still holds placeholder keys (`sk-...`, `ls__...`), because the README tells you to fill them in afterwards.

### Step 5: Check ports are free

```bash
lsof -iTCP:2024 -iTCP:5173 -sTCP:LISTEN
```

✅ No output, so both ports are free.

### Step 6: Start the API server

```bash
pnpm dev:server        # = langgraphjs dev
```

```text
- 🚀 API: http://localhost:2024
info:    ▪ Registering graph with id 'agent'
[langsmith] client initialized { tracing: 'true', project: 'deep-agents-phase', apiKey: '***set***' }
info:    ▪ Loading auth from ./apps/api/src/auth.ts:auth
info:    ▪ Starting 10 workers
info:    ▪ Server running at ::1:2024
```

✅ Server up.

### Step 7: ❌ Warning, LangSmith 403

Same server output, between "Starting 10 workers" and "Server running":

```text
warn:    ┏ Failed to get organization ID. Tracing to LangSmith will not work.
warn:    ┃ [ 2]   error: Error: Failed to fetch /sessions. Received status [403]: Forbidden.
         Message: {"type":"about:blank","title":"Forbidden","status":403,"detail":"Forbidden"}
```

- **Cause (asked Claude):** `LANGSMITH_API_KEY` is still the placeholder `ls__...`. The client logs `apiKey: '***set***'` because the variable is *non-empty*, not because it is valid. So LangSmith rejects it and tracing is silently off. The server still runs.
- **Fix:** put a real LangSmith key in `.env` (or set `LANGSMITH_TRACING=false`).
- **Confirmed in step 20:** the warning is gone with a real key.

### Step 8: Health check

```bash
curl -s -w " [%{http_code}]\n" http://localhost:2024/ok
curl -s -w " [%{http_code}]\n" -H "Authorization: Bearer changeme-dev" http://localhost:2024/ok
```

```text
 [401]
{"ok":true} [200]
```

⚠️ The health endpoint requires the bearer token. This is not a setup failure, but it's worth noting: Docker and load-balancer health checks usually call it without a token.

### Step 9: List the assistants (API directly)

```bash
curl -s -X POST http://localhost:2024/assistants/search \
  -H "Authorization: Bearer changeme-dev" -H 'Content-Type: application/json' -d '{}'
```

```text
[{"assistant_id":"fe096781-...","graph_id":"agent","name":"agent",...}] [200]
```

✅ Graph `agent` is registered.

### Step 10: Start the frontend

```bash
pnpm dev:web           # = pnpm --filter web dev → vite
```

```text
  VITE v8.3.3  ready in 430 ms
  ➜  Local:   http://localhost:5173/
```

✅ OK

### Step 11: Frontend page and proxy

```bash
curl -s -o /dev/null -w "page %{http_code}\n" http://localhost:5173/
curl -s -w " [%{http_code}]\n" -X POST http://localhost:5173/api/assistants/search \
  -H 'Content-Type: application/json' -d '{}'
```

```text
page 200
[{"assistant_id":"fe096781-...","graph_id":"agent",...}] [200]
```

✅ The page loads. The proxy call has **no** token but still gets 200, so Vite injects `Authorization: Bearer <AUTH_TOKEN>` correctly.

### Step 12: Check which env vars the API code reads

```bash
grep -rhoE "(process\.env|env)\.[A-Z_]{3,}|'[A-Z]+_API_KEY'" apps/api/src packages/core/src | sort | uniq -c
```

```text
   1 'LANGCHAIN_API_KEY'
   1 'LANGSMITH_API_KEY'
```

ℹ️ Only the LangSmith key is read directly. `OPENAI_API_KEY` is read implicitly by `@langchain/openai`. The Gemini, Groq, and Tavily keys in `.env.example` are not needed to run the app.

### Step 13: ❌ Send a message to the agent, placeholder OpenAI key

```bash
curl -s -m 60 -w "\n[%{http_code}]\n" -X POST http://localhost:5173/api/runs/wait \
  -H 'Content-Type: application/json' \
  -d '{"assistant_id":"agent","input":{"messages":[{"role":"user","content":"Say hi in one word."}]}}'
```

```text
{"__error__":{"error":"Error","message":"{\"error\":\"Error\",\"message\":\"401 Incorrect API key provided: sk-....
You can find your API key at https://platform.openai.com/account/api-keys.
Troubleshooting URL: https://docs.langchain.com/oss/javascript/langchain/errors/MODEL_AUTHENTICATION/\"}"}}
[200]
```

Server log:

```text
error:   ┏ Background run failed:
Error: 401 Incorrect API key provided: sk-....
    at MiddlewareError.wrap (.../langchain/src/agents/errors.ts:127:12)
    at wrappedHandler (.../langchain/src/agents/nodes/AgentNode.ts:708:35)
```

- **Cause (asked Claude):** `OPENAI_API_KEY` is still the placeholder `sk-...`. The error is raised in `AgentNode` on the model call, so the provider is OpenAI (the primary model).
- **Second finding:** the run failed, but the HTTP status is **200** and the error sits in an `__error__` field. A script that only checks the status code would think it worked.
- **Fix:** the user puts real keys in `.env`.
- **Re-run:** step 21 (failed again, different cause), then step 24 (confirmed).

### Step 14: Stop the Run 1 servers

```bash
pkill -f "scratchpad/generative-ai"
lsof -iTCP:2024 -iTCP:5173 -sTCP:LISTEN
```

✅ No output, so the ports are free. The setup was then repeated in the project folder (Run 2).

---

## Run 2: project folder (`claude-training/generative-ai/`), repeated from scratch

### Step 15: Keep the clone out of the parent repo's git

```bash
echo "generative-ai/" >> .git/info/exclude     # in claude-training, local only, not committed
```

✅ OK

### Step 16: Clone again

```bash
git clone --branch deep-agents git@gitlab.asoft-python.com:nhat.duong/generative-ai.git
git -C generative-ai log --oneline -1
```

```text
2701be1 Merge branch 'feat/verification' into 'deep-agents'
```

✅ Same commit as Run 1.

### Step 17: Install dependencies and create the env files

```bash
cd generative-ai
pnpm install
cp .env.example .env
printf 'VITE_API_URL=http://localhost:5173/api\nAUTH_TOKEN=changeme-dev\nAPI_TARGET=http://localhost:2024\n' > apps/web/.env.local
git status --short
```

```text
Done in 4.9s using pnpm v11.22.0
```

✅ OK. `git status` is empty, so both env files are git-ignored by the repo, as they should be.

### Step 18: User fills in real keys

The user edited `.env` by hand. A check that prints only lengths, never values:

```bash
for k in OPENAI_API_KEY LANGSMITH_API_KEY LANGSMITH_TRACING AUTH_TOKEN; do
  v=$(grep -E "^$k=" .env | head -1 | cut -d= -f2-)
  case "$v" in sk-...|ls__...|"") s="placeholder/empty";; true|false|changeme-dev) s="$v";; *) s="set (${#v} chars)";; esac
  echo "$k: $s"
done
```

```text
OPENAI_API_KEY: set (164 chars)
LANGSMITH_API_KEY: set (51 chars)
LANGSMITH_TRACING: true
AUTH_TOKEN: changeme-dev
```

✅ Both keys are filled in.

### Step 19: Start both servers

```bash
pnpm dev:server
pnpm dev:web
```

```text
[langsmith] client initialized { tracing: 'true', project: 'deep-agents-phase', apiKey: '***set***' }
info:    ▪ Server running at ::1:2024
  VITE v8.3.3  ready in 542 ms
```

✅ Both up.

### Step 20: Confirm the LangSmith fix (from step 7)

```bash
grep -E "warn|error" server.log
```

✅ No `403` / "Failed to get organization ID" warning, so the LangSmith fix is confirmed.

### Step 21: ❌ Send the message again, expired OpenAI key

```bash
curl -s -m 120 -w "\n[%{http_code}]\n" -X POST http://localhost:5173/api/runs/wait \
  -H 'Content-Type: application/json' \
  -d '{"assistant_id":"agent","input":{"messages":[{"role":"user","content":"Say hi in one word."}]}}'
```

```text
HTTP 200
ERROR: {"error":"Error","message":"401 Your API key has expired. Create a new API key to continue.
Troubleshooting URL: https://docs.langchain.com/oss/javascript/langchain/errors/MODEL_AUTHENTICATION/"}
```

- **Cause (asked Claude):** this is a different 401 from step 13. The key is now real (164 chars) but **expired**. Same `MODEL_AUTHENTICATION` path, so it's the OpenAI key.
- **Attempted check:** calling `https://api.openai.com/v1/models` directly with the key, to rule out the app misreading it. Claude Code's permission check **blocked** this because it reads the secret. It wasn't retried, because the error text already comes from OpenAI.
- **Fix:** the user creates a new key at platform.openai.com and replaces `OPENAI_API_KEY`.

### Step 22: Restart the API server so it loads the new key

```bash
pkill -f "langgraphjs dev"
lsof -tiTCP:2024 -sTCP:LISTEN | xargs -r kill
pnpm dev:server
```

```text
info:    ▪ Server running at ::1:2024
```

✅ Up. The restart is required: `langgraphjs dev` reads `.env` only at startup, and hot reload covers code, not env changes.

### Step 23: Frontend still up

```bash
curl -s -o /dev/null -w "web %{http_code}\n" http://localhost:5173/
```

```text
web 200
```

✅ OK (no restart needed, because the frontend env did not change).

### Step 24: ✅ Send the message again, fix confirmed

```bash
curl -s -m 180 -w "\n[%{http_code}]\n" -X POST http://localhost:5173/api/runs/wait \
  -H 'Content-Type: application/json' \
  -d '{"assistant_id":"agent","input":{"messages":[{"role":"user","content":"Say hi in one word."}]}}'
```

```text
HTTP 200
human : Say hi in one word.
ai : [{'type': 'text', 'text': 'Hi', 'index': 0}]
```

Took 3.0 s. Server log checked with `grep -iE "warn|error|fail"`: no output, so it's clean.

✅ **The app works end to end:** browser URL → Vite proxy (token injected) → LangGraph server → OpenAI → reply.

---

## Errors and fixes

| # | Step | Error (verbatim) | Cause | Fix | Confirmed |
| --- | --- | --- | --- | --- | --- |
| E1 | 7 | `Failed to get organization ID. Tracing to LangSmith will not work. ... [403]: Forbidden` | Placeholder `LANGSMITH_API_KEY` | Real LangSmith key in `.env` | Step 20 ✅ |
| E2 | 13 | `401 Incorrect API key provided: sk-....` | Placeholder `OPENAI_API_KEY` | Real OpenAI key in `.env` | Step 21 ❌ (new error E3) |
| E3 | 21 | `401 Your API key has expired. Create a new API key to continue.` | The OpenAI key was expired | New key + restart `pnpm dev:server` | Step 24 ✅ |

## Setup problems worth reporting

1. **The server only reads env at startup.** After changing `.env`, `pnpm dev:server` must be restarted. Hot reload does not pick up env changes, and the README doesn't say this.
2. **The LangSmith placeholder key fails without a clear error.** The startup log says `apiKey: '***set***'` for a placeholder, followed by a warning that is easy to miss. Tracing is off, but the server looks healthy.
3. **Failed runs return HTTP 200.** `/runs/wait` returns 200 with an `__error__` body for a model 401. Scripts and smoke tests must check the body, not just the status.
4. **The health check needs auth.** `/ok` returns 401 without the bearer token. That's unusual for a health endpoint, and it would break a container health check.
5. **`.env.example` contains much more than the README describes.** Copying it brings Gemini, Groq, Tavily, Postgres, and Redis entries, plus a **production** `LANGGRAPH_ALLOW_ORIGIN=https://your-app.example.com`. None of these are needed for local dev, and the README only shows OpenAI + LangSmith.
6. **The frontend token name is inconsistent.** The README uses `AUTH_TOKEN` in `apps/web/.env.local` (the proxy injects it server-side). `.env.example` suggests `VITE_AUTH_TOKEN`, which would put the token into the browser bundle. The README version is the one that works.
7. **There's no way to check the keys before starting.** Both key problems (E2, E3) only showed up on the first chat message, not at startup. A pre-flight check (for example a `pnpm check-env` script that makes one cheap call per provider) would catch them earlier.
