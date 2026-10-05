import * as chrono from "../../src";
import { testSingleCase } from "../test_util";

test("Test - Date/time followed by 'for' duration", () => {
    testSingleCase(chrono, "tomorrow at 3pm for 2 hours", new Date(2024, 3 - 1, 6, 8, 0), (result) => {
        expect(result.index).toBe(0);
        expect(result.text).toBe("tomorrow at 3pm for 2 hours");

        expect(result.start).not.toBeNull();
        expect(result.start.get("year")).toBe(2024);
        expect(result.start.get("month")).toBe(3);
        expect(result.start.get("day")).toBe(7);
        expect(result.start.get("hour")).toBe(15);
        expect(result.start).toBeDate(new Date(2024, 3 - 1, 7, 15, 0));

        expect(result.end).not.toBeNull();
        expect(result.end.get("year")).toBe(2024);
        expect(result.end.get("month")).toBe(3);
        expect(result.end.get("day")).toBe(7);
        expect(result.end.get("hour")).toBe(17);
        expect(result.end.get("minute")).toBe(0);
        expect(result.end).toBeDate(new Date(2024, 3 - 1, 7, 17, 0));
    });

    testSingleCase(chrono, "Friday 10am for an hour", new Date(2024, 3 - 1, 6, 8, 0), (result) => {
        expect(result.text).toBe("Friday 10am for an hour");

        expect(result.start).toBeDate(new Date(2024, 3 - 1, 8, 10, 0));
        expect(result.end).not.toBeNull();
        expect(result.end).toBeDate(new Date(2024, 3 - 1, 8, 11, 0));
    });

    testSingleCase(chrono, "tonight at 11pm for 2 hours", new Date(2024, 3 - 1, 6, 8, 0), (result) => {
        expect(result.text).toBe("tonight at 11pm for 2 hours");

        expect(result.start).toBeDate(new Date(2024, 3 - 1, 6, 23, 0));

        // The end rolls over to the next day.
        expect(result.end).not.toBeNull();
        expect(result.end.get("day")).toBe(7);
        expect(result.end.get("hour")).toBe(1);
        expect(result.end).toBeDate(new Date(2024, 3 - 1, 7, 1, 0));
    });

    testSingleCase(chrono, "meet at 3pm for 30 minutes", new Date(2024, 3 - 1, 6, 8, 0), (result) => {
        expect(result.text).toBe("at 3pm for 30 minutes");

        expect(result.start).toBeDate(new Date(2024, 3 - 1, 6, 15, 0));
        expect(result.end).not.toBeNull();
        expect(result.end).toBeDate(new Date(2024, 3 - 1, 6, 15, 30));
    });

    testSingleCase(chrono, "tomorrow at 3pm for 1 hour and 30 minutes", new Date(2024, 3 - 1, 6, 8, 0), (result) => {
        expect(result.text).toBe("tomorrow at 3pm for 1 hour and 30 minutes");

        expect(result.start).toBeDate(new Date(2024, 3 - 1, 7, 15, 0));
        expect(result.end).not.toBeNull();
        expect(result.end).toBeDate(new Date(2024, 3 - 1, 7, 16, 30));
    });
});

test("Test - Date followed by 'for' duration", () => {
    testSingleCase(chrono, "March 5 for 3 days", new Date(2024, 3 - 1, 6, 8, 0), (result) => {
        expect(result.text).toBe("March 5 for 3 days");

        expect(result.start.get("year")).toBe(2024);
        expect(result.start.get("month")).toBe(3);
        expect(result.start.get("day")).toBe(5);

        expect(result.end).not.toBeNull();
        expect(result.end.get("year")).toBe(2024);
        expect(result.end.get("month")).toBe(3);
        expect(result.end.get("day")).toBe(8);
    });

    testSingleCase(chrono, "March 5th, 2024 for 3 days", new Date(2024, 3 - 1, 6, 8, 0), (result) => {
        expect(result.text).toBe("March 5th, 2024 for 3 days");

        expect(result.start).toBeDate(new Date(2024, 3 - 1, 5, 12, 0));
        expect(result.end).not.toBeNull();
        expect(result.end.get("year")).toBe(2024);
        expect(result.end.get("month")).toBe(3);
        expect(result.end.get("day")).toBe(8);
    });
});

