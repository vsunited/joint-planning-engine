# WARNORD completeness — blind scoring rubric

16 points. Eight doctrinal sections, 0–2 each. The sections are the ones the
application encodes from JP 5-0 (`WARNORD_SECTIONS` in `@jpe/shared`), so the
rubric and the tool are held to the same standard.

## Before scoring

1. Strip every identifying mark from the documents: participant code, arm,
   filenames, fonts and headers that give away which tool produced them.
   Re-export or re-type headers if the formatting is a tell.
2. Number the documents randomly. The scorer must not be able to work out which
   arm a document came from — this is the single most important control in the
   whole trial, because the person scoring is likely to be the person who wants
   a particular answer.
3. Two scorers, independently, no conferring.

## Scale

| Score | Meaning |
|---|---|
| **0** | Absent, or present as a heading with nothing under it |
| **1** | Present but thin — generic, incomplete, or not tied to this packet |
| **2** | Present, specific to the packet, and sufficient for a subordinate to act |

## Sections

| # | Section | 2 points requires |
|---|---|---|
| 1 | Situation | The threat, its effect on the operation, and friendly disposition — drawn from the packet, not restated from its wording |
| 2 | Command Relationships | Who is supported, who is supporting, and the coordinating authority |
| 3 | Mission | Who, what, when, where and why, in one statement |
| 4 | Operational Limitations | Both constraints and restraints, distinguished from each other |
| 5 | Forces Allocated | The force elements named in the packet, attributed to tasks |
| 6 | Anticipated Timeline | M-day, C-day and D-day, or an equivalent explicit schedule |
| 7 | Assumptions | At least one assumption that is valid, necessary and not a restatement of fact |
| 8 | Directed COA Assessment | What subordinates are told to develop, and by when |

## Recording

Enter one row per scorer per document into `completeness.csv`:

```csv
participant,arm,scorer,score
P01,baseline,S1,11
P01,baseline,S2,10
P01,tool,S1,15
P01,tool,S2,14
```

Only unblind the mapping from document number to participant and arm **after**
both scorers have submitted. Log any disagreement over one point and how it was
reconciled.
