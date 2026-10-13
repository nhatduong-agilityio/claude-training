# Reporter Questions and Role-Play

Practice for asking the ticket reporter clarifying questions, then checking in a pair role-play whether the answers are enough to start work.

Related: [ticket-analysis-review.md](ticket-analysis-review.md) (the full gap analysis for Tickets 1–5).

Simulated sessions for Tickets 1, 2, 4, and 5: [roleplay-remaining-tickets.md](roleplay-remaining-tickets.md).

---

## 1. What makes a good question

| Rule | Why |
| --- | --- |
| Ask one thing per question | The reporter can answer quickly and nothing gets skipped |
| Offer options when possible | Closed choices are faster to answer and leave less room for interpretation |
| Ask about what the reporter knows or expects, not about the solution | The reporter owns the need; the dev owns the solution |
| Narrow the scope | Pins down who, what, and which constraints apply |
| Ask for a baseline | A previous sample or reference shows what "good" looks like |
| Ask for evidence | Templates, samples, or documents beat descriptions |

My first draft of questions for Tickets 1–5 broke the first rule: each question bundled 2–4 questions. The set below rewrites them following these rules.

---

## 2. Questions for the reporter (Tickets 1–5: GenAI final practice)

| # | Question | Rule applied | Unblocks |
| --- | --- | --- | --- |
| Q1 | At the end of the course, what do you expect to see: only design documents, a working demo, or a deployed product? | Options | All tickets (how deep to go) |
| Q2 | When is the final practice due? | Narrow the scope | T1 (feasibility) |
| Q3 | Which parts of the stack are fixed: the course topics to use (for example RAG, agents, LangGraph), the language, the LLM provider, or none? | Options | T1, T3 |
| Q4 | In Ticket 5, does "graph" mean the agent flow (nodes, edges, state), a knowledge graph, or something else? | Options | T5, T4 |
| Q5 | Is there a sample from a previous batch, or a template, that I can follow for the format? | Baseline + evidence | All tickets (format and DoD) |

Questions kept in reserve, in case the answers above leave gaps:

- Do I work alone or in a team?
- Who approves the idea before I move to Ticket 2?
- Is an API key or budget provided for LLM calls?
- Can I use real company data, or only public or synthetic data?

---

## 3. Role-play

### Setup

- Work in pairs, about 10 minutes per round.
- **Dev** asks the questions and takes notes. The dev must not suggest answers.
- **Reporter** answers only from what they "know". If the reporter does not know something, they say "I don't know" instead of inventing an answer.
- After each round, fill in the readiness check (section 4) together.

### Round 1: I am the dev, my partner is the reporter (Tickets 1–5)

Give the reporter card to your partner before starting.

> **Reporter card (for the partner).** You are the training mentor who wrote Tickets 1–5. Decide your answers before the round and stay consistent. You may say "I don't know" or "you decide" for some questions. That tests whether the dev follows up.

Session record (played 2026-10-13, reporter answers in Vietnamese, translated):

| # | Dev question | Reporter answer | Enough? | Follow-up question if not |
| --- | --- | --- | --- | --- |
| 0 | *(All 9 questions sent at once)* | "Too many, I'll answer the first: something that runs, to demo." | No | Ask one question at a time |
| Q1 | Design documents, working demo, or deployed product? | "A working demo is fine, no deploy. The design docs for all 5 tickets are still required." | Partly | "Should the demo have a UI, or is a command-line tool enough?" then "Does the demo need an evaluation of answer quality?" |
| Q2 | When is it due? | "Demo day, Friday 6/11." | Partly | "When do you need the idea for approval?" |
| Q3 | Which parts of the stack are fixed? | "RAG and LangGraph are required, Python. Provider: I don't know." | Partly | "Who should I ask about the LLM provider?" |
| Q4 | "Graph" in Ticket 5 means? | "The agent flow, the LangGraph graph of your project." | Yes | (Optional) "A separate diagram, or a zoom-in of the high-level design?" |
| Q5 | Sample or template from a previous batch? | "No sample. You decide the format." | Partly | "Where should I submit: the GitLab repo or somewhere else?" |
| R1 | Alone or in a team? | "Alone." | Yes | |
| R2 | Who approves the idea? | "I do." | Partly | "How should I send it for approval: a merge request, chat, or a meeting?" |
| R3 | API key or budget provided? | "I don't know, the training team handles keys." | Partly | Two ideas in one question. Split into "Is an API key provided?" and "Who should I ask?" |
| R4 | Company data or public/synthetic? | "Public or self-made only." | Yes | |

The reporter's planned answers, revealed after the round, showed what the dev missed: the demo must include a basic **evaluation of answer quality**, docs must live in the **GitLab repo**, approval is a **comment on the merge request**, and the idea is judged on **applying RAG + LangGraph + evaluation correctly**, not on difficulty.

### Round 2: My partner is the dev, I am the reporter (Ticket 3)

The partner asks about one ticket, one question at a time. I answer as the reporter of that ticket.

