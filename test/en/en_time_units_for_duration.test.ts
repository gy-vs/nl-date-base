import * as chrono from "../../src";
import { testSingleCase } from "../test_util";

// Reference: Wednesday, 2024-03-06 08:00
const REF_DATE = new Date(2024, 3 - 1, 6, 8, 0, 0);

test("Test - Date/time followed by 'for <duration>' merges into a single result", () => {
    testSingleCase(chrono, "tomorrow at 3pm for 2 hours", REF_DATE, (result) => {
        expect(result.index).toBe(0);
        expect(result.text).toBe("tomorrow at 3pm for 2 hours");
        expect(result.tags()).toContain("result/durationRange");

        expect(result.start).toBeDate(new Date(2024, 3 - 1, 7, 15, 0));
        expect(result.end).not.toBeNull();
        expect(result.end).toBeDate(new Date(2024, 3 - 1, 7, 17, 0));
    });

    testSingleCase(chrono, "Friday 10am for an hour", REF_DATE, (result) => {
        expect(result.index).toBe(0);
        expect(result.text).toBe("Friday 10am for an hour");

        expect(result.start).toBeDate(new Date(2024, 3 - 1, 8, 10, 0));
        expect(result.end).toBeDate(new Date(2024, 3 - 1, 8, 11, 0));
    });

    testSingleCase(chrono, "March 5 for 3 days", REF_DATE, (result) => {
        expect(result.index).toBe(0);
        expect(result.text).toBe("March 5 for 3 days");

        expect(result.start).toBeDate(new Date(2024, 3 - 1, 5, 12, 0));
        expect(result.end).toBeDate(new Date(2024, 3 - 1, 8, 12, 0));
    });
});

test("Test - Duration ending past midnight rolls the end into the next day", () => {
    testSingleCase(chrono, "tonight at 11pm for 2 hours", REF_DATE, (result) => {
        expect(result.text).toBe("tonight at 11pm for 2 hours");

        expect(result.start).toBeDate(new Date(2024, 3 - 1, 6, 23, 0));
        expect(result.end).toBeDate(new Date(2024, 3 - 1, 7, 1, 0));
    });
});

test("Test - Supported duration wordings after a date/time", () => {
    testSingleCase(chrono, "tomorrow at 3pm for 30 minutes", REF_DATE, (result) => {
        expect(result.start).toBeDate(new Date(2024, 3 - 1, 7, 15, 0));
        expect(result.end).toBeDate(new Date(2024, 3 - 1, 7, 15, 30));
    });

    testSingleCase(chrono, "tomorrow at 3pm for half an hour", REF_DATE, (result) => {
        expect(result.start).toBeDate(new Date(2024, 3 - 1, 7, 15, 0));
        expect(result.end).toBeDate(new Date(2024, 3 - 1, 7, 15, 30));
    });

    testSingleCase(chrono, "tomorrow at 3pm for 2 hours 30 minutes", REF_DATE, (result) => {
        expect(result.start).toBeDate(new Date(2024, 3 - 1, 7, 15, 0));
        expect(result.end).toBeDate(new Date(2024, 3 - 1, 7, 17, 30));
    });

    testSingleCase(chrono, "March 10 for 1 week", REF_DATE, (result) => {
        expect(result.start).toBeDate(new Date(2024, 3 - 1, 10, 12, 0));
        expect(result.end).toBeDate(new Date(2024, 3 - 1, 17, 12, 0));
    });
});

test("Test - The expression can be embedded in a sentence", () => {
    testSingleCase(chrono, "meeting March 5 for 3 days please", REF_DATE, (result) => {
        expect(result.index).toBe(8);
        expect(result.text).toBe("March 5 for 3 days");

        expect(result.start).toBeDate(new Date(2024, 3 - 1, 5, 12, 0));
        expect(result.end).toBeDate(new Date(2024, 3 - 1, 8, 12, 0));
    });
});

test("Test - End time uses the same timezone as the start", () => {
    testSingleCase(chrono, "tomorrow at 3pm EST for 2 hours", REF_DATE, { timezones: { EST: -300 } }, (result) => {
        expect(result.start).toBeDate(new Date(Date.UTC(2024, 3 - 1, 7, 20, 0)));
        expect(result.end).toBeDate(new Date(Date.UTC(2024, 3 - 1, 7, 22, 0)));
        expect(result.start.get("timezoneOffset")).toBe(-300);
        expect(result.end.get("timezoneOffset")).toBe(-300);
    });
});

test("Test - forwardDate shifts both start and end while keeping the duration", () => {
    // Reference is Wednesday 2024-03-06; without forwardDate Monday resolves to 2024-03-04.
    testSingleCase(chrono, "Monday 10am for 2 hours", REF_DATE, { forwardDate: true }, (result) => {
        expect(result.start).toBeDate(new Date(2024, 3 - 1, 11, 10, 0));
        expect(result.end).toBeDate(new Date(2024, 3 - 1, 11, 12, 0));
    });

    // The month/day is in the past; forwardDate moves it to the next year.
    testSingleCase(chrono, "January 10 9am for 2 hours", REF_DATE, { forwardDate: true }, (result) => {
        expect(result.start).toBeDate(new Date(2025, 1 - 1, 10, 9, 0));
        expect(result.end).toBeDate(new Date(2025, 1 - 1, 10, 11, 0));
    });
});

test("Test - A standalone 'for <duration>' remains a relative date without end", () => {
    testSingleCase(chrono, "for 2 hours", REF_DATE, (result) => {
        expect(result.index).toBe(0);
        expect(result.text).toBe("for 2 hours");
        expect(result.end).toBeNull();

        expect(result.start).toBeDate(new Date(2024, 3 - 1, 6, 10, 0));
    });

    testSingleCase(chrono, "set a timer for 5 minutes", REF_DATE, (result) => {
        expect(result.index).toBe(12);
        expect(result.text).toBe("for 5 minutes");
        expect(result.end).toBeNull();

        expect(result.start).toBeDate(new Date(2024, 3 - 1, 6, 8, 5));
    });
});

test("Test - Strict mode also supports the date-time duration range", () => {
    testSingleCase(chrono.strict, "May 5 for 2 hours", REF_DATE, (result) => {
        expect(result.start).toBeDate(new Date(2024, 5 - 1, 5, 12, 0));
        expect(result.end).toBeDate(new Date(2024, 5 - 1, 5, 14, 0));
    });
});
