# Tasks: Real-time Productivity Velocity Updates on Task Toggle

**Input**: Design documents from `specs/001-velocity-task-toggle/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Foundational — Fix `completedAt` Storage (Blocking)

**Purpose**: Fix the root cause bugs in `useTasks.ts` and `useDashboardStats.ts`. Both user stories P1 and P2 depend on this phase.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T001 [US1/US2] In `src/features/tasks/hooks/useTasks.ts`: when `updates.status === 'completed'`, replace `firestoreUpdates.completedAt = serverTimestamp()` with `firestoreUpdates.completedAt = new Date().toISOString()` — stores ISO string instead of Firestore Timestamp so the dashboard query can compare types correctly.

- [x] T002 [US1/US2] In `src/features/tasks/hooks/useTasks.ts`: add an `else if` branch — when `updates.status` is being set to `'todo'` (uncomplete), set `firestoreUpdates.completedAt = deleteField()` (import `deleteField` from `firebase/firestore`) — clears the stale timestamp so uncompleted tasks have no completion record.

**Checkpoint**: After T001 and T002, completing and uncompleting tasks will write correct data to Firestore. The query in `useDashboardStats` will now match on type (string vs string).

---

## Phase 2: User Story 1 — Velocity Updates on Task Completion (Priority: P1) MVP

**Goal**: Completing a task immediately increments the velocity chart and Tasks Done counter.

**Independent Test**: Complete a task from the Inbox/Work Area view. Verify the "Tasks Done" counter increments and today's bar on the Productivity Velocity chart grows — without any page refresh.

### Implementation

- [x] T003 [US1] Verify `src/features/dashboard/useDashboardStats.ts` query — confirm `where('completedAt', '>=', sevenDaysAgo.toISOString())` is correct now that `completedAt` is stored as ISO string. No code change needed if the existing comparison already uses `.toISOString()`.

- [ ] T004 [US1] Smoke test (manual): run the app locally, complete a task from Inbox, and confirm the "Tasks Done" count and velocity bar update within 2 seconds without a manual refresh.

**Checkpoint**: User Story 1 fully functional. Completing a task immediately reflects in velocity.

---

## Phase 3: User Story 2 — Velocity Updates on Task Uncomplete (Priority: P1)

**Goal**: Uncompleting a task immediately decrements the velocity chart and Tasks Done counter.

**Independent Test**: Complete a task, verify count increments, then uncheck the same task and verify the count decrements back to its previous value.

### Implementation

- [x] T005 [US2] In `src/pages/Logbook.tsx:86`: remove the `completedAt: null as any` from the `onToggle` call — it was a previous workaround that is now unnecessary and incorrect. The call should be `updateTask(id, { status: 'todo' })`. T002's `deleteField()` branch now handles clearing `completedAt` automatically.

- [x] T005b [US2] Verify the `handleToggle` function in other pages (`src/pages/Dashboard.tsx`, `src/pages/Inbox.tsx`, `src/pages/Upcoming.tsx`, `src/pages/Anytime.tsx`) passes `{ status: 'todo' }` when uncompleting — these are already correct and no changes are expected.

- [ ] T006 [US2] Smoke test (manual): complete a task, verify velocity increments, then uncheck it and verify the velocity decrements. Confirm the Firestore document no longer has a `completedAt` field after uncompleting (check Firebase console or emulator UI).

**Checkpoint**: User Story 2 fully functional. Both completing and uncompleting tasks update velocity in real time.

---

## Phase 4: User Story 3 — Velocity Consistency Across Navigation (Priority: P2)

**Goal**: Velocity data is accurate after navigating away and returning to a page with the dashboard stats.

**Independent Test**: Complete a task on Inbox, navigate to another page (e.g., Today), navigate back to Inbox, confirm the velocity chart still shows the correct count.

### Implementation

- [x] T007 [US3] Confirm `useDashboardStats` sets up its `onSnapshot` listener inside a `useEffect` with `[user]` dependency — the listener is re-created on mount and correctly reflects current Firestore state. No changes expected; this is a verification task.

- [ ] T008 [US3] Smoke test (manual): complete a task, navigate to Today page, navigate back to Inbox — confirm the velocity chart persists the correct value and does not reset.

**Checkpoint**: All three user stories functional and verified.

---

## Phase 5: Polish & Verification

- [x] T009 [P] Review `src/features/dashboard/useDashboardStats.ts` lines 64-69 — the backward-compatibility parsing for both Timestamp and string `completedAt` can remain as-is (handles old documents). No change needed.

- [x] T010 [P] In `src/lib/types/firestore.ts:15`: change `completedAt?: Timestamp` to `completedAt?: string` — the `TaskDocument` interface currently declares the raw Firestore type as `Timestamp`, but after the fix it is stored as ISO string. This is a required code change (not just a verification).

- [x] T011 Confirm the existing Firestore index `status ASC, completedAt DESC` still works with ISO string values (it will, as Firestore sorts strings lexicographically and ISO 8601 strings sort correctly).

---

## Dependencies & Execution Order

- **Phase 1 (T001, T002)**: No dependencies — start immediately. Blocks all other phases.
- **Phase 2 (T003, T004)**: Depends on Phase 1 complete.
- **Phase 3 (T005, T006)**: Depends on Phase 1 complete. Can run in parallel with Phase 2.
- **Phase 4 (T007, T008)**: Depends on Phases 2 and 3 complete.
- **Phase 5 (T009, T010, T011)**: Can run in parallel at any time after Phase 1.

### Summary

```
T001 → T002              (Phase 1 — must complete first)
         ├── T003 → T004        (Phase 2 — US1)
         └── T005 → T005b → T006  (Phase 3 — US2, parallel with Phase 2)
                         └── T007 → T008    (Phase 4 — US3)
T009, T010, T011         (Phase 5 — parallel, any time after T001/T002)
```

## Implementation Strategy

### MVP (P1 stories only)

1. Complete Phase 1 (T001, T002) — fix both root cause bugs
2. Complete Phase 2 (T003, T004) — verify completion updates velocity
3. Complete Phase 3 (T005, T006) — verify uncomplete updates velocity
4. **STOP and VALIDATE** — both P1 stories are done, feature is complete for the core use case

### Full Delivery

5. Complete Phase 4 (T007, T008) — navigation consistency
6. Complete Phase 5 (T009-T011) — cleanup and verification

---

## Notes

- Code changes are in 3 files: `useTasks.ts` (T001, T002), `Logbook.tsx` (T005), `firestore.ts` (T010).
- Total code change: ~5-10 lines across three files, plus one import addition (`deleteField`).
- No new Firestore indexes, no schema migrations, no new components.
- The `deleteField()` import must be added to the existing firebase/firestore import statement in `useTasks.ts`.
