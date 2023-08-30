import { html, TemplateResult } from "lit";
import { ModalField, SelectOption, TranslatedString } from "../../../../../types/common";
import { __ } from "../../../../translate";

export default class ModalChecklist {
    private name: string;

    private desc: string | TranslatedString;

    private data: SelectOption[] | undefined;

    private boundHandleChecklistChange = this.handleChecklistChange.bind(this);

    constructor(value: ModalField, data: SelectOption[]) {
        this.name = value.name;
        this.desc = value.desc;
        this.data = data;
    }

    public render() {
        if (!this.data) {
            return this.renderError();
        }

        if (!this.data.length) {
            return html``;
        }

        return html`
            <div class="divider label-text">${this.desc}</div>
            <div @change=${this.boundHandleChecklistChange}>
                ${this.data.map(
                    (datum: any) => html`
                        <div class="form-control">
                            <label class="label cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="${this.name}_${datum.id}"
                                    name=${datum.id}
                                    class="checkbox"
                                />
                                <span class="label-text">${datum.name}</span>
                            </label>
                        </div>
                    `,
                )}
            </div>
            <div class="divider"></div>
        `;
    }

    private handleChecklistChange(e: Event) {
        const checklistContainer = e.currentTarget as HTMLDivElement;
        if (e.target === checklistContainer) {
            return;
        }

        const listItems = checklistContainer.querySelectorAll("input");
        const value = Array.from(listItems)
            .filter((listItem) => listItem.checked)
            .map((listItem) => listItem.name);

        const changeEvent = new CustomEvent("change", {
            detail: { name: this.name, value },
            bubbles: true,
        });
        checklistContainer.dispatchEvent(changeEvent);
        e.stopPropagation();
    }

    private renderError(): TemplateResult {
        return html`<strong>${__("Error")}!</strong>`;
    }
}
