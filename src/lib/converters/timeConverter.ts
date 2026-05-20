import { html, TemplateResult } from "lit";
import { __ } from "../translate";

export function formatMinutesHumanReadable(minutes: number): TemplateResult {
    const days = Math.floor(minutes / (60 * 24));
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    const remainingMinutes = minutes % 60;

    const parts: TemplateResult[] = [];
    if (days > 0) {
        parts.push(html`${days} ${days === 1 ? __("day") : __("days")}`);
    }
    if (hours > 0) {
        parts.push(html`${hours} ${hours === 1 ? __("hour") : __("hours")}`);
    }
    if (remainingMinutes > 0) {
        parts.push(html`${remainingMinutes} ${remainingMinutes === 1 ? __("minute") : __("minutes")}`);
    }

    return html`${parts.map((part, i) => (i === 0 ? part : html`, ${part}`))}`;
}
