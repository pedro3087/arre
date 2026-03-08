# Implementation Plan: Design Architect Agent

**Feature Path**: `specs/004-design-architect-agent`
**Reference Spec**: [spec.md](spec.md)

## 1. Summary

The goal is to build a secondary "Audit Script" (`scripts/design-architect.js`) similar to the current QA agent. It will use the Gemini API to analyze frontend code changes and provide design-centric feedback.

## 2. Technical Steps

### Phase 1: Knowledge Base Creation

- Update the Agent's "Source of Truth" by consolidating design tokens.
- **Reference File**: `src/styles/variables.css` and `docs/FRONTEND_LAYER.md`.
- Define a "Style Validation Rulebook" that the agent will use for its prompt.

### Phase 2: Audit Script Development

- Create `scripts/design-architect.js`.
- **Logic**:
  1. Use `git diff main...HEAD` to find changed `.tsx` and `.module.css` files.
  2. For each changed file, send the content to Gemini.
  3. **Prompt Strategy**: "As a UX/UI expert, review these changes for Arre. Ensure they use CSS variables, follow the White Paper aesthetic, and maintain 8px grid alignment."
  4. Collect all suggestions into a Markdown report.

### Phase 3: GitHub Actions Integration

- Create `.github/workflows/design-review.yml`.
- Trigger: `pull_request` targeting `main`.
- Step: Run `node scripts/design-architect.js`.
- Step: Use a GitHub Action (like `peter-evans/commit-comment`) to post the report.

### Phase 4: Feedback Loop (BA/PO Integration)

- Ensure the report includes a format like `[STORY SUGGESTION] - Title: ...` so the team can easily identify new tasks.

## 3. Tooling Requirements

- **Gemini 2.0 Pro**: For deep multi-modal understanding of design patterns.
- **GitHub API**: For reading PR metadata and posting comments.
- **Node.js**: Script runner.
