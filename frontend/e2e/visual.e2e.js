/* global device */
const fs = require("node:fs");
const path = require("node:path");

describe("@visual Login baseline", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it("captures login screen baseline", async () => {
    const screenshotPath = await device.takeScreenshot("login-default");
    const image = fs.readFileSync(screenshotPath);

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: path.join(__dirname, "__image_snapshots__", "ios"),
      customDiffDir: path.join(__dirname, "__image_snapshots__", "ios", "__diff_output__"),
      customSnapshotIdentifier: "login-default",
      failureThreshold: 0.02,
      failureThresholdType: "percent",
    });
  });
});
