#!/usr/bin/env node
/* eslint-disable no-console */
const { spawnSync } = require("node:child_process");

const probe = spawnSync("npx", ["--yes", "detox", "--help"], {
  stdio: "ignore",
});

if (probe.status !== 0) {
  console.error(
    "Detox is not available. Install and configure Detox to run iOS E2E tests."
  );
  process.exit(1);
}

const run = spawnSync("npx", ["detox", "test", "-c", "ios.sim.debug"], {
  stdio: "inherit",
});

process.exit(run.status ?? 1);
