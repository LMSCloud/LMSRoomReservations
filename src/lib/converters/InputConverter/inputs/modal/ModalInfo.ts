import { html } from "lit";
import { ModalField, TranslatedString } from "../../../../../types/common";

export default class ModalInfo {
    private desc: string | TranslatedString;

    constructor(value: ModalField) {
        this.desc = value.desc;
    }

    public render() {
        return html`<span class="text-sm">${this.desc}</span>`;
    }
}
