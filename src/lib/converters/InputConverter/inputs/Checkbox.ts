import { html } from "lit";
import { BaseInput } from "./BaseInput";

export default class Checkbox extends BaseInput {
    public render() {
        return html`<input
            class="checkbox"
            type="checkbox"
            name=${this.name}
            ?checked=${Boolean(this.value)}
            ?disabled=${this.disabled}
        />`;
    }
}
