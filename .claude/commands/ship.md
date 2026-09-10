---
description: Commit current work, push a branch, and open a PR that runs CI and deploys to the live site on merge
argument-hint: [short description of what you are shipping]
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git branch:*), Bash(git checkout:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git ls-remote:*), Bash(gh pr create:*), Bash(gh pr view:*), Bash(gh pr list:*), Bash(gh run list:*), Bash(gh run watch:*), Bash(gh auth status:*), Bash(pnpm:*), Bash(npx tsc:*)
---

Ship the current work through the CI/CD pipeline to the live site.

User's description of this change: $ARGUMENTS

## Pipeline this feeds

- **Pull request** → `.github/workflows/ci.yml` typechecks, builds the static
  export, and deploys a 7-day preview channel to `jp-engine-dev`.
- **Merge to `main`** → `.github/workflows/deploy-prod.yml` rebuilds and
  publishes to `jp-engine-prod` (https://jp-engine-prod.web.app).

Production deploys happen on merge, not on this command. Never push directly to
`main` to trigger a deploy.

## Steps

1. **Verify locally before pushing.** CI will run these anyway, but failing fast
   here is cheaper than a red PR:
   - `pnpm --filter @jpe/shared exec tsc --noEmit`
   - `pnpm --filter @jpe/web exec tsc --noEmit`
   - `pnpm --filter @jpe/web build`, then confirm `apps/web/out/index.html` exists

   **Stop the dev server first if one is running.** It shares `apps/web/.next`
   with the build and a concurrent build corrupts its chunks. Clear with
   `rm -rf apps/web/.next` afterward before restarting dev.

   Never run `next lint` — ESLint is not configured here and it opens an
   interactive setup prompt that hangs.

2. **Check the working tree** with `git status`. If there is nothing to commit
   and the branch is already pushed, skip to step 5 and report the existing PR.

3. **Branch if needed.** If currently on `main`, create a branch named for the
   change (`feat/…`, `fix/…`, `chore/…`). Never commit directly to `main`.
   If already on a feature branch that matches this work, stay on it.

4. **Commit and push.** Write a commit message describing what changed and why,
   not just which files moved. Push with `-u origin <branch>`.

5. **Open the PR** with `gh pr create --base main`. Not a draft. Title
   summarizes the change; body covers what changed, why, and anything a
   reviewer should know. If a PR already exists for the branch, push the new
   commits and report that URL instead of creating a duplicate.

6. **Report back**, including:
   - The PR URL
   - That CI is running, and the preview URL will be posted as a PR comment
     once the dev deploy finishes
   - That merging to `main` is what publishes the live site

## Preconditions to check and report, not work around

- `gh auth status` must show an authenticated host. If not, tell the user to run
  `gh auth login --hostname github.com --git-protocol https --web` and give them
  the compare URL as a fallback. Do not attempt to read or reuse credentials
  from the git credential helper.
- The prod deploy needs the `FIREBASE_SERVICE_ACCOUNT_PROD` repo secret, and the
  dev preview needs `FIREBASE_SERVICE_ACCOUNT_DEV`. If a deploy job fails on a
  missing secret, say so plainly — these are the user's to create.
