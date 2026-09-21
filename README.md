# Joint Planning Engine (JPE)

A planning tool for joint task force staffs executing the **Joint Planning
Process** per JP 5-0, with JP 3-0 joint functions. All seven JPP steps are
implemented as working staff worksheets rather than as a document template.

The doctrine is encoded as structure — validity criteria, task classifications,
WARNORD sections, comparison techniques — so the same constants that gate the
user interface also build the prompts sent to the assistant. Change a doctrinal
constant and both move together.

## Status

Prototype under active development. **Not accredited and operating under no
ATO. Not an official U.S. Department of Defense product or endorsement.** All
demonstration scenarios are notional and contain no real plan content.

## Inference is local

Planning data is CUI and cannot go to a commercial API, so the assistant talks
to an **OpenAI-compatible endpoint on your own network** — Ollama, llama.cpp,
LM Studio and vLLM all work. There is no cloud AI provider in this project.

The tool is usable inside an air gap. Every planning feature works with the
assistant switched off; it accelerates staff work, it does not gate it. Nothing
the assistant returns is written automatically — results stage in a review
panel and the planner accepts, edits or discards them.

Measured on an M1, `llama3.1:8b` is the default: reasoning models burn hundreds
of hidden tokens before answering, and 3B-class models are unstable on
extraction (three identical runs of `llama3.2:3b` returned 4, 8 and 1 tasks).

## Tech stack

- **Web** — Next.js 14 App Router, static export, Tailwind CSS, TypeScript
- **Assistant** — any OpenAI-compatible local endpoint; optional vision model
  for scanned documents
- **Document ingestion** — client-side: `pdfjs-dist`, `mammoth`, `jszip`
- **Auth** — Firebase Auth (Google SSO), with Firestore holding the access
  whitelist. No planning data is stored in either.
- **Hosting** — Firebase Hosting, static
- **Monorepo** — Turborepo + pnpm workspaces

## Structure

```
├── apps/
│   └── web/                # Next.js application (the product)
├── packages/
│   ├── shared/             # Doctrinal constants, types and validators
│   └── ai/                 # Assistant adapter, doctrine-built prompts, validation
├── docs/
│   ├── doctrine/           # Joint publications (JP 5-0, etc.)
│   └── trial/              # Measured-trial protocol, rubric and materials
└── scripts/
    └── trial/              # Trial analysis (stdlib Python, runs air-gapped)
```

## Develop

```bash
pnpm install
pnpm --filter @jpe/web dev
```

Stop the dev server before running a build — they share `apps/web/.next` and a
concurrent build corrupts its chunks.

```bash
pnpm --filter @jpe/web build
```

Do not run `next lint`; ESLint is not configured here and it opens an
interactive setup prompt that hangs.

## Measured trial

`docs/trial/protocol.md` describes a paired, counterbalanced trial measuring
time to produce an initial WARNORD with the tool versus without it, plus
blind-scored completeness of the result. The application is instrumented to
collect it — timing only, never field content, and nothing leaves the machine.

```bash
python3 scripts/trial/analyze.py jpe-trial-raw-*.json --scores docs/trial/completeness.csv
```
