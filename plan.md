# Habee widgets, Live Activities and Pomodoro plan

Status: proposed implementation plan; this PR adds documentation only.
Date: 21 October 2026.

## Goals

- Show daily habit progress outside the app, using Habee's black/yellow branding.
- Offer a widget action to start an editable Pomodoro session.
- Show a temporary Lock Screen Live Activity and Dynamic Island countdown for an active routine/session.
- Explore opt-in Work / Do Not Disturb integration, including restoring the previously active Focus (for example Sleep), without promising unsupported iOS behavior.
- Keep everyday habit tracking usable without Focus integration or a network connection for the timer.

## Current repository foundations

- frontend/package.json: Expo SDK 54, React Native 0.81.5, React 19.1, TypeScript, expo-notifications, expo-dev-client and AsyncStorage.
- frontend/app.json: iOS bundle ID com.habeeapp.habee and habee URL scheme.
- frontend/eas.json: development-client build profile already exists.
- frontend/lib/api.ts: getHabitSummary(date), logHabit(id, date), undoHabit(id, date), authenticated with a SecureStore bearer token.
- frontend/src/screens/HomeScreen.tsx: loadHabits and handleToggleHabit manage daily summaries and completion/undo, including browsing previous dates.
- frontend/src/utils/isApplicable.ts: scheduling logic for daily/weekly habits and pauses.
- frontend/src/navigation/AppNavigator.tsx: React Navigation linking currently maps the reset-password route.
- backend: Flask REST API; no real-time transport is required for the initial widget/timer release.

## Product surfaces

| Surface | Purpose | Proposed content/actions |
| --- | --- | --- |
| Home Screen widget | Persistent overview of today's habits | Completed/total, next outstanding habit, Start Pomodoro action |
| Small Lock Screen widget | Compact daily overview | Today's completion count; tap through to Habee |
| Live Activity | Temporary active routine or Pomodoro | Habit/session label, countdown, progress, phase and supported session controls |
| Dynamic Island | Compact ongoing-session status | Countdown and work/break phase |
| App timer screen | Full editing and management | Work/break durations, linked habit, start/cancel, Focus setup and eventual loop preference |

A large card like the train card is a Live Activity, not a permanent daily widget. Respect ActivityKit's lifetime limits; do not repeatedly restart activities to simulate a permanent banner.

## Proposed Pomodoro behavior

Defaults: 25 minutes work, 5 minutes rest. Both durations are editable in the app and saved as defaults for future sessions. A widget starts the saved configuration; its edit link opens the timer screen.

Proposed flow:

1. Start Pomodoro from the widget or app; optionally associate it with a habit.
2. Start one work block and show its end time/countdown in a Live Activity.
3. At the work deadline, start the five-minute rest period conceptually, notify the user subject to notification/Focus settings, and request Focus restoration through the optional integration if supported.
4. At the rest deadline, show "Ready for next block" and offer Start next block.
5. Require an explicit action to begin another work block in the proposed first release.

Automatic work-to-rest and manual rest-to-work is a recommendation, not an approved final product decision. Preserve the open question about looping. Possible later options: manual restart, automatic restart with opt-in, or a finite number of cycles. Consider an early-restart confirmation/disabled action during rest rather than letting accidental taps bypass the intended break.

Do not mark a habit complete just because a timer finishes; offer an explicit completion action using the existing logging API.

### Session state and timing

- Model idle, working, resting, ready and cancelled states; introduce paused only if pause/resume is included.
- Persist session ID, optional habit ID, configured durations, work start/end timestamps, rest end timestamp, revision and notification identifiers.
- Use absolute timestamps and system-rendered countdowns. Never rely on a React setInterval, a widget refresh every second, or a running JS process to keep time.
- Keep one active local session. Make repeated start/cancel actions idempotent across app and widget entry points.
- Reconcile phase from timestamps on foregrounding, relaunch and every action. If both deadlines passed while the app was closed, show ready; do not start a fresh rest period on return.
- Pre-schedule local boundary notifications and cancel/replace them on cancellation or supported edits. Permission denial must not break the session.
- A countdown continuing on the Lock Screen does not mean application code executes at its deadline. Exact background phase changes, Live Activity content changes and Focus side effects require a proven system mechanism; JS timers and ordinary notifications do not guarantee execution.
- Prototype whether the selected widget library can render the precomputed work/rest schedule while suspended. If it cannot, use an honest "Work complete / take a break" fallback until reconciliation, or add a separately scoped native/push mechanism. Do not claim fully automatic background transitions until tested on a locked physical device.
- Restrict duration editing to before a session for the first release. Define explicit rescheduling semantics before allowing active-session edits.
- Handle app termination, reboot, clock/timezone changes, duplicate actions and stale activity instances. Avoid storing private habit details beyond what the card needs.

