# Feature Specification: Design Architect Agent (UX/UI Critic)

**Feature Path**: `specs/004-design-architect-agent`
**Created**: 2026-03-08
**Status**: Specification

## 1. Overview

The **Design Architect Agent** is an autonomous AI assistant specialized in UX/UI analysis, visual consistency, and front-end excellence. Unlike the QA Agent (which focuses on functional correctness), the Design Architect focuses on the "look and feel," alignment, and user journey of Arre.

It provides an expert "second pair of eyes" to ensure that as features scale, the application maintains its premium "White Paper" aesthetic and high-performance dark mode consistency.

## 2. Agent Persona & Skills

### Persona

A senior Product Designer and Frontend Architect with an obsessive eye for detail, accessibility (a11y), and consistent design languages (like Apple's HIG or Material Design 3), but specifically tailored to the **Arre Design System**.

### Core Skills

- **Visual Auditing**: Analyzing alignment, padding, margins, and whitespace.
- **Color & Typography Review**: Ensuring adherence to `variables.css` and proper hierarchy.
- **UX Journey Mapping**: identifying friction points in forms (like TaskEditorModal) or navigation.
- **Component Consistency**: Ensuring buttons, inputs, and windows look and behave identical across different views.
- **UI Security Analysis**: Identifying areas where UI might trick users or expose sensitive patterns (e.g., hidden states).

## 3. Requirements & Workflows

### W-001: Automated PR Review

Whenever a developer (Human or AI) pushes code that modifies files in `src/` or `styles/`, the agent runs an audit.

- **Input**: Git diff + Current code state + (Optionally) Browser screenshots.
- **Output**: A "Design Review Report" posted as a comment on the PR.

### W-002: Alignment & Consistency Check

Verification that new components utilize the established design tokens (`var(--bg-main)`, `var(--brand-primary)`, etc.) rather than ad-hoc HEX codes or inline styles.

### W-003: "Design Debt" Stories

The agent identifies "Polish" items that are not bugs but degrade the premium feel. It suggests specific changes that the BA/PO can convert into new GitHub Issues/Tasks.

## 4. Integration Logic

Similar to the `qa-agent.js`, we will implement a `design-architect.js` script that:

1.  Analyzes the file changes in the current branch.
2.  Uses the LLM (Gemini 2.0 Pro) to "look" at the CSS Modules and React components.
3.  Maps changes against the `docs/FRONTEND_LAYER.md` policy.
4.  Generates markdown-formatted suggestions for the team.

## 5. Success Criteria

- **SC-001**: 0% usage of hardcoded HEX colors outside of `variables.css`.
- **SC-002**: Every PR is audited for responsive alignment (Mobile vs Desktop).
- **SC-003**: The agent identifies at least one "low-alignment" or "UX friction" point per major feature.
