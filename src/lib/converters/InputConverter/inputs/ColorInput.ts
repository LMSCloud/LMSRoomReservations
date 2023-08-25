import { html } from "lit";
import { BaseInput } from "./BaseInput";

export default class ColorInput extends BaseInput {
    public render() {
        return html`<input
            class="w-full"
            type="color"
            name=${this.name}
            value=${this.value}
            ?disabled=${this.disabled}
        />`;
    }
}
