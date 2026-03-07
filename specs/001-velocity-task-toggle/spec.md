# Feature Specification: Real-time Productivity Velocity Updates on Task Toggle

**Feature Branch**: `001-velocity-task-toggle`
**Created**: 2026-03-07
**Status**: Draft
**Input**: User description: "when I am completing a tasks in the app, the productivity velocity should be updated based on completing that tasks and even if the user decides to uncomplete the tasks that should also be updated"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Velocity Updates on Task Completion (Priority: P1)

A user marks a task as complete from any view in the app (Today, Inbox, Upcoming, Anytime). The Productivity Velocity chart and the Tasks Done counter on the dashboard immediately reflect this completion — the bar for today grows taller and the count increments.

**Why this priority**: This is the core of the feature. Without immediate feedback when completing a task, the velocity dashboard feels disconnected from the user's work and loses its motivational value.

**Independent Test**: Can be fully tested by completing a task from the Inbox view and verifying the "Tasks Done" count and today's velocity bar update within the same session without a page refresh.

**Acceptance Scenarios**:

1. **Given** a user has 0 tasks completed today, **When** they mark a task as complete, **Then** the "Tasks Done" count increments by 1 and today's bar on the Productivity Velocity chart grows.
2. **Given** a user has already completed tasks today, **When** they mark another task as complete, **Then** the count and chart bar increment correctly without resetting previous completions.
3. **Given** a user completes a task on any page that shows the velocity dashboard (Inbox/Work Area), **Then** the update is visible immediately without navigating away or refreshing.

---

### User Story 2 - Velocity Updates on Task Uncomplete (Priority: P1)

A user who previously marked a task as complete decides to undo that action by toggling the task back to incomplete. The Productivity Velocity chart and Tasks Done counter immediately reflect the removal — today's bar shrinks and the count decrements.

**Why this priority**: Equally critical to Story 1. If undoing a completion does not update velocity, the dashboard shows incorrect data, breaking user trust in the metrics.

**Independent Test**: Can be tested by completing a task, verifying the count increments, then uncompleting the same task and verifying the count decrements back.

**Acceptance Scenarios**:

1. **Given** a task was completed today, **When** the user marks it as incomplete, **Then** the "Tasks Done" count decrements by 1 and today's bar on the velocity chart shrinks.
2. **Given** a task was completed on a previous day within the last 7 days, **When** the user unmarks it, **Then** the bar for that specific day on the velocity chart shrinks accordingly.
3. **Given** a user uncompletes their only completed task of today, **When** the toggle happens, **Then** the count returns to 0 and today's bar reflects zero completions.

---

### User Story 3 - Velocity Consistency Across Page Navigation (Priority: P2)

After completing or uncompleting tasks on any page, the velocity chart remains accurate when the user navigates to another page that shows the dashboard stats and returns.

**Why this priority**: Important for data integrity perception, but secondary to the real-time update itself.

**Independent Test**: Can be tested by completing a task on the Inbox page, navigating away and back, and confirming the chart still reflects the correct count.

**Acceptance Scenarios**:

1. **Given** a user completes a task on Inbox, **When** they navigate to another page and return, **Then** the velocity chart still shows the updated count.
2. **Given** the app is reopened after tasks were completed, **When** the user lands on a page with velocity stats, **Then** the chart reflects all previously completed tasks accurately.

---

### Edge Cases

- What happens when a task is completed and immediately uncompleted multiple times in quick succession? The final state must be reflected correctly.
- What happens if the task was completed on a day outside the last 7 days? The velocity chart for the current 7-day window should not be affected.
- What happens when a Google Tasks-sourced task is completed or uncompleted? Velocity should update consistently for both native and Google Tasks.
- How does the system handle a task with no `completedAt` timestamp that has `status: completed`? The task should either be excluded from velocity counting or treated as completed today.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST update the Productivity Velocity chart immediately when a user completes a task, without requiring a page refresh or navigation.
- **FR-002**: The system MUST update the Productivity Velocity chart immediately when a user uncompletes (toggles back) a previously completed task.
- **FR-003**: The system MUST clear the completion timestamp from a task when it is uncompleted, so that stale completion data does not persist.
- **FR-004**: The system MUST correctly count uncompleted tasks as not contributing to the velocity for the day they were originally completed.
- **FR-005**: The "Tasks Done" counter MUST increment when a task is completed and decrement when a task is uncompleted.
- **FR-006**: The Efficiency Trend percentage MUST recalculate correctly after any task is completed or uncompleted.
- **FR-007**: The velocity update behavior MUST apply consistently to tasks completed or uncompleted from any view in the app (Today, Inbox, Upcoming, Anytime).
- **FR-008**: The system MUST handle the case where a task has `status: completed` but no valid `completedAt` timestamp gracefully, without crashing or showing incorrect data.

### Key Entities

- **Task**: A unit of work with a status (`todo`, `completed`, `someday`, `canceled`), an optional completion timestamp, and an optional energy level. Its completion status directly drives velocity data.
- **Velocity Day**: A single day's aggregated completion count used to render one bar in the Productivity Velocity chart. Derived from tasks completed on that date within the last 7 days.
- **Dashboard Stats**: The combined view showing Productivity Velocity chart, Daily Focus ring, and Tasks Done counter. Must stay in sync with the current task completion state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The Productivity Velocity chart and Tasks Done counter update within 2 seconds of a user completing or uncompleting a task, with no manual refresh required.
- **SC-002**: After uncompleting a task, the velocity count for the relevant day accurately reflects the removal — no stale completions remain visible.
- **SC-003**: The Tasks Done count and velocity bars are always consistent with each other — there are no scenarios where the count and chart disagree.
- **SC-004**: The feature works correctly for 100% of task toggles regardless of which view (Today, Inbox, Upcoming, Anytime) the user is on when toggling.
- **SC-005**: Zero data integrity issues — a task's completion timestamp is always present when `status: completed` and always cleared when `status: todo`.
