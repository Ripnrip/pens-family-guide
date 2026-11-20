import { describe, expect, it } from "vitest";
import { describeStatus, formatTime, getOpenStatus } from "../src/lib/hours.js";

// 2026-11-23 is a Monday (EST, UTC-5). 2026-07-06 is a Monday (EDT, UTC-4).
const est = (date: string, time: string) => new Date(`${date}T${time}:00-05:00`);
const edt = (date: string, time: string) => new Date(`${date}T${time}:00-04:00`);

describe("open-now logic (America/New_York)", () => {
  it("is closed before opening on a weekday and opens today", () => {
    const s = getOpenStatus(est("2026-11-23", "07:29"));
    expect(s.state).toBe("closed");
    expect(s.next).toMatchObject({ state: "open", time: "07:30", daysAhead: 0 });
    expect(describeStatus(s, "en").detail).toBe("Opens today at 7:30 AM.");
  });

  it("is open at 7:30 and mid-morning, closing for lunch", () => {
    expect(getOpenStatus(est("2026-11-23", "07:30")).state).toBe("open");
    const s = getOpenStatus(est("2026-11-23", "10:00"));
    expect(s.state).toBe("open");
    expect(s.next).toMatchObject({ state: "lunch", time: "12:30" });
    expect(describeStatus(s, "es").label).toBe("Abierto ahora");
  });

  it("closes for lunch 12:30-1:00 PM", () => {
    expect(getOpenStatus(est("2026-11-23", "12:29")).state).toBe("open");
    const lunch = getOpenStatus(est("2026-11-23", "12:30"));
    expect(lunch.state).toBe("lunch");
    expect(describeStatus(lunch, "en")).toEqual({ label: "Closed for lunch", detail: "Reopens at 1:00 PM." });
    expect(getOpenStatus(est("2026-11-23", "12:59")).state).toBe("lunch");
    expect(getOpenStatus(est("2026-11-23", "13:00")).state).toBe("open");
  });

  it("closes at 5:00 PM Monday-Thursday", () => {
    expect(getOpenStatus(est("2026-11-26", "16:59")).state).toBe("open");
    const s = getOpenStatus(est("2026-11-26", "17:00"));
    expect(s.state).toBe("closed");
    expect(s.next).toMatchObject({ weekday: 5, time: "07:30", daysAhead: 1 });
  });

  it("closes at 4:30 PM on Friday and reopens Monday", () => {
    expect(getOpenStatus(est("2026-11-27", "16:29")).state).toBe("open");
    const s = getOpenStatus(est("2026-11-27", "16:30"));
    expect(s.state).toBe("closed");
    expect(s.next).toMatchObject({ weekday: 1, daysAhead: 3 });
    expect(describeStatus(s, "en").detail).toBe("Opens Monday at 7:30 AM.");
    expect(describeStatus(s, "es").detail).toBe("Abre el lunes a las 7:30 a. m.");
  });

  it("is closed on weekends", () => {
    const sat = getOpenStatus(est("2026-11-28", "10:00"));
    expect(sat.state).toBe("closed");
    expect(sat.next.daysAhead).toBe(2);
    const sun = getOpenStatus(est("2026-11-29", "10:00"));
    expect(sun.state).toBe("closed");
    expect(describeStatus(sun, "en").detail).toBe("Opens tomorrow (Monday) at 7:30 AM.");
  });

  it("handles daylight saving time (EDT)", () => {
    expect(getOpenStatus(edt("2026-07-06", "16:59")).state).toBe("open");
    expect(getOpenStatus(edt("2026-07-06", "17:00")).state).toBe("closed");
    // 21:30 UTC is 5:30 PM EDT (closed) — would be 4:30 PM in EST.
    expect(getOpenStatus(new Date("2026-07-06T21:30:00Z")).state).toBe("closed");
  });

  it("formats times in both languages", () => {
    expect(formatTime("07:30", "en")).toBe("7:30 AM");
    expect(formatTime("13:00", "en")).toBe("1:00 PM");
    expect(formatTime("12:30", "es")).toBe("12:30 p. m.");
  });
});
