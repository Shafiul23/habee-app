#!/usr/bin/env node
/* eslint-disable no-console */
const { spawnSync } = require("node:child_process");

const jestImageSnapshotProbe = spawnSync(
  "node",
  ["-e", "require.resolve('jest-image-snapshot')"],
  { stdio: "ignore" }
);

if (jestImageSnapshotProbe.status !== 0) {
  console.error(
    "jest-image-snapshot is not installed. Add it to devDependencies before running visual tests."
  );
  process.exit(1);
}

const run = spawnSync("npx", ["detox", "test", "-c", "ios.sim.debug", "--grep", "@visual"], {
  stdio: "inherit",
});

process.exit(run.status ?? 1);
