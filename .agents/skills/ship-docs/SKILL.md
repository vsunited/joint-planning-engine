---
name: ship-docs
description: Preflights and reviews README.md and DECISIONS.md, appends progress to PROGRESS.md, then commits, pushes, opens a PR, merges, and watches the production deploy.
---

# Ship Docs Skill (/ship-docs)

Preflight, review, and log the project documentation, then take the docs through
commit → PR → merge → production deploy.

> **Antigravity users:** the executable version of this workflow lives at
> `.agents/skills/ship-docs/SKILL.md` and is invoked as `/ship-docs`.

All paths are **relative to the repository root** (the directory containing `package.json`
and `README.md`). Do not hardcode absolute machine paths.

---

## Guardrails

- **Stage docs only** — `README.md`, `DECISIONS.md`, `PROGRESS.md`. Never `git add .`;
  a blanket add sweeps pending source changes into a commit labelled `docs:`.
- **Never merge without explicit user confirmation.** Merging to `main` deploys to
  production at https://jp-engine.com.
- **Never commit secrets.** `.env` / `.env.local` hold live keys. They
  are gitignored via `.env*`; confirm they are absent from `git status` before committing.
- **Never put a personal access token on the command line** — it leaks into shell history.
  Use the `gh` CLI, or hand the user a compare URL to open the PR in the browser.

---

## Step 1: Survey and Preflight

1. Run `git status --short`, `git branch --show-current`, and `git log --oneline -15`.
2. Split changed files into docs vs. everything else. If non-docs files are pending, list
   them and tell the user they need their own commit — this workflow will not stage them.
3. Read `README.md` and `DECISIONS.md` in full and check their claims against the code:
   - Accuracy of documented features, counts, file names, and configuration.
   - Markdown formatting, broken relative links, stale URLs.
   - Drift between the docs and the actual source and deployment.
4. Write a short, structured review summary separating *inaccurate* from *incomplete*.

---

## Step 2: Record the Work

1. If the work involved a real architectural or product decision, append an entry to
   `DECISIONS.md`, continuing the existing number sequence:

   ```markdown
   ## N. Short Title
   - **Decision:** What changed.
   - **Rationale:** Why, including the tradeoff.
   ```

   Routine fixes do not warrant an entry — do not invent one.

2. Always append a timestamped entry to `PROGRESS.md` (get the time from the system, e.g.
   `date "+%Y-%m-%d %H:%M:%S"` — never from memory):

   ```markdown
   ---

   ## [YYYY-MM-DD HH:MM:SS] Title Of The Work
   - **Status:** Approved / Action Required
   - **README Review:** [brief findings]
   - **DECISIONS Review:** [what was added, or "Accurate and up to date."]
   - **Action Taken:** [what shipped]
   ```

3. Show the proposed content to the user and get approval before writing.

---

## Step 3: Commit, PR, Merge, Deploy

Confirm with the user before touching the remote, then:

1. Branch with a unique name — **do not reuse `feature/docs-sync`**, which already exists
   on origin: `git checkout -b docs/ship-$(date "+%Y%m%d-%H%M%S")`
2. Stage docs only: `git add README.md DECISIONS.md PROGRESS.md`, then `git status` to
   verify nothing else (and no `.env`) is staged.
3. `git commit -m "docs: <specific summary>"` and `git push -u origin HEAD`.
4. Open the PR: `gh pr create --base main --title "docs: <summary>" --body "<details>"`.
   If `gh` is unavailable, give the user
   `https://github.com/vsunited/joint-planning-engine/compare/main...<branch>?expand=1` instead.
5. Wait for CI (`gh pr checks --watch`). The job runs `pnpm lint`, `pnpm test`, etc. **If it fails, stop** and surface the output.
6. State that merging deploys to production, ask for confirmation, and only then:
   `gh pr merge --squash --delete-branch`, followed by `git checkout main && git pull`.
7. Watch the deploy with `gh run watch`. Report the conclusion and confirm the change is live at
   https://jp-engine.com — only after the job actually reports success.
