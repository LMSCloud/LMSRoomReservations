import { html } from "lit";
import { InputTypeValue, ModalField, TranslatedString } from "../../../../../types/common";

export default class ModalColorInput {
    private name: string;
    private desc: string | TranslatedString;
    private required: boolean | undefined;
    private value: InputTypeValue | undefined;

    constructor(value: ModalField) {
        this.name = value.name;
        this.desc = value.desc;
        this.required = value.required;
        this.value = value.value;
    }

    public render() {
        return html`
            <div class="form-control">
                <label class="label w-full">
                    <span class="label-text">${this.desc}</span>
                </label>
                    <input
                        class="w-full"
                        type="color"
                        name=${this.name}
                        ?required=${this.required}
                        value=${this.value ?? "#ffffff"}
                    />
                </div>
            </div>
        `;
    }
}
