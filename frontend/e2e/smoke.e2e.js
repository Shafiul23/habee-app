/* global device, element, by */
describe("HexaHabit E2E smoke", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it("shows the login entrypoint", async () => {
    await expect(element(by.text("Log In"))).toBeVisible();
  });
});
