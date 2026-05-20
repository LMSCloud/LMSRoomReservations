import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { t } from "../../lib/translate";
import { debounce } from "../../lib/utilities";
import { tailwindStyles } from "../../tailwind.lit";
import LMSCombobox, { LMSComboboxOption } from "./LMSCombobox";

type Patron = {
    patron_id: number;
    surname?: string;
    firstname?: string;
    middle_name?: string;
    cardnumber?: string;
};

@customElement("lms-patron-search")
export default class LMSPatronSearch extends LitElement {
    @property({ type: String }) name: string | undefined;

    @property({ type: String }) description: string | undefined;

    @property({ type: String }) placeholder: string | undefined;

    @property({ type: String }) required: string | undefined;

    @property({ type: Number, reflect: true }) value: number | undefined;

    @state() private patrons: Patron[] = [];

    private fields: string[] = ["surname", "firstname", "cardnumber", "borrowernumber"];

    private path: string = "/api/v1/patrons";

    private boundDebouncedPatronSearch = debounce(this.searchPatrons.bind(this), 250, false);

    static override styles = [tailwindStyles];

    private async searchPatrons(term: string) {
        if (!term) {
            this.patrons = [];
            return;
        }

        const url = new URL(this.path, window.location.origin);
        const queryParams = this.fields.map((field) => `{"${field}":{"-like":"${term}%"}}`).join(",");
        url.search = new URLSearchParams({
            q: `[${queryParams}]`,
            _per_page: "10",
            _order_by: "+me.surname,+me.firstname",
        }).toString();

        const response = await fetch(url);
        if (!response.ok) {
            this.patrons = [];
            return;
        }
        this.patrons = await response.json();
    }

    private get options(): LMSComboboxOption[] {
        return this.patrons.map((patron) => {
            const primaryName = [
                patron.surname ? `${patron.surname},` : "",
                patron.firstname ?? "",
                patron.middle_name ?? "",
            ]
                .filter(Boolean)
                .join(" ");
            const cardnumber = patron.cardnumber ? ` (${patron.cardnumber})` : "";
            const idLabel = `${t("Id")}: ${patron.patron_id}`;
            return {
                value: patron.patron_id,
                label: html`<span class="font-medium">${primaryName}${cardnumber}</span
                    ><small class="ml-2 text-base-content/70">${idLabel}</small>`,
                searchText: [primaryName, patron.cardnumber ?? "", String(patron.patron_id)].join(" "),
            };
        });
    }

    private handleComboboxInput(e: Event) {
        if (!(e instanceof CustomEvent) || typeof e.detail?.value !== "string") {
            return;
        }
        // Clear stale results immediately so the dropdown doesn't briefly
        // show options from a previous query while the debounce ticks.
        this.patrons = [];
        this.boundDebouncedPatronSearch(e.detail.value);
    }

    private handleComboboxChange(e: Event) {
        e.stopPropagation();
        if (!(e instanceof CustomEvent) || typeof e.detail?.value !== "string") {
            return;
        }
        const borrowernumber = parseInt(e.detail.value, 10);
        if (Number.isNaN(borrowernumber)) {
            return;
        }
        this.value = borrowernumber;
        this.dispatchEvent(
            new CustomEvent("change", {
                detail: { name: this.name, value: borrowernumber },
                bubbles: true,
                composed: true,
            }),
        );
    }

    override render() {
        return html`
            <div class="form-control w-full">
                <label class="label">
                    <span class="label-text">${this.description}</span>
                </label>
                <lms-combobox
                    name=${this.name ?? ""}
                    placeholder=${this.placeholder ?? ""}
                    ?required=${!!this.required}
                    .options=${this.options}
                    @input=${this.handleComboboxInput}
                    @change=${this.handleComboboxChange}
                ></lms-combobox>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "lms-patron-search": LMSPatronSearch;
        "lms-combobox": LMSCombobox;
    }
}