## iOS Focus integration: feasibility gate

### Requested experience

Capture the previous Focus (including none), activate a selected profile such as Work or Do Not Disturb during work, restore the previous profile at the work deadline, then run the rest timer. If Sleep was active before the block, the desired result is Sleep again, not simply Focus off.

### Platform boundary

- Standard third-party app APIs do not provide general named-Focus selection/switching and restoration. INFocusStatus exposes notification availability, not a named previous-profile snapshot.
- Focus Filters change Habee's behavior when the system activates a Focus; they do not grant authority to switch the device's Focus.
- Do not treat Focus Status authorization as permission to control Work/Sleep/Do Not Disturb.
- Investigate a user-installed Shortcuts companion using Get Current Focus, Set Focus, and Habee App Intents. This is an opt-in integration, not a silent app permission.
- Do not infer that expiration of a temporary Work Focus restores Sleep automatically. Verify explicitly.
- Do not implement a 25-minute Shortcuts Wait followed by restoration: long-running shortcuts are not a reliable background scheduler.
- Turning Work on until a deadline may provide automatic expiration, but named previous-Focus restoration needs a separate validated mechanism.
- In particular, the widget's native start action may need a Shortcuts handoff for Focus control, so "one tap without opening anything" is not promised for Focus-enabled sessions.

### Investigation and acceptance checks

- Prototype Start Habee Pomodoro and Stop Habee Pomodoro App Intents and a companion Shortcut.
- Validate capturing none/Work/Sleep/custom Focus, applying the user-selected work profile and preserving a restorable identity in a location the Shortcut can access.
- Investigate whether a user-configured Focus-off automation can perform restoration at the deadline, using a session marker to distinguish intended expiry from other changes.
- Test locked-device execution, cancellation, app termination, reboot, missing Shortcut, denied permissions, and profiles renamed/deleted.
- Respect a manual Focus change during the work block. Never blindly overwrite a newer user choice with a saved profile.
- Test the case where Work was already active: do not disable a Focus Habee did not turn on.
- Verify notification delivery under Work and the restored profile; a local notification does not automatically bypass Focus.
- Only advertise automatic restore if this path works reliably on supported iOS versions.
- Otherwise ship the timer without Focus control, with an optional setup guide/manual restore action and a precise explanation of the limitation. Preserve the full desired behavior as deferred, rather than silently substituting Focus off.

## Technical implementation

### 1. Upgrade and feasibility prototype

- Upgrade Expo SDK 54 incrementally to a supported stable SDK with stable expo-widgets support (introduced in SDK 55; stable from SDK 56). Re-check current release documentation when implementing.
- Align React Native/React/native dependency versions with the chosen SDK and run Expo compatibility checks.
- Use the existing EAS development profile or a local native build. Expo Go cannot run the widget extension.
- Prototype expo-widgets + @expo/ui for daily snapshots and Live Activities.
- Verify interactive widget actions in the chosen SDK. Use a native AppIntent / LiveActivityIntent bridge when needed; opening the timer screen is an explicit fallback, not equivalent to background start.
- Keep iOS modules behind platform-specific boundaries so Android continues to build and launch.
- Validate signing, extension bundle identifiers, App Groups and generated native configuration.

### 2. Shared data/services

Suggested new modules (names may change during implementation):

- frontend/src/features/widgets/buildDailySnapshot.ts
- frontend/src/features/widgets/widgetService.ios.ts and a safe other-platform implementation
- frontend/src/features/pomodoro/sessionModel.ts
- frontend/src/features/pomodoro/sessionService.ts
- frontend/src/features/pomodoro/PomodoroScreen.tsx
- frontend/widgets/DailyHabitsWidget.tsx
- frontend/widgets/PomodoroActivity.tsx
- Native App Intent support / config plugin only where the Expo layer does not expose required actions.

Keep widget layout pure and feed it a small serialized snapshot. Expo widget functions run in an isolated runtime with Expo SwiftUI components, not React Native View/Text or app hooks/context.

For native widget actions, use extension-accessible persistent state (for example the configured App Group) with serialized/idempotent mutations. AsyncStorage or a React store alone is not a shared native action store. Keep authentication tokens out of rendered widget snapshots.

### 3. Daily habit widget

- Build today's snapshot from getHabitSummary using the user's local date and the API's supported timezone handling.
- Show completed/total, a short next-habit label and a Start Pomodoro affordance in supported widget families; small Lock Screen families can remain tap-through.
- Publish after initial load, foreground refresh and successful completion/undo/create/edit/archive/delete changes.
- Do not derive today's widget from whichever historical date HomeScreen currently displays.
- Include snapshot date/last-updated state so stale data is not presented as today's data.
- Define midnight rollover and timezone-change refresh behavior. Widget timelines can schedule a date change, but cannot invent fresh server completion data.
- Clear private snapshots and end sessions/activities on logout/account deletion.
- Use existing black/yellow styling with accessible contrast and reduced-luminance support.