Use the same recording table. As the reporter:

- Answer with facts and observations, not guesses about the cause.
- Notice which questions were easy to answer (closed, with options) and which were hard (vague or multi-part). Give that feedback after the round.

Session record (played 2026-10-13, Ticket 3: tech stack and patterns):

| # | Dev question | Reporter answer | Enough? | Follow-up question if not |
| --- | --- | --- | --- | --- |
| Q1 | What should the output look like: a list, a comparison table, or a decision record per choice? | A full decision record for each choice | Partly | "Which sections must a record have?" |
| Q2 | Records only for open choices, or for the course-fixed ones too? | The fixed ones too | Yes | |
| Q3 | AI patterns only, or software architecture patterns too? | Both | Yes | |
| Q4 | LLM provider: my own choice, or wait for the training team? | "We use OPEN API KEY" | No | Asked again as Q5 |
| Q5 | OpenAI, or an open/free key from another provider? | OpenAI, plus a free key from another provider as backup | Yes | |
| Q6 | Which backup provider? | OpenRouter | Yes | |
| Q7 | Switch to the backup automatically on failure, or by hand? | By hand | Yes | |
| Q8 | Spending limit on the OpenAI key? | $5 | No | Asked again as Q9 |
| Q9 | $5 for the whole practice, or per week or month? | Per month | Yes | |
| Q10 | Other services (for example the vector DB) on my machine, or in the cloud? | On my machine | Yes | |
| Q11 | Review Ticket 3 on its own, or with Tickets 4 and 5? | *(not answered, round ended)* | No | Ask again before submitting |

---

## 4. Readiness check: does the dev have enough to start?

Answer after each round. If any line is **No**, the dev asks a follow-up question before starting, and doesn't fill the gap with an assumption.

| Check | Round 1 (Tickets 1–5) | Round 2 (Ticket 3) |
| --- | --- | --- |
| I know what the deliverable is (document, demo, fix) | Partly: docs for all 5 tickets plus a working demo, no deploy; demo level (UI or CLI, evaluation) still unknown | Yes: one decision record per choice, fixed ones included, covering AI and software architecture patterns |
| I know when it is done (Definition of Done) and who approves it | Partly: the mentor approves and the final date is 6/11; the idea-approval deadline and how to submit are unknown | Partly: the mentor approves, but the Ticket 3 review timing is unanswered and the record sections are not defined |
| I know the constraints (deadline, people, tech, data, budget) | Partly: deadline, solo, Python + RAG + LangGraph, public or synthetic data; provider and API key unknown | Yes: OpenAI main, OpenRouter manual backup, $5 per month, everything except the LLM runs locally |
| Every ambiguous term in the ticket now has one meaning | Partly: "graph" settled; "suitable idea" and "a working demo" still open | Yes: "OPEN API KEY" and "$5" clarified with follow-ups |
| I can name my first concrete action | Yes: shortlist 3–5 ideas that need RAG + LangGraph on public data, score them, send to the mentor; ask the training team about the API key | Yes: list the decisions, write records for the fixed choices first, estimate monthly cost against $5 |
| Assumptions I am still making are written down and shared with the reporter | No: not yet shared (see below) | No: not yet shared (see below) |

Assumptions to share with the reporter:

- Round 1: the demo runs locally with a simple UI; docs are Markdown + Mermaid in the GitLab repo; the idea needs approval about one week before 6/11.
- Round 2: decision records use the standard structure (context, options, decision, consequences); the $5 also covers embeddings; "my machine" means the demo runs on the dev's laptop.

**Verdict:** Ready to start / Ready to start with logged assumptions / Not ready (send follow-ups)

- **Round 1:** Ready to start Ticket 1 with logged assumptions. Not ready for Ticket 3 until the provider and API key are known (resolved in Round 2).
- **Round 2:** Ready to start Ticket 3 with logged assumptions, once Q11 (review timing) is answered.

### Retro (2 minutes, both roles)

- Which question gave the most information?
- Which question did the reporter struggle to answer, and how would you reword it?
- What did the dev assume that turned out to be wrong?

Retro notes (2026-10-13):

| Question | Round 1 | Round 2 |
| --- | --- | --- |
| Most informative | Q3: fixed RAG + LangGraph + Python, narrowing Tickets 1 and 3 | Q5 (provider plus backup) and Q10 (everything local) |
| Hardest to answer | Sending all 9 questions at once; R3 bundled "key" and "budget" | None hard; Q4 and Q8 got vague answers that needed a follow-up |
| Dev assumptions that were wrong or unchecked | Treated "a working demo" as complete (missed the evaluation requirement); no follow-up on "I don't know" or "you decide"; never asked the judging criteria or the approval milestone | Asked the review timing last, so it went unanswered; did not ask whether $5 covers embeddings |
| Lesson | Follow up every "I don't know" with "who knows?" and every "you decide" with "anything it must include?" | Clarify vague units and names right away; ask Definition of Done questions early |
