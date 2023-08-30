import { customElement, property } from "lit/decorators.js";
import LMSTable from "../components/LMSTable";
import { requestHandler } from "../lib/RequestHandler";
import { Input } from "../types/common";

@customElement("lms-open-hours-table")
export default class LMSOpenHoursTable extends LMSTable {
    @property({ type: Object }) branch: any = {};

    @property({ type: Array }) libraries: any[] = [];

    @property({ type: Array }) openHours: any[] = [];

    override async handleSave(e: Event) {
        const target = e.target as HTMLElement;

        let parent = target.parentElement;
        while (parent && parent.tagName !== "TR") {
            parent = parent.parentElement;
        }

        let key,
            inputs = undefined;
        if (parent) {
            const keySpan = parent.firstElementChild?.firstElementChild as HTMLSpanElement;
            key = keySpan?.dataset?.["index"];
            inputs = parent.querySelectorAll("input");
        }

        if (!key || !inputs) {
            return;
        }

        const response = await requestHandler.put(
            "openHours",
            {
                ...Array.from(inputs).reduce((acc: { [key: string]: string }, input: Input) => {
                    acc[input.name] = input.value;
                    return acc;
                }, {}),
            },
            undefined,
            [this.branch["id"], key.toString()],
        );
        if (response.status >= 200 && response.status <= 299) {
            inputs.forEach((input) => {
                input.disabled = true;
            });
            this.toggleEdit(
                new CustomEvent("click", {
                    detail: target.closest("td")?.querySelector(".btn-edit"),
                }),
            );
            this.dispatchEvent(new CustomEvent("updated", { detail: key }));
            return;
        }

        if (response.status >= 400) {
            const error = await response.json();
            this.renderToast(response.statusText, error);
        }
    }

    constructor() {
        super();
        this.order = ["day", "start", "end"];
        this.isEditable = true;
        this.isDeletable = false;
        this.hasControls = false;
    }

    override connectedCallback() {
        super.connectedCallback();
        this.hydrate();
    }

    private hydrate() {
        this.data = this.openHours.map((openHours) => {
            return Object.fromEntries(this.getColumnData(openHours));
        });
    }

    override updated(changedProperties: Map<string, never>) {
        super.updated(changedProperties);
        if (changedProperties.has("openHours")) {
            this.hydrate();
        }
    }
}
