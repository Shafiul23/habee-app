import { isValidEmail, isValidPassword, isValidHabit } from "../../src/utils/validation";

describe("validation utils", () => {
  it("validates emails", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("bad-email")).toBe(false);
  });

  it("validates passwords", () => {
    expect(isValidPassword("Password1")).toBe(true);
    expect(isValidPassword("short")).toBe(false);
  });

  it("validates habit names with useful errors", () => {
    expect(isValidHabit("   ").valid).toBe(false);
    expect(isValidHabit("x".repeat(65)).valid).toBe(false);
    expect(isValidHabit("Walk").valid).toBe(true);
  });
});
