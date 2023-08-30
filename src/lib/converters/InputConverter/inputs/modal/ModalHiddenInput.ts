import { html } from "lit";
import { InputTypeValue, ModalField } from "../../../../../types/common";

export default class ModalHiddenInput {
    private name: string;

    private value: InputTypeValue | undefined;

    constructor(value: ModalField) {
        this.name = value.name;
        this.value = value.value;
    }

    public render() {
        return html` <input type="hidden" name=${this.name} value=${this.value} />`;
    }
}
