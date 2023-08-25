import { html } from "lit";
import { BaseInput } from "./BaseInput";

export default class TimeInput extends BaseInput {
    public render() {
        return html`<input
            class="input input-bordered w-full"
            type="time"
            name=${this.name}
            value=${this.value}
            ?disabled=${this.disabled}
        />`;
    }
}