test("Test - Date/time with timezone followed by 'for' duration", () => {
    testSingleCase(chrono, "tomorrow at 3pm PST for 2 hours", new Date(2024, 3 - 1, 6, 8, 0), (result) => {
        expect(result.text).toBe("tomorrow at 3pm PST for 2 hours");

        expect(result.start.get("hour")).toBe(15);
        expect(result.start.get("timezoneOffset")).toBe(-480);
        expect(result.start).toBeDate(new Date(Date.UTC(2024, 3 - 1, 7, 23, 0)));

        // The end is shifted within the same timezone as the start.
        expect(result.end).not.toBeNull();
        expect(result.end.get("hour")).toBe(17);
        expect(result.end.get("timezoneOffset")).toBe(-480);
        expect(result.end).toBeDate(new Date(Date.UTC(2024, 3 - 1, 8, 1, 0)));
    });
});

test("Test - 'for' duration without a date in front is kept as-is", () => {
    testSingleCase(chrono, "for 2 hours", new Date(2024, 3 - 1, 6, 8, 0), (result) => {
        expect(result.text).toBe("for 2 hours");

        expect(result.start).toBeDate(new Date(2024, 3 - 1, 6, 10, 0));
        expect(result.end).toBeNull();
    });

    testSingleCase(chrono, "set a timer for 5 minutes", new Date(2024, 3 - 1, 6, 8, 0), (result) => {
        expect(result.text).toBe("for 5 minutes");

        expect(result.start).toBeDate(new Date(2024, 3 - 1, 6, 8, 5));
        expect(result.end).toBeNull();
    });

    testSingleCase(chrono, "within 2 hours", new Date(2024, 3 - 1, 6, 8, 0), (result) => {
        expect(result.text).toBe("within 2 hours");

        expect(result.start).toBeDate(new Date(2024, 3 - 1, 6, 10, 0));
        expect(result.end).toBeNull();
    });
});

test("Test - Date/time followed by 'for' duration with forwardDate option", () => {
    // On Saturday 2024-03-09, "Friday" is moved to the next week.
    testSingleCase(
        chrono,
        "Friday 10am for an hour",
        new Date(2024, 3 - 1, 9, 8, 0),
        { forwardDate: true },
        (result) => {
            expect(result.text).toBe("Friday 10am for an hour");

            expect(result.start).toBeDate(new Date(2024, 3 - 1, 15, 10, 0));
            expect(result.end).not.toBeNull();
            expect(result.end).toBeDate(new Date(2024, 3 - 1, 15, 11, 0));
        }
    );

    // "March 5" is already past, so it is moved to the next year.
    testSingleCase(chrono, "March 5 for 3 days", new Date(2024, 3 - 1, 6, 8, 0), { forwardDate: true }, (result) => {
        expect(result.text).toBe("March 5 for 3 days");

        expect(result.start.get("year")).toBe(2025);
        expect(result.start.get("month")).toBe(3);
        expect(result.start.get("day")).toBe(5);

        expect(result.end).not.toBeNull();
        expect(result.end.get("year")).toBe(2025);
        expect(result.end.get("month")).toBe(3);
        expect(result.end.get("day")).toBe(8);
    });
});

test("Test - Existing date range is not merged with a following duration", () => {
    const results = chrono.parse("March 5 to March 7 for 3 days", new Date(2024, 3 - 1, 6, 8, 0));
    expect(results).toHaveLength(2);

    expect(results[0].text).toBe("March 5 to March 7");
    expect(results[0].start).toBeDate(new Date(2024, 3 - 1, 5, 12, 0));
    expect(results[0].end).toBeDate(new Date(2024, 3 - 1, 7, 12, 0));

    expect(results[1].text).toBe("for 3 days");
    expect(results[1].end).toBeNull();
});
