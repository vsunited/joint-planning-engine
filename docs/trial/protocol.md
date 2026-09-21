# Time to initial WARNORD — trial protocol

**Status:** pre-registration draft. Fill in the boxed section and freeze it
*before* the first participant runs.

## 1. The claim under test

Joint Planning Engine encodes JP 5-0 as structure rather than as reference
text. The claim that follows from that, and the one this trial measures, is:

> A joint planner produces a more complete initial WARNORD, in less time, using
> JPE than using their current method.

Two measures, not one. Speed alone would be a worthless finding — a tool that
makes planners faster at producing a thinner product has made things worse.
Completeness is co-primary.

## 2. Recruit six, not five

Each participant does both conditions, so the test is a paired one. At small n
the exact Wilcoxon signed-rank test has a hard floor: the strongest result the
design can possibly produce still cannot beat a given p.

| Participants | Best achievable two-sided p | p < 0.05 reachable |
|---|---|---|
| 4 | 0.125 | no |
| **5** | **0.063** | **no** |
| **6** | **0.031** | **yes** |
| 7 | 0.016 | yes |
| 8 | 0.008 | yes |

At five participants, a perfect result — every single planner faster with the
tool — still returns p = 0.063 and cannot be called significant. At six it
returns p = 0.031 and can.

But six only clears the bar if **every one of the six** goes the same way. One
planner slower with the tool and it falls back to 0.063:

| n | all same way | one slower | two slower |
|---|---|---|---|
| 5 | 0.063 | 0.125 | 0.313 |
| 6 | **0.031** | 0.063 | 0.156 |
| 7 | **0.016** | **0.031** | 0.078 |
| 8 | **0.008** | **0.016** | **0.039** |

These are untrained planners on first exposure to the tool, working against a
method they have used for years. One of them being slower is an ordinary
outcome, not a tail risk. Eight is the number that survives it.

**A significance claim is optional.** The criterion being answered is whether
original, honest measurement exists, and that is satisfied at n = 4 with the
raw data published and the result reported descriptively. Do not let the search
for a sixth participant push the trial past the submission date; a finished
pilot with four beats an unfinished one with eight.

**The marginal sixth participant is worth more than the other five combined,
because they are what makes any inferential claim available at all.** Recruit
eight if they can be found, to absorb two dropouts and still clear six.

## 3. Design

Within-subject crossover, counterbalanced on two factors.

- **Arm:** *current method* (baseline) and *JPE* (tool).
- **Packet:** A (SENTINEL RESOLVE) and B (IRON MERIDIAN).

Every participant runs both arms, one per packet, and is their own control.
Between-subject differences in experience and typing speed cancel, which is the
only way to get signal out of a handful of people.

Order is rotated so that neither arm nor packet is systematically first:

| Participant | Run 1 | Run 2 |
|---|---|---|
| P01, P05 | baseline / A | tool / B |
| P02, P06 | tool / A | baseline / B |
| P03, P07 | baseline / B | tool / A |
| P04, P08 | tool / B | baseline / A |

This is derived from the participant code by the trial console. Do not assign
it by hand — a counterbalance maintained from memory on a busy day stops being
a counterbalance.

**Washout:** at least 24 hours between a participant's two runs.

## 4. Participants

Target: 6–8. Inclusion: has drafted or staffed an operational-level order
(WARNORD, OPORD or FRAGORD) in a real or exercise billet.

Record for each, and report in the results:

- Years of planning experience
- Service and component
- Whether JPP-trained (JPME, SAMS, JCWS or equivalent)
- Prior exposure to JPE (should be none; note it if not)

If the sample turns out to be, say, four O-3s from one command, that is a
finding about the sample and belongs in the writeup. It does not invalidate the
data; concealing it would.

## 5. Materials

- **Packets A and B** — `apps/web/src/lib/telemetry/packets.ts`, served by the
  trial console in both arms. Matched on structure: five numbered paragraphs,
  five subordinate tasks, three constraints, two restraints, five force
  elements, three date-time groups. Both fictional; no real plan content, which
  is what makes the resulting data publishable.
- **Baseline arm:** the participant's own laptop and their usual template. Do
  not supply a template — the comparison is against what they actually do
  today, not against a stripped-down straw man.
- **Tool arm:** JPE at the production build. See §9.

## 6. Procedure

Identical wording in both arms. Read it; do not paraphrase.

1. Brief the participant using `participant-script.md`. Take consent.
2. Observer opens the console and enrols the participant code. The condition is
   assigned automatically.
   - Baseline: `/trial` — packet and clock only.
   - Tool: `/?trial=1` — the workspace with the trial bar docked.

   Starting a tool-arm session clears the workspace and reorients it to that
   packet's command and operation. The observer does not configure anything,
   and does not need to reload between participants — both were contamination
   risks that should not depend on remembering a step on a busy day.
