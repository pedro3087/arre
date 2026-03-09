# Feature Specification: Consolidate Settings into Sidebar Footer

**Feature Branch**: `001-consolidate-settings`
**Created**: 2026-03-08
**Status**: Draft
**Input**: User description: "we want to move settings to the location on the UI where the button for changing light mode or dark mode is and this feature inside settings"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Access Settings from Sidebar Footer (Priority: P1)

A user wants to access the application settings. Instead of clicking "Settings" in the main sidebar navigation list, they click a settings icon/button located in the sidebar footer — the same area where the theme toggle button currently lives. Clicking it navigates them to the Settings page.

**Why this priority**: This is the core navigation change and the foundation for P2. Without this, the settings entry point is unchanged and the feature is not delivered.

**Independent Test**: Can be fully tested by verifying that a settings icon/button appears in the sidebar footer and clicking it navigates to the Settings page. Delivers clear value: settings are accessible from the footer in a persistent, low-visual-weight location.

**Acceptance Scenarios**:

1. **Given** the user is on any page of the app, **When** they look at the sidebar footer, **Then** they see a settings icon/button in the footer area (where the theme toggle used to be), and "Settings" no longer appears as a separate item in the main sidebar navigation list.
2. **Given** the user is on any page, **When** they click the settings icon/button in the sidebar footer, **Then** they are navigated to the Settings page.
3. **Given** the user is on mobile (bottom navigation bar), **When** they look at the bottom nav, **Then** the Settings entry is removed from the bottom navigation and accessible only from the sidebar footer equivalent for mobile.

---

### User Story 2 - Change Theme from Within Settings (Priority: P2)

A user wants to switch between light mode, dark mode, or system-default theme. They open Settings and find an "Appearance" section containing the theme toggle. They select their preferred theme and it takes effect immediately.

**Why this priority**: This delivers the second half of the feature — moving the theme control into Settings. It depends on P1 (settings must be accessible) but adds meaningful discoverability of theme preferences alongside other settings.

**Independent Test**: Can be fully tested by opening the Settings page, locating the Appearance section, and toggling between all three theme options (light, dark, system). Each selection must immediately change the app theme and persist after page refresh.

**Acceptance Scenarios**:

1. **Given** the user is on the Settings page, **When** they view the page, **Then** they see an "Appearance" section with a theme selector offering Light, Dark, and System options.
2. **Given** the user selects "Dark Mode" in the Appearance section, **When** the selection is made, **Then** the entire app immediately switches to dark theme without requiring a page reload.
3. **Given** the user selects a theme in Settings and then refreshes the page, **When** the page reloads, **Then** the previously selected theme is still active.
4. **Given** the user selects "System" mode, **When** the system OS theme changes, **Then** the app follows the OS theme automatically.

---

### Edge Cases

- What happens when a user with a bookmarked `/settings` URL opens the app after this change? The Settings page still exists at the same URL — no broken links.
- How does the layout handle the sidebar footer when both the settings icon and potentially other footer elements are present? The footer must remain uncluttered and visually consistent.
- What happens on mobile where there is a bottom navigation bar? The Settings entry must be removed from the bottom nav; users access Settings through a mobile-appropriate equivalent (e.g., a footer icon on mobile sidebar or through a dedicated tap target).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The main sidebar navigation list MUST NOT include a "Settings" navigation item.
- **FR-002**: The sidebar footer MUST display a settings icon/button that navigates the user to the Settings page when tapped or clicked.
- **FR-003**: The theme toggle control MUST be removed from the sidebar footer.
- **FR-004**: The Settings page MUST include an "Appearance" section containing controls to switch between Light, Dark, and System theme modes.
- **FR-005**: Selecting a theme option in the Appearance section MUST immediately apply the selected theme to the entire application without requiring a page reload.
- **FR-006**: The selected theme preference MUST persist across page reloads and browser sessions.
- **FR-007**: The bottom navigation bar (mobile) MUST NOT include a "Settings" navigation item.
- **FR-008**: The Settings page MUST remain accessible at its existing URL so that any bookmarks or direct links continue to work.

### Key Entities

- **Theme Preference**: The user's chosen display mode (Light, Dark, or System). Persists locally on the user's device. Three possible values: light, dark, system.
- **Settings Page**: The application screen housing all user-configurable preferences, now including an Appearance section in addition to existing Integrations content.
- **Sidebar Footer**: The persistent bottom area of the left navigation sidebar, now serving as the primary entry point to Settings.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of users can reach the Settings page exclusively via the sidebar footer icon — the settings entry is fully removed from the main nav list and bottom nav bar.
- **SC-002**: Users can change their theme preference in under 10 seconds from opening the Settings page for the first time.
- **SC-003**: Theme changes apply to the full application in under 500 milliseconds of the user making a selection (visually immediate).
- **SC-004**: The selected theme persists correctly in 100% of cases after page refresh or reopening the app in the same browser.
- **SC-005**: The sidebar footer area remains visually uncluttered — no more than 2 icon/button elements present at any time.

## Assumptions

- The Settings page URL (`/settings`) does not change — this feature only moves the navigation entry point and adds the Appearance section to the page content.
- Mobile users access Settings through the sidebar footer equivalent; the exact mobile UX pattern (e.g., hamburger menu, slide-out drawer) follows existing mobile navigation conventions already in the app.
- The three theme modes (Light, Dark, System) remain unchanged — no new theme options are added in scope.
- The theme preference storage mechanism (currently localStorage) remains unchanged; only the UI control location changes.
- "System" mode means the app follows the operating system's light/dark preference automatically.
