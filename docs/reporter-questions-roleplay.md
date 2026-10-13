# Reporter Questions and Role-Play

Practice for asking the ticket reporter clarifying questions, then checking in a pair role-play whether the answers are enough to start work.

Related: [ticket-analysis-review.md](ticket-analysis-review.md) (the full gap analysis for Tickets 1–5).

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

Record the conversation:

| # | Dev question | Reporter answer | Enough? (Yes / Partly / No) | Follow-up question if not |
| --- | --- | --- | --- | --- |
| Q1 | Design documents, working demo, or deployed product? | | | |
| Q2 | When is it due? | | | |
| Q3 | Which parts of the stack are fixed? | | | |
| Q4 | "Graph" in Ticket 5 means? | | | |
| Q5 | Sample or template from a previous batch? | | | |

Example of a filled round (sample answers, used only to show the flow):

| # | Reporter answer | Enough? | Follow-up |
| --- | --- | --- | --- |
| Q1 | "A working demo, it doesn't need to be deployed." | Partly | "Does the demo need automated tests or an evaluation report?" |
| Q2 | "In two weeks." | Yes | |
| Q3 | "It must use RAG and LangGraph. Language is your choice." | Partly | "Which LLM provider, and is an API key provided?" |
| Q4 | "The LangGraph flow." | Yes | |
| Q5 | "No sample. Markdown in the repo is fine." | Partly | "Who reviews it, and is there a check after Ticket 1?" |

### Round 2: My partner is the dev, I am the reporter (partner's ticket)

My partner brings their own ticket and question list. I answer as the reporter of that ticket.

Use the same recording table. As the reporter:

- Answer with facts and observations, not guesses about the cause.
- Notice which questions were easy to answer (closed, with options) and which were hard (vague or multi-part). Give that feedback after the round.

---

## 4. Readiness check: does the dev have enough to start?

Answer after each round. If any line is **No**, the dev asks a follow-up question before starting, and doesn't fill the gap with an assumption.

| Check | Round 1 | Round 2 |
| --- | --- | --- |
| I know what the deliverable is (document, demo, fix) | | |
| I know when it is done (Definition of Done) and who approves it | | |
| I know the constraints (deadline, people, tech, data, budget) | | |
| Every ambiguous term in the ticket now has one meaning | | |
| I can name my first concrete action | | |
| Assumptions I am still making are written down and shared with the reporter | | |

**Verdict:** Ready to start / Ready to start with logged assumptions / Not ready (send follow-ups)

### Retro (2 minutes, both roles)

- Which question gave the most information?
- Which question did the reporter struggle to answer, and how would you reword it?
- What did the dev assume that turned out to be wrong?
