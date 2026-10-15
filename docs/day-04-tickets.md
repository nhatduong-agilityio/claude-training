# Day 04 Tickets: follow-ups from issue #1

<!-- markdownlint-disable MD024 -- each ticket repeats the same section headings -->

These are two display issues found while fixing issue #1 (MR !155, merged into `deep-agents` at `99b6938`). Both were left out of !155 on purpose to keep it in scope. Every fact below was measured on Day 03 ([day-03-report.md](day-03-report.md)); anything not yet known is marked TODO.

| Ticket | Title | GitLab issue |
| --- | --- | --- |
| A | Message input does not grow taller for multi-line messages | nhat.duong/generative-ai#9 |
| B | Sent messages show line breaks on one row | nhat.duong/generative-ai#8 |

---

## Ticket A (#9): Message input does not grow taller for multi-line messages

### Summary

Since !155, Shift+Enter adds a new line in the message box. But the box stays one row high, so the earlier lines scroll out of view while you type.

### Steps to reproduce

1. Run the web app on `deep-agents` (`pnpm dev:server`, `pnpm dev:web`, then open <http://localhost:5173>).
2. Click the message input and type `line one`.
3. Press **Shift+Enter**, then type `line two`.

### Expected

The box grows taller to show both lines.

TODO: decide the maximum height (number of lines) before the box starts to scroll.

### Actual

- The box stays one row high: **42px**, while the text needs **60px**.
- `line one` scrolls out of view.
- The only way to see both lines is to drag the box's corner to resize it (`resize: both`).

### Environment

- Web, Google Chrome headless (through Playwright). Chrome version: TODO
- Branch `deep-agents` at `99b6938`

### Evidence

Measured with Playwright:

```text
empty      {"client":42,"scroll":42,"resize":"both"}
two lines  {"client":42,"scroll":60,"resize":"both"}
```

### Where to look

- `apps/web/src/App.tsx:310`: the textarea has `rows={1}` and no code that resizes it.
- `apps/web/src/theme.css:699`: `.input-text` sets `min-height: 38px`.

### Open questions

- What is the maximum number of lines before the box scrolls?
- Should the drag-to-resize corner stay?
- After a message is sent, should the box shrink back to one row?

### Definition of done

- The box grows with each line, up to the agreed maximum, then scrolls.
- The box goes back to one row after sending.
- There is a test for growing and resetting, and the full test suite and type check pass.

---

## Ticket B (#8): Sent messages show line breaks on one row

### Summary

A message typed on two lines (using Shift+Enter) is sent correctly, with the line break, but the chat bubble shows it on a single line.

### Steps to reproduce

1. Run the web app on `deep-agents`, as in Ticket A.
2. Type `line one`, press **Shift+Enter**, type `line two`.
3. Press **Enter** to send.

### Expected

The sent bubble shows two lines:

```text
line one
line two
```

### Actual

The bubble shows `line one line two` on one row.

### Environment

The same as Ticket A.

### Evidence

The line break is in the data and is lost only when the bubble is displayed:

```text
Request body (/api/threads/<id>/commands): "content":"line one\nline two"
Bubble textContent:                         "line one\nline two"
Bubble computed white-space:                normal
```

### Where to look

- `apps/web/src/App.tsx:217`: human messages are rendered as plain text (`{isAI ? <Markdown>{content}</Markdown> : content}`).
- `apps/web/src/theme.css:338` (`.msg-bubble`) and `:346` (`.msg-bubble--human`) set no `white-space`. The browser default (`normal`) turns `\n` into a space.

**Suggested direction (not tested yet):** `white-space: pre-wrap` on `.msg-bubble--human`.

### Open questions

- Are AI messages affected? They are rendered through Markdown. Not checked: TODO.
- Should several blank lines in a row be kept as they are, or collapsed?

### Definition of done

- A sent multi-line message shows each line on its own row.
- Long lines still wrap.
- A test checks the rendered bubble, and the full test suite and type check pass.
