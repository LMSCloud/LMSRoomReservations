import { html } from "lit";
import { normalizeForInput } from "../../datetimeConverters";
import { BaseInput } from "./BaseInput";

export default class DatetimeLocalInput extends BaseInput {
    public render() {
        return html`<input
            class="input input-bordered w-full"
            type="datetime-local"
            name=${this.name}
            value=${normalizeForInput(this.value as string, "datetime-local")}
            ?disabled=${this.disabled}
        />`;
    }
}
