import { MergingRefiner } from "../../../common/abstractRefiners";
import { ParsingResult } from "../../../results";
import { parseDuration } from "../constants";

/**
 * Merges an absolute date/time result followed by a "for <duration>" phrase
 * into a single result with the duration used as the event's end time.
 * - [tomorrow at 3pm] [for 2 hours]
 * - [March 5] [for 3 days]
 *
 * The standalone "for <duration>" result (e.g. just "for 2 hours") is left untouched.
 */
export default class ENMergeDateWithDurationRefiner extends MergingRefiner {
    shouldMergeResults(textBetween: string, currentResult: ParsingResult, nextResult: ParsingResult): boolean {
        // The date and the "for <duration>" phrase need to be next to each other.
        if (!/^\s*$/.test(textBetween)) {
            return false;
        }

        // Only merge when the following result is a "for <duration>" phrase.
        if (!nextResult.start.tags().has("result/forDuration")) {
            return false;
        }

        // Don't merge into an already ranged result (e.g. "Monday to Tuesday for 2 hours").
        return !currentResult.end;
    }

    mergeResults(textBetween: string, currentResult: ParsingResult, nextResult: ParsingResult): ParsingResult {
        const durationText = nextResult.text.replace(/^\s*for\s+/i, "");
        const duration = parseDuration(durationText);

        const result = currentResult.clone();
        result.text = `${currentResult.text}${textBetween}${nextResult.text}`;
        if (duration) {
            result.end = currentResult.start.clone().addDurationAsImplied(duration);
        }
        result.addTag("result/durationRange");
        return result;
    }
}
