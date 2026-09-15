# Git workflow — start-of-task checklist

Use this file at the **start of every new task** before you write code or ask the agent for help.  
Sweet Spot’s integration branch is `origin/dev` (not `main`).

> **Quick reminder:** Cancel trial memberships before **September 30, 2026** on **Wispr Flow**, **Cursor**, and **Epilamic Sound**. Cancel **Wolt+** membership before **October 6, 2026**.

> **PowerShell:** chain commands with `;` — not `&&`.

---

## Quick start (30 seconds)

Run these three commands first:

```powershell
git branch --show-current
git fetch origin dev
git status -sb
```


| `git status -sb` line                     | Meaning                                        |
| ----------------------------------------- | ---------------------------------------------- |
| `## dev...origin/dev`                     | Synced with remote `dev`                       |
| `## dev...origin/dev [behind 1]`          | Missing 1 commit from GitHub — pull when ready |
| `## dev...origin/dev [ahead 2]`           | You have 2 local commits not pushed yet        |
| `## dev...origin/dev [behind 1, ahead 2]` | Diverged — pull/rebase may be needed           |


---



## 1. Check sync (look only — no file changes)



### Fetch

```powershell
git fetch origin dev
```

Downloads the latest `dev` from GitHub and updates your local `origin/dev` pointer.  
**Does not** change your working files or merge anything.

### Status

```powershell
git status -sb
```

Shows whether you are behind, ahead, or synced (see table above).

### What commits am I missing?

```powershell
git log --oneline HEAD..origin/dev
```

- **Output** → commits on GitHub you don’t have yet  
- **Empty** → you’re up to date on `dev`



### What haven’t I pushed?

```powershell
git log --oneline origin/dev..HEAD
```

- **Output** → your local commits not on GitHub yet  
- **Empty** → nothing waiting to push

---



## 2. Update from `dev`

```powershell
git pull origin dev
```

**Fetch + merge in one step.** Use when `git status -sb` shows `[behind N]`.

### Before you pull

- If you have **uncommitted changes**, pull may fail or cause conflicts.
- Options:
  1. **Commit** your work first (see section 4)
  2. **Stash** temporarily:
    ```powershell
     git stash push -m "wip before pull"
     git pull origin dev
     git stash pop
    ```
  3. **Discard** local changes only if you’re sure you don’t need them (ask before doing this on shared work)

**Never** force-push. **Never** discard uncommitted work to sync unless you explicitly mean to.

---



## 3. Starting a new task



### Continuing work on an existing feature branch

If you’re already on e.g. `feat/my-feature` and just picking up where you left off:

```powershell
git branch --show-current
git status
```

You do **not** need to pull `dev` every time — only when you want the latest integration changes or the task requires it.

### Starting a brand-new feature branch

Always branch from a **fresh** `origin/dev`:

```powershell
git fetch origin dev
git checkout dev
git pull origin dev
git checkout -b feat/short-description
```

Replace `feat/short-description` with something meaningful, e.g. `feat/local-casino-fog`.

**Do not** branch off `main`, `devops/`*, `cursor/*`, or a stale local branch.

---



## 4. During work — inspect changes

```powershell
git status
```

Lists modified, staged, and untracked files.

```powershell
git diff
```

Unstaged changes (not yet `git add`ed).

```powershell
git diff --staged
```

Staged changes (ready to commit).

```powershell
git log --oneline -5
```

Last 5 commits — quick sanity check on recent history.

---



## 5. Commit (save locally)



### Stage

```powershell
git add path/to/file
```

Stage one file.

```powershell
git add .
```

Stage everything changed (review with `git status` first).

### Commit

```powershell
git commit -m "Short description of the change"
```

Saves a snapshot **locally only**. Does not upload to GitHub.

**Good messages (why, not just what):**

- `fix world map seam on local casino theme`
- `add fog cycle tests for climb preview`
- `wire peek-and-pitch community board layout`

**Avoid:**

- `fix`
- `wip` (unless it’s truly throwaway WIP on a private branch)
- `updates`

---



## 6. Push (upload to GitHub)



### Current branch (already has upstream)

```powershell
git push
```

or explicitly:

```powershell
git push origin HEAD
```



### First push on a new branch

```powershell
git push -u origin HEAD
```

Sets upstream tracking so later you can use plain `git push`.

---



## 7. End-of-task checklist

Before you consider a task “done”:

```powershell
git status
git log --oneline origin/dev..HEAD
git push origin HEAD
```

- [ ] Working tree clean (or only intentional untracked files)
- [ ] Commits pushed to GitHub
- [ ] Tests / lint pass if you changed code (see project README or `package.json` scripts)

---



## 8. Typical flows



### Morning sync (check + update)

```powershell
git fetch origin dev
git status -sb
git pull origin dev
```



### After finishing a chunk of work

```powershell
git status
git diff
git add .
git commit -m "describe what you did and why"
git push origin HEAD
```



### Check before opening a new agent chat

```powershell
git fetch origin dev
git status -sb
git log --oneline HEAD..origin/dev
```

No need to ask the agent “am I behind?” — these three commands tell you.

---



## 9. Command reference


| Goal                         | Command                              |
| ---------------------------- | ------------------------------------ |
| Which branch am I on?        | `git branch --show-current`          |
| Check remote only (no merge) | `git fetch origin dev`               |
| Am I behind/ahead?           | `git status -sb`                     |
| Commits I’m missing          | `git log --oneline HEAD..origin/dev` |
| Commits I haven’t pushed     | `git log --oneline origin/dev..HEAD` |
| Update my branch             | `git pull origin dev`                |
| See local changes            | `git diff`                           |
| See staged changes           | `git diff --staged`                  |
| Save locally                 | `git add` → `git commit -m "..."`    |
| Upload to GitHub             | `git push origin HEAD`               |
| New branch, first push       | `git push -u origin HEAD`            |
| Stash WIP temporarily        | `git stash push -m "note"`           |
| Restore stashed WIP          | `git stash pop`                      |


---



## 10. Rules of thumb


| Command  | What it does                                     |
| -------- | ------------------------------------------------ |
| `fetch`  | Look at remote — **change nothing** locally      |
| `pull`   | Fetch **+ merge** — actually updates your branch |
| `commit` | Save locally only                                |
| `push`   | Send commits to GitHub                           |


- `fetch` **+** `status` when you only want to *check*
- `pull` when you’re ready to *update*
- Integration branch for this repo: `dev`, not `main`
- On PowerShell: use `;` between commands, e.g. `git fetch origin dev ; git status -sb`

---



## 11. When something goes wrong



### Pull rejected / merge conflict

1. Don’t panic — your work isn’t lost.
2. Run `git status` to see conflicted files.
3. Open conflicted files, resolve `<<<<<<<` markers.
4. Then:
  ```powershell
   git add path/to/resolved-file
   git commit -m "resolve merge conflict with dev"
  ```



### Accidentally on wrong branch

```powershell
git stash push -m "move work to correct branch"
git checkout correct-branch
git stash pop
```



### “I just want to see what changed on dev”

```powershell
git fetch origin dev
git log --oneline HEAD..origin/dev
git diff HEAD..origin/dev
```

---



## Related repo rules

- `.cursor/rules/start-from-dev.mdc` — new branches always from fresh `origin/dev`
- `.cursor/rules/docs-hierarchy.mdc` — read `docs/mvp.md` + `docs/sprint-current.md` before new features