3. Participant presses **Packet opened** and reads. *(Clock starts.)*
4. Participant presses **Drafting started** at their first committed words.
5. Participant works. **The observer does not help, does not answer doctrinal
   questions, and does not touch the keyboard.** Log any question asked; do not
   answer it beyond "use your own judgement".
6. Participant presses **WARNORD complete** when they judge the order
   releasable to subordinate commands. *(Primary stop event.)*
7. Observer presses **End**, records notes, and archives.
8. Collect the product: export from JPE in the tool arm, save the document in
   the baseline arm. Strip identifying marks before scoring.

**Both arms stop on the same button, pressed by the same person under the same
instruction.** JPE could stop its own clock automatically once all eight
sections hold text, and the baseline arm has no equivalent signal — using it
would measure the gap between a clock and a human hand rather than the gap
between the two methods.

## 7. Measures

**Primary — time to WARNORD.** Packet opened → WARNORD complete. Reported as
both wall time and active time, where active excludes gaps over two minutes.
Report both; do not pick the flattering one after the fact.

**Co-primary — WARNORD completeness.** Blind-scored against
`scoring-rubric.md`: eight doctrinal sections, 0–2 each, 16 points available.
Two scorers, independently, neither knowing which arm produced the document.
Disagreements of more than one point are reconciled by discussion and the
reconciliation is logged.

**Secondary, collected automatically.** Time to first edit; edit count and
distinct fields touched; per-step dwell; number of assistant invocations and
total inference wait.

Inference wait is reported *inside* the tool arm's time, never subtracted. A
result that quietly removes a ninety-second model wait is not a result.

## 8. Pre-registration — freeze before the first run

> **Primary hypothesis:** time from packet opened to WARNORD complete is lower
> in the tool arm than the baseline arm.
>
> **Co-primary hypothesis:** completeness score is higher in the tool arm.
>
> **Test:** exact Wilcoxon signed-rank, two-sided, paired within participant.
>
> **Target n:** ______  **Recruited n:** ______  **Completed both arms:** ______
>
> **Exclusions defined in advance:** a session is excluded only if (a) the
> participant withdraws, (b) a hardware or power failure ends the run, or (c)
> the participant had prior exposure to JPE. **No session is excluded on the
> basis of its result.**
>
> **Date frozen:** ______  **Frozen by:** ______

Every completed session appears in the writeup, including any where the tool
lost. A five-person trial that reports only its wins is an advertisement, and
an evaluator who has read one before will recognise it.

## 9. Running conditions

- Run against the **production build** (`pnpm --filter @jpe/web build`), not the
  dev server. React re-invokes mount effects in development, which inflates
  event counts.
- Same machine, same browser, same model for every tool-arm session. Record the
  model; the console captures it automatically.
- Ollama must be on permanent storage, not a scratch directory.
- Confirm before each tool-arm session that inference is reachable.

## 10. Data handling

- Timing data never leaves the machine. There is no analytics endpoint.
- **Field content is never recorded.** An edit stores the field's path and its
  resulting character count. This is what keeps the trial log free of CUI and
  therefore publishable.
- Use participant codes. No names in the tool, the filenames or the writeup.
- Publish the raw JSON alongside any claim drawn from it.

This is usability evaluation of a product, not generalisable human-subjects
research, and normally falls outside IRB review. If participants are serving
DoD personnel taking part in an official capacity, confirm with the
organisation's research compliance office before running — the answer is
usually a one-line determination, and it is cheaper to get it than to explain
its absence later.

## 11. Analysis

```bash
python3 scripts/trial/analyze.py jpe-trial-raw-*.json --scores docs/trial/completeness.csv
```

Standard library only, so it runs on the air-gapped machine.

## 12. Threats to validity — state these in the writeup

| Threat | Handling | Residual |
|---|---|---|
| Demand characteristics — participants guess the hoped-for result | Neutral script; developer does not coach | **Not eliminated.** The developer is the observer. Say so. |
| Novelty effect — JPE is new and interesting | Counterbalanced order | Untreated. A single sitting cannot separate novelty from utility. |
| Learning across runs | Order counterbalanced; 24h washout | Reduced, not removed |
| Packet difficulty | Matched on structure; packet order counterbalanced | Two packets cannot be proven equivalent at this n |
| Self-reported stop point | Same button, same instruction, both arms | Participant judgement of "releasable" may itself shift between arms |
| Small, non-random sample | Reported in full | **Fatal to generalisation.** This is a pilot. |

## 13. What this can and cannot support

**Can:** "In a paired pilot with N joint planners, time to initial WARNORD fell
by a median of X minutes and completeness rose by Y points, with the raw data
published." That is an original, measured, reproducible result, and it is what
converts a data-quality assessment from *unsatisfactory* to *satisfactory*.

**Cannot:** a population-level effect size, a claim about all planners, or a
claim about sustained use over a campaign. Do not write those. An evaluator who
catches one overreach discounts everything else on the page.
