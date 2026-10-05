import { MergingRefiner } from "../../../common/abstractRefiners";
import { ParsingComponents, ParsingResult, ReferenceWithTimezone } from "../../../results";
import { parseDuration } from "../constants";
import { Duration } from "../../../calculation/duration";

function parseFollowingDuration(result: ParsingResult): Duration | null {
    // The duration should be mentioned after "for", e.g. "for 2 hours", "for an hour".
    const match = result.text.match(/^for\s*(.+)$/i);
    if (!match) {
        return null;
    }

    // Exclude "for the unit" phases, e.g. "for the year" (see ENTimeUnitWithinFormatParser).
    if (match[1].match(/^the\s*\w+/i)) {
        return null;
    }

    return parseDuration(match[1]);
}

/**
 * Merges a date/time followed by a duration ("for <timeunits>") into a single date range.
 * - [tomorrow at 3pm] [for 2 hours]
 * - [Friday 10am] [for an hour]
 * - [March 5] [for 3 days]
 *
 * A standalone duration (e.g. "for 2 hours" without a date in front) is left as-is.
 */
export default class ENMergeDateAndDurationRefiner extends MergingRefiner {
    shouldMergeResults(textBetween: string, currentResult: ParsingResult, nextResult: ParsingResult): boolean {
        if (!textBetween.match(/^\s*$/i)) {
            return false;
        }

        if (currentResult.end != null || nextResult.end != null) {
            return false;
        }

        return parseFollowingDuration(nextResult) != null;
    }

    mergeResults(textBetween: string, currentResult: ParsingResult, nextResult: ParsingResult): ParsingResult {
        const duration = parseFollowingDuration(nextResult);

        // The end is the start date/time shifted by the duration. The start's timezone
        // (e.g. extracted from a timezone abbreviation) is kept when shifting.
        const endComponents = ParsingComponents.createRelativeFromReference(
            new ReferenceWithTimezone(currentResult.start.date(), currentResult.start.get("timezoneOffset")),
            duration
        );

        const result = currentResult.clone();
        result.end = endComponents;
        result.text = `${currentResult.text}${textBetween}${nextResult.text}`;
        return result;
    }
}
