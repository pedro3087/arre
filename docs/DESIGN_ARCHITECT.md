# Design Architect Agent

The Design Architect Agent is an AI-powered design reviewer that enforces Arre's visual standards on every code change. It operates in two modes: a **local pre-push check** and an **automated CI audit** on every PR.

Together with the [AI QA Agent](AI_QA_AGENT.md), this forms Arre's **Dual-Agent Review** system — QA Agent catches functional regressions, Design Architect catches visual and styling regressions.

---

## How It Works

```
Local push  →  .husky/pre-push  →  npm run design-check  →  Terminal report
PR opened   →  GitHub Actions   →  design-architect.js   →  PR comment + GitHub Issues
```

1. **Diff filtering**: Only frontend files (`*.tsx`, `*.module.css`, `*.css`, style-related `*.ts`) are analyzed.
2. **Deterministic HEX check**: Regex scan for hardcoded hex colors (`#RGB` / `#RRGGBB`) — always runs, no API needed.
3. **Gemini LLM audit**: Changed files are sent to Gemini 2.5 Flash for review against `docs/DESIGN_VIBES.md`.
4. **Structured report**: Findings grouped by severity — Critical / Warning / Suggestion.
5. **Design Debt Issues**: `Suggestion`-level findings automatically open GitHub Issues with the `design-debt` label.

---

## Local Setup (Developer)

### 1. Add your Gemini API key

Add to your `.env` file (never commit this file):

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Get a key at [Google AI Studio](https://aistudio.google.com/app/apikey).

### 2. Install the git hook

The pre-push hook is installed automatically when you run:

```bash
npm install
```

This triggers the `"prepare": "husky"` script which sets up `.husky/pre-push`.

### 3. Run manually

```bash
npm run design-check
```

This analyzes your current uncommitted changes and prints the report to the terminal. Runs in under 60 seconds for typical changes.

---

## Bypassing the Hook (Emergency Use Only)

If you need to push without running the design check:

```bash
git push --no-verify
```

Use sparingly. The CI audit (W-002) will still run on your PR.

---

## CI Behavior (GitHub Actions)

**Trigger**: Pull request open or update targeting `main`, when any frontend file changes.

**What happens**:
1. The workflow runs `node scripts/design-architect.js` (CI mode, no `--local` flag).
2. A **Design Review Report** is posted as a PR comment.
3. For `Suggestion`-level findings, a **GitHub Issue** is automatically created with the `design-debt` label.

**Non-blocking**: The CI step uses `continue-on-error: true`. Even Critical findings do not block merging — they are advisory.

**If Gemini is unavailable**: The workflow passes with a warning comment. The deterministic HEX scan still runs.

---

## Understanding the Report

| Severity | Label | Meaning | Creates Issue? |
|----------|-------|---------|----------------|
| 🔴 Critical | `VIBES-001` | Hardcoded color value detected | No |
| 🟡 Warning | `VIBES-002–006` | Design rule violation to fix before merge | No |
| 🔵 Suggestion | `VIBES-005` / polish | Nice-to-have improvement; design debt | **Yes** |

---

## One-Time GitHub Repository Setup

Before W-004 (Design Debt Issues) can work, create the `design-debt` label in your GitHub repository:

```bash
gh label create "design-debt" --color "0075ca" --description "Design quality improvements identified by the Design Architect Agent"
```

Or via the GitHub UI: **Repository → Issues → Labels → New label**.

---

## Rulebook

The agent's rules live in [`docs/DESIGN_VIBES.md`](DESIGN_VIBES.md). To add or modify rules, edit that file — the agent will pick up changes automatically on its next run.
