import { LitElement } from "lit";
import { InputElement } from "../types/common";

export class InputsSnapshot {
    private inputs?: InputElement[];

    private values?: { value: string; checked?: boolean; selectedIndex?: number }[];

    constructor(elements: NodeListOf<Element>) {
        this.snapshot(elements);
    }

    private filterForInputs(elements: NodeListOf<Element>): InputElement[] {
        return Array.from(elements).filter(
            (element) =>
                element instanceof HTMLInputElement ||
                element instanceof HTMLSelectElement ||
                element instanceof HTMLTextAreaElement ||
                element instanceof LitElement,
        ) as InputElement[];
    }

    private snapshot(elements: NodeListOf<Element>) {
        this.inputs = this.filterForInputs(elements);
        this.values = this.inputs.map((element) => {
            if (element instanceof HTMLInputElement && element.type === "checkbox") {
                return { value: element.value, checked: element.checked };
            } else if (element instanceof HTMLSelectElement) {
                return { value: element.value, selectedIndex: element.selectedIndex };
            } else if (element instanceof LitElement) {
                return { value: element.getAttribute("value") ?? "" };
            }

            return { value: element.value };
        });
    }

    public getAmountSnapshotted() {
        return this.inputs?.length ?? 0;
    }

    public revert() {
        this.inputs?.forEach((input, index) => {
            const snapshotValue = this.values?.[index];
            if (snapshotValue) {
                if (input instanceof LitElement) {
                    (input as any).value = snapshotValue.value;
                } else {
                    input.value = snapshotValue.value;
                }

                if (input instanceof HTMLInputElement && input.type === "checkbox") {
                    input.checked = !!snapshotValue.checked;
                }

                if (input instanceof HTMLTextAreaElement) {
                    input.innerText = snapshotValue.value;
                }

                if (input instanceof HTMLSelectElement) {
                    if (snapshotValue.selectedIndex !== undefined) {
                        input.selectedIndex = snapshotValue.selectedIndex;
                    }
                }
            }
        });
    }
}
