# Bug reproduction: Shift+Enter always submits the message

- **Issue:** [claude-training#1](https://gitlab.asoft-python.com/nhat.duong/claude-training/-/issues/1) "Line breaks are not possible"
- **App:** generative-ai, branch `deep-agents` (HEAD `2701be1`), web frontend `apps/web`
- **Date:** 2026-10-13
- **Result:** ✅ **Reproduced from the report alone, with no clarifying questions asked.**

---

## 1. The report as received

> **Steps to reproduce**
>
> 1. Run the web app
> 2. Focus on the input and write some things
> 3. Try breaking a new line
>
> **Expected:** When I press Shift+Enter, it should break a new line
> **Actual:** Always submits the input
> **Environment:** Web

### Why no questions were needed

| What a dev needs | Where the report gives it |
| --- | --- |
| Which app and screen | "the web app", "the input". There is only one chat input on the page. |
| The exact action | Shift+Enter (from "Expected") |
| Expected result | A new line in the input |
| Actual result | The input is submitted |
| Environment | Web. It's browser behavior, so any modern browser should do. |

---

## 2. Environment used

| Item | Value |
| --- | --- |
| OS | macOS (Darwin 25.0.0) |
| Browser | Google Chrome (headless), driven by Playwright `@playwright/test` 1.64.0 |
| Servers | `pnpm dev:server` (localhost:2024) and `pnpm dev:web` (localhost:5173), set up as in [setup-log-generative-ai.md](setup-log-generative-ai.md) |

---

## 3. Reproduction

### Script

`repro-shift-enter.mjs`, run from `generative-ai/apps/web` so that `@playwright/test` resolves:

```js
// Reproduces: "Shift+Enter should insert a line break, but always submits"
import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
await page.goto('http://localhost:5173');
const input = page.getByRole('textbox', { name: /message input/i });
console.log('Element tag:', await input.evaluate((el) => el.tagName.toLowerCase() + '[type=' + (el.type || '') + ']'));
const log = page.getByRole('log', { name: /message history/i });
const before = await log.locator('.msg-bubble--human').count();

await input.click();                          // step 2: focus the input
await input.pressSequentially('line one');    // step 2: write some things
await page.keyboard.press('Shift+Enter');     // step 3: try breaking a new line
await page.waitForTimeout(800);

const value = await input.inputValue();
const after = await log.locator('.msg-bubble--human').count();
console.log('Input value after Shift+Enter:', JSON.stringify(value));
console.log('Human messages before/after:', before, '->', after);
console.log('Last human message:', after ? JSON.stringify(await log.locator('.msg-bubble--human').last().textContent()) : '-');
console.log(after > before && !value.includes('\n') ? 'REPRODUCED: Shift+Enter submitted the message, no line break' : 'NOT reproduced');
await browser.close();
```

### Command

```bash
cd generative-ai/apps/web
node ./.repro-shift-enter.mjs      # script copied in temporarily, deleted after the run
```

### Output

```text
Element tag: input[type=text]
Input value after Shift+Enter: ""
Human messages before/after: 0 -> 1
Last human message: "line one"
REPRODUCED: Shift+Enter submitted the message, no line break
```

| | Expected | Actual |
| --- | --- | --- |
| Input after Shift+Enter | `"line one\n"` (cursor on a new line) | `""` (cleared) |
| Messages sent | 0 | 1 (`"line one"`) |

---

## 4. Root cause

`apps/web/src/App.tsx:293-301`:

```tsx
<form onSubmit={handleSubmit} className="chat-form">
  <input
    aria-label="Message input"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    ...
  />
```

1. **The message box is a single-line `<input type="text">`.** A single-line input cannot contain a line break, so Shift+Enter can never insert one.
2. **The browser submits the form on Enter in a single-line input, and it ignores modifier keys.** Shift+Enter therefore submits the same way Enter does. This is called implicit submission.
3. **There is no `onKeyDown` handler** that could tell Enter and Shift+Enter apart.

---

## 5. Proposed fix (not applied)

- Replace the `<input>` with a `<textarea rows={1}>`, styled the same way.
- Add `onKeyDown`:
  - **Enter** without Shift calls `preventDefault()` and submits the form.
  - **Shift+Enter** falls through to the default behavior, which inserts a line break.
  - Skip submitting while `e.nativeEvent.isComposing` is true. Otherwise the Enter that a Vietnamese or other typing method uses to confirm a word would send the message too early.
- Keep `handleSubmit` unchanged. `input.trim()` already ignores trailing line breaks.
- Add tests:
  - In `apps/web/src/__tests__/App.test.tsx`: Shift+Enter keeps the text and adds `\n` without submitting; Enter submits.
  - Update `apps/web/e2e/chat.spec.ts`, which still presses `Enter` on the input and should keep passing.

**Confirm the fix:** re-run the script in section 3. Expected output: the input value contains `\n`, human messages stay at `0 -> 0`, and the script prints `NOT reproduced`.

---

## 6. Root-cause hypotheses (tested)

Rule followed: a hypothesis is marked **correct** only after a test was run. Tests ran in real Chrome (headless, Playwright) against the running app at `localhost:5173`.

### Hypotheses, ranked by likelihood before testing

| Rank | Hypothesis | Prior | How to test it |
| --- | --- | --- | --- |
| **H1** | **Browser implicit submission.** The box is a single-line `<input type="text">` in a `<form>`. It cannot hold `\n`, and the browser submits the form on Enter whether or not Shift is held. No app code is involved. | High | **T1a** set `value = "a\nb"` on the element and read it back. **T1b** block only the browser's default action for Shift+Enter (capture-phase `preventDefault`) and check whether a message is still sent. **T1c** the same keypress on plain HTML `<form><input>` with no React, with `<textarea>` as a control. |
| **H2** | **App or library key handler.** Some handler in the app, React, or a dependency submits on any Enter and ignores `shiftKey`. | Medium | **T2a** grep `apps/web/src` for `onKeyDown`, `onKeyPress`, `onKeyUp`, `addEventListener('key…')`, hotkey libraries, and check `package.json` dependencies. **T2b** reuse T1b: blocking the default action does *not* stop app listeners, so if a message is still sent, a handler is doing it. |
| **H3** | **Shift never reaches the page.** The event arrives as a plain Enter (`shiftKey: false`), for example because of the keyboard layout, the OS, the typing method, or the test tool. The app then behaves "correctly" for Enter. | Low, **least certain** | **T3** a capture-phase `keydown` logger on `document` records `key` and `shiftKey`, plus a `submit` logger that records which button submitted. |

**Least certain: H3.** It's the least likely, and the test can only check the environment used here (Playwright on macOS). It can't fully rule out a different keyboard or typing method on the reporter's machine.

### Commands run

```bash
# T2a: static search (in generative-ai/apps/web)
grep -rnE "onKeyDown|onKeyPress|onKeyUp|addEventListener\(['\"]key|useHotkeys|hotkey" src --exclude-dir=__tests__
grep -nE '"dependencies"' -A12 package.json

# T1a, T1b/T2b, T3: script hypotheses-shift-enter.mjs (copied into apps/web, run, then deleted)
node ./.hyp.mjs

# T1c re-run with a fresh page per case (see "Test error" below)
node ./.hyp2.mjs
```

### Raw output

```text
$ grep ...                    → no matches (exit=1)
dependencies: @langchain/core, @langchain/langgraph-sdk, @langchain/react, react, react-dom, react-markdown
                              → no hotkey / keyboard library

T3 Enter keydown events: [{"key":"Enter","shiftKey":true}]
T3 form submitted by: "Send" | messages 0 -> 1
T1a element: input[type=text] | value set to "a\nb", stored as: "ab"
T1b/T2 with default action blocked: messages 0 -> 0 | input value: "t1b"

T1c <input id: submits = 1 | value: "plain"
T1c <textarea: submits = 0 | value: "plain\n"
```

### Verdicts

| Hypothesis | Verdict | Evidence |
| --- | --- | --- |
| **H1** Browser implicit submission | ✅ **Correct** (tested) | **T1a:** the element is `input[type=text]` and strips `\n` (`"a\nb"` is stored as `"ab"`). **T1b:** blocking *only* the browser default action means nothing is sent (`0 -> 0`) and the text stays. **T1c:** plain HTML with no app code also submits on Shift+Enter, while the `<textarea>` control inserts `\n` and does not submit. **T3:** the submit's `submitter` is the "Send" button, which is how implicit submission reports itself. |
| **H2** App or library key handler | ❌ **Wrong** (tested) | **T2a:** no key handlers in source and no hotkey library. **T2b:** with the default blocked, app listeners still ran but nothing was sent, so no handler is submitting. |
| **H3** Shift not reaching the page | ❌ **Wrong** in this environment (tested) | **T3:** `keydown` arrives with `shiftKey: true`, yet the form still submits. Not tested: other keyboards or typing methods on the reporter's machine. Even if Shift were lost there, H1 alone already produces the bug. |

**Conclusion:** the cause is H1. The fix in section 5 (`<textarea>` + an `onKeyDown` that submits only on Enter without Shift, skipping while a typing method is composing) addresses it directly. The T1c control already shows that a `<textarea>` inserts `\n` on Shift+Enter without submitting.

### Test error found during testing

The first T1c run reported `submits = 1` for the `<textarea>` control as well. The cause: `page.setContent` on the **same page** kept `window.__n` from the previous `<input>` case, so the counter was not reset. It was re-run with a new page per case and the counter set to `0`, which gave the clean result above (`<textarea>`: `submits = 0`). Recorded so that the first, misleading number is not reused.

---

## 7. Failing test that describes the correct behavior

Added to `generative-ai/apps/web/src/__tests__/App.test.tsx` (new block "5b. Multi-line input"). It uses `@testing-library/user-event`, which was already a dev dependency. `user-event` simulates real key presses, including the browser's implicit form submission on Enter. The bug is **not fixed** yet; the fix is planned for Day 03.

```tsx
describe('Multi-line input', () => {
  it('Enter without Shift sends the message', async () => {          // control: must PASS now and after the fix
    const user = userEvent.setup();
    const submitMock = vi.fn();
    mockUseStream.mockReturnValue(mockReturn({ submit: submitMock }));
    render(<App />);
    await user.type(screen.getByRole('textbox', { name: /message input/i }), 'line one');
    await user.keyboard('{Enter}');
    expect(submitMock).toHaveBeenCalledWith({ messages: [{ type: 'human', content: 'line one' }] });
  });

  it('Shift+Enter inserts a line break and does not send the message', async () => {   // bug: FAILS now
    const user = userEvent.setup();
    const submitMock = vi.fn();
    mockUseStream.mockReturnValue(mockReturn({ submit: submitMock }));
    render(<App />);
    const input = screen.getByRole('textbox', { name: /message input/i }) as HTMLInputElement;
    await user.type(input, 'line one');
    await user.keyboard('{Shift>}{Enter}{/Shift}');
    expect(submitMock, 'Shift+Enter must not send the message').not.toHaveBeenCalled();
    expect(input.value, 'Shift+Enter must insert a line break').toBe('line one\n');
  });
});
```

### Commands

```bash
cd generative-ai/apps/web
pnpm test                                   # baseline BEFORE adding the test: 85 passed
npx vitest run src/__tests__/App.test.tsx -t "Multi-line input"
pnpm test                                   # full suite after adding the test
npx tsc --noEmit -p .                       # no output = no type errors
npx prettier --check apps/web/src/__tests__/App.test.tsx   # from repo root
```

### Failure message (verbatim)

```text
FAIL  src/__tests__/App.test.tsx > Multi-line input > Shift+Enter inserts a line break and does not send the message
AssertionError: Shift+Enter must not send the message: expected "vi.fn()" to not be called at all, but actually been called 1 times

  1st vi.fn() call:
    { "messages": [ { "content": "line one", "type": "human" } ] }

 ❯ src/__tests__/App.test.tsx:419:69
```

### Checks: does it fail for the right reason?

| Check | Result |
| --- | --- |
| The error message matches the report's **"Actual: Always submits the input"** | ✅ "expected ... to not be called at all, but actually been called 1 times", with the message `"line one"` sent |
| Not a syntax or type error | ✅ `tsc --noEmit` is clean, Prettier passes, and the test file loads (70 other tests run) |
| Not missing setup | ✅ The control test "Enter without Shift sends the message" **passes** with the same render, mock, and `user-event`, so the harness can type and submit |
| Nothing else broken | ✅ Full suite: **1 failed, 86 passed** (85 old + the new control). The only failure is the bug test. |
| Will pass once fixed | The second assertion (`input.value === "line one\n"`) also describes the expected behavior. It is currently never reached because the first assertion fails first. |
