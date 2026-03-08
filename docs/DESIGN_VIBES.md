# Arre Design Vibes (Agent Rulebook)

This document serves as the ground truth for the **Design Architect Agent** when reviewing code changes. It defines the strict aesthetic and functional rules that maintain Arre's premium feel.

## VIBES-001: The "White Paper" Aesthetic

- **Colors**: Never use raw hex codes (e.g., `#FFFFFF`, `#000000`) or RGB values in CSS files.
- **Enforcement**: All colors must use tokens from `src/styles/variables.css` (e.g., `var(--bg-main)`, `var(--text-primary)`, `var(--brand-primary)`).
- **Exceptions**: None.

## VIBES-002: Grid and Spacing

- **Spacing System**: Arre uses a strict 8px/4px layout grid.
- **Enforcement**: Padding, margins, and gaps should generally be multiples of 4 or 8 (e.g., `4px`, `8px`, `16px`, `24px`). Avoid arbitrary values like `11px` or `23px` unless making a sub-pixel optical adjustment.

## VIBES-003: Borders and Radii

- **Rounding**: UI elements should feel modern and soft but not pill-shaped.
- **Enforcement**: Stick to established radiuses:
  - Small elements (inputs, tags): `4px` or `6px`
  - Standard elements (cards, task items): `8px` or `12px`
  - Large containers (modals): `16px` or `24px`

## VIBES-004: Typography Hierarchy

- **Consistency**: Font sizes and weights should establish clear hierarchy.
- **Enforcement**:
  - View Headers: Large, bold (e.g., `24px+`, font-weight 600/700).
  - Task Titles: Prominent but readable (e.g., `16px`, font-weight 500).
  - Metadata/Notes: Smaller, muted (e.g., `13px-14px`, `var(--text-secondary)`).

## VIBES-005: Interaction and Affordance

- **Hover States**: Interactive elements must provide visual feedback.
- **Enforcement**: Buttons and list items should ideally have a hover state (e.g., background color shift or opacity change) and a transition (usually `0.2s ease`).
- **Focus States**: Keep focus rings visible for accessibility.

## VIBES-006: No Inline Styles

- **Separation of Concerns**: React components should not contain `style={{ ... }}` blocks for layout or colors.
- **Enforcement**: All styling must live in the corresponding `.module.css` file. (Dynamic animation values via Framer Motion are the only exception).

---

## Severity Mapping

| Rule ID   | Description              | Severity   | Detection Method     |
|-----------|--------------------------|------------|----------------------|
| VIBES-001 | No hardcoded colors      | Critical   | Deterministic regex  |
| VIBES-002 | 8px/4px grid spacing     | Warning    | Gemini LLM           |
| VIBES-003 | Border radius standards  | Warning    | Gemini LLM           |
| VIBES-004 | Typography hierarchy     | Warning    | Gemini LLM           |
| VIBES-005 | Hover/focus states       | Suggestion | Gemini LLM           |
| VIBES-006 | No inline styles         | Warning    | Gemini LLM           |

---

## Guidelines for the Design Architect Agent

When reviewing code diffs:

1. If a rule is violated, flag it clearly.
2. Provide the specific file name and the exact CSS variable or class that should be used instead.
3. If an implementation looks technically correct but "feels" clunky (e.g., a modal without padding), categorize it as a UX friction point with severity `Suggestion`.
4. If the issue is minor "Polish", mark it as severity `Suggestion` so it can be converted into a `design-debt` GitHub Issue.
5. Do NOT report VIBES-001 violations — those are detected deterministically before you run.
6. Return ONLY a valid JSON array. No markdown, no prose outside the array.
