import { html } from "lit";

export default class Checklist {
    private value: any;

    constructor(value: any) {
        this.value = value;
    }

    public render() {
        return html`
            <div class="flex flex-row overflow-x-scroll">
                ${this.value.map(
                    (datum: any) => html`
                        <div class="form-control">
                            <label class="label cursor-pointer whitespace-nowrap">
                                <input
                                    type="checkbox"
                                    id=${datum.name}
                                    name=${datum.name}
                                    class="checkbox mr-2"
                                    disabled
                                />
                                <span class="label-text">${datum.value}</span>
                            </label>
                        </div>
                    `,
                )}
            </div>
        `;
    }
}
