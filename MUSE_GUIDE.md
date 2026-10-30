# Muse Guide — Models, Slash Commands, Tips & Tricks

> Generated 2026-10-26. Model lineup changes fast — run `/model` and `/help` in-app for the authoritative list.

## 1. Muse Models (for Muse Code)

Use with `muse --model <id>` or mid-session with `/model`.

### muse-spark-1.3 (Standard)
Best at frontier coding on a budget with 1M-token context.
Uses ~20% fewer tool calls / ~25% fewer tokens than 1.2 per Meta; default pick for new work.

### muse-spark-1.3-contributor
Best at cheap experimentation and high-volume iteration.
Same 1.3 lineage at ~$0.10/$0.20 pricing with lower rate limits; swap to Standard when you need full limits.

### muse-spark-1.2 (Standard)
Best at stable coding inside Muse Code; co-trained with the harness.
Slightly older than 1.3 but battle-tested; good fallback if 1.3 behaves oddly.

### muse-spark-1.2-contributor
Best at low-cost drafting, explorations, and data-shareable runs.
Same trade as 1.3-contributor: cheap, lower RPM/TPM limits.

### muse-spark-1.1
Best at value agentic + multimodal work (video/PDF input).
First paid OpenAI-compatible API release; use when you need cheap multimodal, not max coding skill.

### muse-wonder-1.0 / muse-wonder-full
Best at hardest reasoning / flagship-quality answers on paid plans.
Available on Everyday/High (Wonder) and Power/Maximum (Wonder Full) plans; use for tough architecture or debugging.

### muse-glimmer (open-weights)
Best at open/custom deployments outside the closed Spark line.
Part of the Meta Muse family alongside the `Muse` personal agent; pick when you need weights, not the hosted API.

Switch examples:

```bash
muse --model muse-spark-1.3 "explain this repo"
muse exec --model muse-spark-1.3-contributor --reasoning-effort low "lint this diff"
```

## 2. Slash Commands (in-session TUI)

Run `/help` for the full table on your version (1.4.13 here). Most useful:

- `/help` — show all slash commands.
- `/keymap` — show keyboard shortcuts.
- `/model [id]` — switch model mid-session; `/model default` saves current as default, `/model saved` reverts.
- `/effort [tier]` — show/set reasoning: `minimal|low|medium|high|xhigh|ultra` (`Shift+Tab` cycles). Use `low` for edits, `high` default, `xhigh/ultra` for hard bugs.
- `/compact` — summarize history to reclaim context; auto-fires when full, run early before big refactors.
- `/cost` — show spend/tokens for the session.
- `/settings` — edit boot defaults (model, effort).
- `/submodels` — inspect per-task sub-models if enabled.
- `/caching` — caching behavior.
- `/advise` — get a plan/advice pass without executing.
- `/theme` — switch theme.
- `/init` — scaffold agent config in this workspace.

## 3. Shell Subcommands (`muse --help`)

```bash
muse                        # start interactive TUI
muse "fix the failing test" # start session with prompt
muse exec "run tests"       # one-shot non-interactive
muse resume --last          # resume previous session
muse export -o sess.md      # export transcript
muse trace <session>        # inspect a run
muse model-profile show muse-spark-1.3 --effort high
muse skills list --source built-in
muse login / logout / auth  # provider credentials
muse usage                  # subscription allowance
muse init                   # scaffold workspace config
```

## 4. Tips & Tricks

1. **Dial effort, not models, first.** `low` for renames/docs, `high` default, `xhigh` for mystery bugs.
2. **Contributor for exploring, Standard for landing.** Experiment on `-contributor`, switch to Standard for final diffs.
3. **Compact early.** `/compact` before a large refactor keeps the important files in context.
4. **One-shot for CI.** Use `muse exec --model ... --reasoning-effort low "..."` in scripts.
5. **Save your defaults.** After finding a good combo: `/model default` so new sessions boot there.
6. **Check cost mid-task.** `/cost` tells you if `xhigh` is worth it.
7. **Trust + sandbox matter.** `--trust-workspace` loads project skills/rules; `--yolo` disables approval+sandbox (only for throwaway sandboxes).
8. **Worktrees for parallel runs.** `muse -w` creates an isolated Git worktree per session.
9. **Attach images.** `muse --image ./screenshot.png "fix this UI"` for visual bugs.
10. **Version check.** `muse --version` (this doc: 1.4.13). Model IDs move faster than the CLI.
