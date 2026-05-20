import { render, TemplateResult } from "lit";
import { formatMinutesHumanReadable } from "../../../src/lib/converters/timeConverter";

function renderToText(template: TemplateResult): string {
    const container = document.createElement("div");
    render(template, container);
    // Collapse whitespace so we can match without worrying about &nbsp;
    // and template formatting noise.
    return (container.textContent ?? "").replace(/\s+/g, " ").trim();
}

describe("formatMinutesHumanReadable", () => {
    it("renders nothing for 0 minutes", () => {
        expect(renderToText(formatMinutesHumanReadable(0))).toBe("");
    });

    it("renders '45 minutes' for 45 minutes", () => {
        expect(renderToText(formatMinutesHumanReadable(45))).toBe("45 minutes");
    });

    it("renders '1 minute' (singular) for 1 minute", () => {
        expect(renderToText(formatMinutesHumanReadable(1))).toBe("1 minute");
    });

    it("renders '1 hour' (singular) for 60 minutes", () => {
        expect(renderToText(formatMinutesHumanReadable(60))).toBe("1 hour");
    });

    it("joins hour and minute parts with a comma for 90 minutes", () => {
        expect(renderToText(formatMinutesHumanReadable(90))).toBe("1 hour, 30 minutes");
    });

    it("renders '8 hours' for 480 minutes", () => {
        expect(renderToText(formatMinutesHumanReadable(480))).toBe("8 hours");
    });

    it("renders '8 hours, 20 minutes' for 500 minutes", () => {
        expect(renderToText(formatMinutesHumanReadable(500))).toBe("8 hours, 20 minutes");
    });

    it("renders '1 day' on the exact day boundary (1440 minutes)", () => {
        expect(renderToText(formatMinutesHumanReadable(1440))).toBe("1 day");
    });

    it("renders '1 day, 1 hour, 1 minute' for 1501 minutes", () => {
        expect(renderToText(formatMinutesHumanReadable(1501))).toBe("1 day, 1 hour, 1 minute");
    });
});
