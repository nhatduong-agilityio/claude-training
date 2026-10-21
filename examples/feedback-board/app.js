// Feedback board: a Day 11 training app for testing from a Claude Code session (console logs, form fill).
const STORAGE_KEY = 'feedback-board.items';
const MAX_MESSAGE = 500;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const form = document.getElementById('feedback-form');
const fields = {
  name: document.getElementById('name'),
  email: document.getElementById('email'),
  message: document.getElementById('message'),
};
const filterBox = document.getElementById('filter');
const list = document.getElementById('cards');
const counter = document.getElementById('counter');
const latest = document.getElementById('latest');
const empty = document.getElementById('empty');
const noMatch = document.getElementById('no-match');
let seq = 0;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : [];
    const valid = Array.isArray(data)
      ? data.filter((i) => i && typeof i.name === 'string' && typeof i.message === 'string')
      : [];
    if (valid.length !== (Array.isArray(data) ? data.length : raw ? 1 : 0)) {
      console.warn('Dropped saved feedback with an unexpected shape');
    }
    return valid;
  } catch {
    console.warn('Could not read saved feedback; starting empty');
    return [];
  }
}

function save(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    console.warn('Could not save feedback (storage unavailable)');
  }
}

let items = load();

function validate(values) {
  const errors = {};
  if (values.name.trim().length === 0) errors.name = 'Name is required.';
  if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Enter a valid email address.';
  if (values.message.trim().length === 0) errors.message = 'Message is required.';
  else if (values.message.trim().length > MAX_MESSAGE) errors.message = `Keep it under ${MAX_MESSAGE} characters.`;
  return errors;
}

function showErrors(errors) {
  for (const key of Object.keys(fields)) {
    document.getElementById(`${key}-error`).textContent = errors[key] ?? '';
  }
}

function cardFor(item) {
  const li = document.createElement('li');
  li.className = 'card';
  const head = document.createElement('div');
  head.className = 'card-head';
  const who = document.createElement('strong');
  who.textContent = item.name;
  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'delete';
  del.textContent = 'Delete';
  del.setAttribute('aria-label', `delete message from ${item.name}`);
  del.addEventListener('click', () => removeItem(item.id));
  head.append(who, del);
  const body = document.createElement('p');
  body.className = 'card-body';
  body.textContent = item.message;
  li.append(head, body);
  return li;
}

function render() {
  const q = filterBox.value.trim().toLowerCase();
  const shown = items.filter(
    (i) => !q || i.name.toLowerCase().includes(q) || i.message.toLowerCase().includes(q),
  );
  list.replaceChildren(...shown.map(cardFor));
  latest.textContent = items.length > 0 ? `Latest from ${items[0].name}` : '';
  counter.textContent =
    items.length === 0 ? 'No messages yet' : `${items.length} message${items.length === 1 ? '' : 's'}`;
  empty.hidden = items.length > 0;
  noMatch.hidden = items.length === 0 || shown.length > 0;
}

function removeItem(id) {
  items = items.filter((i) => i.id !== id);
  save(items);
  console.info('Feedback deleted', { id, remaining: items.length });
  render();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const values = {
    name: fields.name.value,
    email: fields.email.value,
    message: fields.message.value,
  };
  const errors = validate(values);
  showErrors(errors);
  if (Object.keys(errors).length > 0) {
    console.warn('Feedback not sent: invalid input', Object.keys(errors));
    return;
  }
  const item = {
    id: `${Date.now().toString(36)}-${(seq += 1)}`,
    name: values.name.trim(),
    message: values.message.trim(),
    at: new Date().toISOString(),
  };
  items = [item, ...items];
  save(items);
  console.info('Feedback saved', { id: item.id, length: item.message.length });
  form.reset();
  render();
});

fields.message.addEventListener('keydown', (e) => {
  // Enter sends, Shift+Enter adds a line; skip the Enter that confirms IME composition
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229) {
    e.preventDefault();
    form.requestSubmit();
  }
});

filterBox.addEventListener('input', render);

render();