### 4. Pomodoro widget action and Live Activity

- Persist the session before displaying the activity; recover existing sessions/activities after relaunch.
- Start using saved editable durations and show work/break phase with a native countdown.
- Add deep links for editing settings and opening the active session.
- Include cancel and Start next block actions where supported. Decide whether pause/resume belongs in the initial release.
- Starting/logging must not require fetching every habit; the timer itself runs locally.
- Keep habit completion separate from timer completion.
- Stop/cancel must clean up scheduled notifications, persisted active state, activity instances and any proven optional Focus integration.
- Handle Live Activities disabled/unavailable gracefully: the in-app timer remains usable.

### 5. Routine Live Activity (optional follow-up)

- Allow a user to explicitly start a bounded routine containing selected habits.
- Publish completion progress after successful log/undo actions for that routine's date.
- End on completion, cancellation or expiry.
- Reuse the activity service but keep routine-progress and Pomodoro state types distinct.

### 6. Remote updates (deferred)

Local timer/daily-widget work does not require Flask changes. If updates from another device must change an existing Live Activity while Habee is suspended, assess ActivityKit APNs tokens, server updates and token lifecycle separately. A WebSocket connection is not a substitute for ActivityKit pushes on a suspended iPhone.

## Validation when implementing

- Run Expo dependency/type checks and the existing frontend suite after the SDK upgrade; document commands and results in implementation PRs.
- Add meaningful tests for phase reconciliation, historical-date isolation, duplicate actions, cancellation and notification rescheduling.
- Use a physical iPhone to verify widget start while the app is closed, Lock Screen/Dynamic Island layouts, killed-app countdown, work/rest boundaries, recovery and disabled permissions.
- Test offline timer operation independently of server-backed habit logging.
- Verify midnight/timezone rollover, logout privacy cleanup and Android build safety.
- Run the separate Focus feasibility matrix before making any automatic restoration claim.
- This documentation-only PR does not change runtime behavior and does not require application test runs.

## Open decisions

- After rest: manual next block (proposed default), opt-in automatic loop, or fixed cycle count?
- Should restarting early during rest require confirmation?
- Should pause/resume ship immediately?
- Should a Pomodoro be standalone, linked to one habit, or both?
- Does successful Focus restoration justify the Shortcuts setup, or should Focus remain optional guidance?
- Which widget sizes are worth supporting first?

## Hypothetical WebSockets in Habee (not an implementation commitment)

A useful use case is syncing habit changes between two open devices, or synchronizing a session's start/cancel state. It does not help a local countdown tick.

A minimal extension could keep REST writes, then emit a per-user "habits.changed" event after a successful database commit. Other authenticated foreground clients receive the event and refetch the existing daily/calendar summaries.

Flask-SocketIO with socket.io-client is one option. Socket.IO uses its own protocol; do not pair its server with a raw WebSocket client. Authenticate the handshake with the existing JWT, derive rooms from the verified server-side identity, reject expired tokens and never trust a client-supplied user ID for room membership. Refetch on every reconnect/foreground resume so missed events do not leave stale data.

The current plain Gunicorn Procfile would need a compatible Socket.IO deployment configuration. Start with a supported single-worker threaded setup and simple-websocket; assess proxy support and connection limits. Multiple instances require coordination (for example Redis) and an appropriate routing configuration.

Keep sockets connected only when useful while foregrounded; do not depend on them while iOS suspends the app. Keep WebSockets as a separate future feature unless a real multi-device use case appears.

## References

- Expo Widgets: https://docs.expo.dev/versions/latest/sdk/widgets/
- Expo SDK 56 (widgets stabilization): https://expo.dev/changelog/sdk-56
- ActivityKit: https://developer.apple.com/documentation/activitykit
- Live Activity behavior: https://developer.apple.com/documentation/activitykit/displaying-live-data-with-live-activities
- Widget interaction: https://developer.apple.com/documentation/widgetkit/adding-interactivity-to-widgets-and-live-activities
- LiveActivityIntent: https://developer.apple.com/documentation/appintents/liveactivityintent
- Focus status: https://developer.apple.com/documentation/intents/infocusstatus
- Focus Filters: https://developer.apple.com/documentation/appintents/focus
- Shortcuts Get Current Focus: https://support.apple.com/101583
- Shortcuts Focus triggers: https://support.apple.com/guide/shortcuts/apde31e9638b/ios
- Flask-SocketIO authentication: https://flask-socketio.readthedocs.io/en/latest/implementation_notes.html
- Flask-SocketIO deployment: https://flask-socketio.readthedocs.io/en/latest/deployment.html
