# CLI Contract: design-architect.js

**Feature**: `specs/004-design-architect-agent`

## Command

```bash
node scripts/design-architect.js [--local]
```

Or via npm script:

```bash
npm run design-check        # local mode (--local flag set automatically)
```

---

## Flags

| Flag | Description | When to use |
|------|-------------|-------------|
| `--local` | Diffs against `HEAD` (staged + unstaged changes). Output to stdout. | Developer pre-push check |
| *(absent)* | CI mode: diffs `origin/main...HEAD`. Posts PR comment via GitHub API. | GitHub Actions |

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | No critical findings; audit passed or skipped (no frontend changes) |
| `1` | One or more **Critical** findings detected (hardcoded HEX colors) |
| `2` | Reserved for future unhandled runtime errors (currently exits 0 on all API failures) |

**Note**: In CI (`design-review.yml`), the run step uses `continue-on-error: true`, so exit code 1 never blocks the PR workflow.

---

## Required Environment Variables

| Variable | Required in | Description |
|----------|-------------|-------------|
| `GEMINI_API_KEY` | Both modes | Gemini API key. Missing = LLM analysis skipped (non-blocking). |
| `GITHUB_TOKEN` | CI mode only | GitHub token for posting PR comments and creating Issues. |
| `PR_NUMBER` | CI mode only | Pull request number. |
| `REPO_OWNER` | CI mode only | Repository owner (GitHub username or org). |
| `REPO_NAME` | CI mode only | Repository name (without owner prefix). |

**Local setup**: Add `GEMINI_API_KEY=your_key_here` to `.env` (never commit).

**CI setup**: `GEMINI_API_KEY` is a GitHub Actions secret. `GITHUB_TOKEN` is provided automatically by GitHub Actions.

---

## File Filter

The agent analyzes only these file extensions from the diff:
- `*.tsx` — React components
- `*.ts` — Only if diff lines match `/style|className|var\(--|\.module/i`
- `*.module.css` — CSS Modules
- `*.css` — Global stylesheets

**Cap**: Maximum 10 files per run. Additional files are noted in the report but not analyzed.

---

## Output Formats

### Local mode (stdout)
Plain markdown report printed to terminal.

### CI mode (GitHub PR comment)
Markdown report posted as a PR comment by the `GITHUB_TOKEN` actor.

### GitHub Issues (CI mode, Suggestion findings only)
One Issue per unique Suggestion finding, with label `design-debt`. Deduplicated by title prefix.
