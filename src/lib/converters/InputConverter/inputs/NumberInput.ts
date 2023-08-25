import { html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { BaseInput } from "./BaseInput";

export default class NumberInput extends BaseInput {
    public render() {
        return html`<input
            class="input input-bordered w-full"
            type="text"
            pattern="[0-9]*"
            inputmode="numeric"
            placeholder=${ifDefined(this.placeholder)}
            name=${this.name}
            value=${this.value}
            ?disabled=${this.disabled}
        />`;
    }
}
