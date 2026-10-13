# Role-Play: Tickets 1, 2, 4, 5

Clarifying sessions for the four tickets not covered in Round 2, following the same format as the Ticket 3 session in [reporter-questions-roleplay.md](reporter-questions-roleplay.md).

> **Simulated session.** Claude played both roles (dev and reporter) on 2026-10-13. Reporter answers stay consistent with what the reporter already said in Rounds 1 and 2, but every **new** answer below is simulated. Confirm the items in [section 6](#6-to-confirm-with-the-real-mentor) with the real mentor before relying on them.

Known before these sessions (from Rounds 1 and 2): a working demo plus design docs for all 5 tickets, no deploy; due Friday 2026-11-06; solo; Python + RAG + LangGraph; OpenAI as main LLM with OpenRouter as manual backup; $5 per month; everything except the LLM runs locally; public or synthetic data only; the mentor approves; no template.

---

## 1. Ticket 1: Come up with ideas for the final practice

| # | Dev question | Reporter answer | Enough? | Follow-up |
| --- | --- | --- | --- | --- |
| Q1 | What is the idea judged on: difficulty, correct use of the course content, or business value? | "Using the course correctly: RAG, LangGraph, and evaluation. Difficulty isn't the point." | Yes | |
| Q2 | Should I send one idea, or a shortlist for you to pick from? | "Send 2–3, I'll pick." | Yes | |
| Q3 | By when must the idea be approved? | "The sooner the better." | No | Asked again as Q4 |
| Q4 | Is this Friday (2026-10-16) OK, or do you need it earlier? | "This Friday is fine." | Yes | |
| Q5 | How should I send it: a merge request, chat, or a meeting? | "Open a merge request, I'll approve it with a comment." | Yes | |
| Q6 | Must the idea solve a problem for a specific user, or can it be a technical showcase? | "It needs a specific user and problem." | Yes | |
| Q7 | Does the demo need a UI, or is a command-line tool enough? | "Either is fine. A simple UI or a CLI." | Yes | |
| Q8 | Does the demo need an evaluation of answer quality? | "Yes, a basic one." | Partly | "What counts as basic: a small test set with a score, or a manual check?" (see Ticket 2, Q6) |
| Q9 | Is any domain off-limits for the idea? | "I don't know of any." | Partly | Logged as an assumption: any domain is fine with public or synthetic data |

**Readiness:** Ready to start. First action: write 2–3 ideas, each with a user, a problem, why it needs RAG and an agent flow, and how quality will be evaluated, then open a merge request by Friday 2026-10-16.

---

## 2. Ticket 2: Analyze features and workflows

| # | Dev question | Reporter answer | Enough? | Follow-up |
| --- | --- | --- | --- | --- |
| Q1 | What format for features: user stories with acceptance criteria, a feature table, or free text? | "You decide." | Partly | Asked again as Q2 |
| Q2 | Is there anything each feature must include? | "It should say how I'd check it's done." | Yes | Use acceptance criteria (Given / When / Then) |
| Q3 | How many features: only what the demo needs, or the full product? | "Only the demo scope. List the rest as out of scope." | Yes | |
| Q4 | Who defines the users: you, or me from the chosen idea? | "You, from the idea." | Yes | |
| Q5 | One overall flow, or a flow per feature as well? | "Both." | Yes | |
| Q6 | Should the workflows include error paths (for example the LLM fails, or retrieval finds nothing)? | "Yes, at least the main ones." | Yes | |
| Q7 | Which non-functional requirements matter: response time, cost, accuracy, or none? | "Cost, because of the $5 limit. And accuracy, since you're evaluating." | Yes | |
| Q8 | For the evaluation: a small test set with a score, or a manual check? | "A small test set with a score." | Partly | "How many questions in the test set?" |
| Q9 | How many questions in the test set? | "10–20 is enough." | Yes | |
| Q10 | Must the workflows include a human approval step? | "Not required." | Yes | |

**Readiness:** Ready to start. First action: write the users and their problem, then demo-scope user stories with acceptance criteria, an overall flow and one flow per feature with the main error paths, cost and accuracy requirements, and a 10–20 question test set.

---

## 3. Ticket 4: Draw diagrams for workflows, high-level design, and features

| # | Dev question | Reporter answer | Enough? | Follow-up |
| --- | --- | --- | --- | --- |
| Q1 | Which drawing tool: Mermaid in the repo, draw.io, or either? | "Your choice, as long as I can view it on GitLab." | Yes | Mermaid renders on GitLab |
| Q2 | Who reads the diagrams: you as reviewer, or a developer building from them? | "Me, and you when you code." | Yes | Enough detail to build from |
| Q3 | For the "features" diagram: one overview of all features, or one diagram per feature? | "One overview." | Yes | |
| Q4 | Which diagrams are required: workflow, high-level architecture, use case, sequence? | "Workflow and high-level architecture are required. The rest is up to you." | Yes | |
| Q5 | In the high-level design, boxes only, or boxes with technology names? | "With technology names." | Yes | |
| Q6 | Should the high-level design show the agent as one box, with Ticket 5 zooming in, or the whole graph? | "One box. The detail goes in Ticket 5." | Yes | |
| Q7 | Does document loading and indexing (the RAG ingestion) need its own diagram? | "If you think it helps, draw it." | Partly | Logged as an assumption: yes, a short data-flow diagram |

**Readiness:** Ready to start. First action: draw, in Mermaid, the feature overview, the workflow diagrams from Ticket 2, and the high-level architecture with technology names and the agent as one box, plus an ingestion diagram.

---

## 4. Ticket 5: Analyze, design, and draw the graph

| # | Dev question | Reporter answer | Enough? | Follow-up |
| --- | --- | --- | --- | --- |
| Q1 | What should the output be: the diagram only, or the diagram plus a written description of state, nodes, and edges? | "Both." | Yes | |
| Q2 | One agent graph, or several agents with subgraphs? | "Your choice, as long as it makes sense for the idea." | Partly | Decide after the idea is approved; record the choice in a Ticket 3 decision record |
| Q3 | Should the error paths from Ticket 2 appear as nodes or edges in the graph? | "Yes, the main ones." | Yes | |
| Q4 | If the graph loops, must the loop limit be shown? | "Yes." | Yes | |
| Q5 | Should switching to the OpenRouter backup appear in the graph? | "No, that's configuration, not a node." | Yes | |
| Q6 | Must the graph remember past conversations, or is one session enough? | "One session is enough for the demo." | Yes | |
| Q7 | Must the designed graph match the one in code at demo time? | "It should match." | Partly | Asked again as Q8 |
| Q8 | If the code changes, can it differ as long as I update the doc, or must the design be fixed? | "It can change, but update the doc." | Yes | |
| Q9 | Is a human approval pause required in the graph? | "Not required." | Yes | Consistent with Ticket 2, Q10 |

**Readiness:** Ready to start once Ticket 2 is done. First action: list the state fields, then derive the nodes and conditional edges from the Ticket 2 flows, including the main error paths and loop limits.

---

## 5. Readiness check (all tickets)

| Check | Ticket 1 | Ticket 2 | Ticket 4 | Ticket 5 |
| --- | --- | --- | --- | --- |
| I know what the deliverable is | Yes: 2–3 ideas in a merge request | Yes: demo-scope features with acceptance criteria, flows, NFRs, test set | Yes: feature overview, workflows, high-level architecture | Yes: graph diagram plus description of state, nodes, edges |
| I know when it is done and who approves it | Yes: mentor approves on the merge request by 2026-10-16 | Partly: mentor approves; no date given | Partly: mentor approves; no date given | Partly: mentor approves; no date given |
| I know the constraints | Yes | Yes | Yes: viewable on GitLab | Yes: one session, no human pause required |
| Every ambiguous term now has one meaning | Yes: "suitable" means applying the course correctly | Yes: "detail" means acceptance criteria | Yes: "features diagram" means one overview | Partly: single agent or several is decided after the idea |
| I can name my first concrete action | Yes | Yes | Yes | Yes, after Ticket 2 |
| Assumptions are written down and shared | Partly: listed in section 6 | Partly: listed in section 6 | Partly: listed in section 6 | Partly: listed in section 6 |

**Verdict:** Ready to start all four with logged assumptions. The open point across Tickets 2–5 is the review date for each one. This is the same gap as the unanswered Ticket 3 Q11.

---

## 6. To confirm with the real mentor

These answers are simulated and decide real work:

1. The idea must be approved by Friday 2026-10-16, via a merge request.
2. The evaluation is a 10–20 question test set with a score.
3. The workflow and high-level architecture diagrams are required.
4. The graph may change during coding, as long as the doc is updated.
5. When is each of Tickets 2–5 reviewed? (still open, same as Ticket 3 Q11)

Assumptions to share:

- Any domain is fine with public or synthetic data.
- Features use user stories with Given / When / Then acceptance criteria.
- The RAG ingestion gets its own data-flow diagram.

## 7. Retro

| Question | Answer |
| --- | --- |
| Most informative | Ticket 1 Q1 (judging criteria). It answers the core ambiguity of Ticket 1 and shapes the idea, the evaluation, and the graph. |
| Hardest to answer | Vague answers ("the sooner the better", "it should match") each needed a follow-up offering concrete options. |
| Lessons applied from Rounds 1 and 2 | One idea per question; a follow-up on every "you decide" (T2 Q1 → Q2); asking for concrete numbers when an answer is vague (T1 Q3 → Q4, T2 Q8 → Q9). |
| Still missing | A review date for each ticket. Ask it first next time, because it is the Definition of Done question. |
