import { TemplateResult } from "lit";
import { InputTypeValue } from "../../../../types/common";

export abstract class BaseInput {
    protected name: string;

    protected value: InputTypeValue;

    protected disabled: boolean;

    protected placeholder: string | undefined;

    constructor(name: string, value: InputTypeValue, placeholder = undefined) {
        this.name = name;
        this.value = value;
        this.disabled = true;
        this.placeholder = placeholder;
    }

    public abstract render(): TemplateResult;
}
