import { html, nothing, TemplateResult } from "lit";
import { __ } from "../translate";

export function formatMinutesHumanReadable(minutes: number): TemplateResult[] {
    const days = Math.floor(minutes / (60 * 24));
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    const remainingMinutes = minutes % 60;

    const formattedParts = [];
    if (days > 0) {
        formattedParts.push(html`${days} ${days === 1 ? __("day") : __("days")}${hours ? html`&nbsp;` : nothing}`);
    }
    if (hours > 0) {
        formattedParts.push(
            html`${hours} ${hours === 1 ? __("hour") : __("hours")}${remainingMinutes ? html`&nbsp;` : nothing}`,
        );
    }
    if (remainingMinutes > 0) {
        formattedParts.push(html`${remainingMinutes} ${__("minutes")}`);
    }

    return formattedParts;
}
