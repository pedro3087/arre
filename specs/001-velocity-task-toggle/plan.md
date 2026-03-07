# Implementation Plan: Real-time Productivity Velocity Updates on Task Toggle

**Branch**: `001-velocity-task-toggle` | **Date**: 2026-03-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-velocity-task-toggle/spec.md`

## Summary

The Productivity Velocity chart and related dashboard stats must update immediately when a user completes or uncompletes a task. Two bugs currently prevent this: (1) the `completedAt` timestamp is never cleared when a task is uncompleted, leaving stale data in Firestore; (2) the dashboard query compares a Firestore Timestamp value against an ISO date string, which Firestore cannot resolve correctly across types, causing the real-time listener to miss or miscount completions. Both bugs are fixed by enforcing ISO string storage for `completedAt` consistently and clearing the field on uncomplete.

## Technical Context

**Language/Version**: TypeScript 5.9 / React 19
**Primary Dependencies**: Firebase Firestore (onSnapshot real-time listener), React hooks
**Storage**: Cloud Firestore — `users/{uid}/tasks` collection
**Testing**: Playwright (E2E)
**Target Platform**: Web (Vite + React SPA)
**Project Type**: Web application (frontend-only SPA with Firebase backend)
**Performance Goals**: Velocity chart updates within 2 seconds of a task toggle (Firestore onSnapshot latency)
**Constraints**: No new Firestore indexes required; changes must not break existing queries
**Scale/Scope**: Single-user task list; velocity window is always 7 days

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution has not been filled in yet (template placeholders remain). No constitution gates apply. The following project-level principles are inferred from the existing codebase:

- **Simplicity**: Changes are minimal — no new files, no new services, no schema migrations.
- **No breaking changes**: Existing Firestore queries and indexes remain intact.
- **Type consistency**: `completedAt` is already typed as `string | undefined` in the `Task` interface; storing as ISO string is the correct type.

## Project Structure

### Documentation (this feature)

```text
specs/001-velocity-task-toggle/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 research notes
├── data-model.md        # Phase 1 data model
└── tasks.md             # Phase 2 task breakdown
```

### Source Code (files changed by this feature)

```text
src/features/tasks/hooks/
└── useTasks.ts           # Fix: clear completedAt on uncomplete; store as ISO string

src/features/dashboard/
└── useDashboardStats.ts  # Fix: query boundary type must match stored completedAt type
```

**Structure Decision**: Single project (web SPA). Only two existing files require changes. No new files, components, or services are needed.

---

## Phase 0: Research

*See [research.md](./research.md)*

---

## Phase 1: Design

### Root Cause Analysis

**Bug 1 — `completedAt` not cleared on uncomplete** ([useTasks.ts:117](../../src/features/tasks/hooks/useTasks.ts#L117))

```
updateTask(id, { status: 'todo' })
  → firestoreUpdates = { status: 'todo', updatedAt: serverTimestamp() }
  → completedAt field is never touched
  → stale value persists in Firestore document
```

When the dashboard query runs with `where('status', '==', 'completed')`, uncompleted tasks are excluded — so this stale field is dormant in normal cases. However, it causes inconsistency if a task is re-completed on a different day, and it violates FR-003 and SC-005 from the spec.

**Bug 2 — Type mismatch in Firestore query** ([useDashboardStats.ts:57](../../src/features/dashboard/useDashboardStats.ts#L57))

```
completedAt stored as: Firestore Timestamp  (via serverTimestamp())
Query boundary:        sevenDaysAgo.toISOString()  ← ISO string type

Firestore cannot compare a Timestamp field against a string value.
Result: the onSnapshot query silently returns 0 documents, or incorrect results.
```

This is the **primary bug**. The real-time listener (`onSnapshot`) fires correctly on task changes, but the query itself produces wrong results because of the type mismatch. The velocity chart appears static because the query returns nothing useful.

### Fix Strategy

**Fix 1 — Store `completedAt` as ISO string** (in `useTasks.ts`)

Replace `serverTimestamp()` for `completedAt` with `new Date().toISOString()`. This matches the existing TypeScript type (`completedAt?: string`) and makes the value directly comparable to the ISO string boundary used in the dashboard query.

When uncompleting, explicitly delete the `completedAt` field using Firestore's `deleteField()` sentinel value so no stale timestamp remains.

**Fix 2 — Query boundary type is now correct** (in `useDashboardStats.ts`)

Once `completedAt` is stored as ISO string, the existing query `where('completedAt', '>=', sevenDaysAgo.toISOString())` compares string to string — which is valid. The `onSnapshot` listener then fires correctly on any task status change within the 7-day window, updating the velocity chart in real time.

### Data Model

*See [data-model.md](./data-model.md)*

### Interface Contracts

No new public interfaces. `updateTask` signature is unchanged. `useDashboardStats` return type is unchanged.

**Behavioral contract change** (internal Firestore schema):
- `completedAt` field is now always an ISO 8601 string when present (e.g., `"2026-03-07T14:23:00.000Z"`).
- `completedAt` field is absent (field deleted via `deleteField()`) when `status !== 'completed'`.
- This is backward-compatible: `useDashboardStats` already handles both string and Timestamp types in its document parsing (lines 65-69), so any documents written before this fix continue to work.
