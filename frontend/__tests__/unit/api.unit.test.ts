import api, { getHabitLogSummary, getHabits } from "../../lib/api";

describe("api helpers", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("converts habit log summary arrays to Sets", async () => {
    jest.spyOn(api, "get").mockResolvedValueOnce({
      data: {
        "2026-03-01": [1, 2, 2],
        "2026-03-02": [3],
      },
    } as any);

    const result = await getHabitLogSummary("2026-03");
    expect(result["2026-03-01"]).toEqual(new Set([1, 2]));
    expect(result["2026-03-02"]).toEqual(new Set([3]));
  });

  it("passes date and timezone query params for getHabits", async () => {
    const spy = jest.spyOn(api, "get").mockResolvedValueOnce({ data: [] } as any);
    await getHabits("2026-03-03", "Europe/London");

    expect(spy).toHaveBeenCalledWith("/habits", {
      params: { date: "2026-03-03", tz: "Europe/London" },
    });
  });
});
