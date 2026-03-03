# E2E and Visual Testing

This folder contains Detox-based mobile E2E and screenshot regression tests.

## Commands

- `npm run test:e2e:ios`
- `npm run test:visual`

## Visual Baseline Policy

- Keep at most 10-12 golden snapshots.
- Start with one iOS simulator profile only.
- Capture stable states only (avoid loading spinners, clocks, random content).
- Store snapshots under `e2e/__image_snapshots__/ios/`.
- If snapshot growth becomes large, move snapshot files to Git LFS.
