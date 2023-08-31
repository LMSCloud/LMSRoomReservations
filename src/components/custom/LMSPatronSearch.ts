import { LitElement, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { map } from "lit/directives/map.js";
import { styleMap } from "lit/directives/style-map.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { until } from "lit/directives/until.js";
import { debounce } from "../../lib/utilities";
import { tailwindStyles } from "../../tailwind.lit";

@customElement("lms-patron-search")
export default class LMSPatronSearch extends LitElement {
    @property({ type: String }) name: string | undefined;

    @property({ type: String }) description: string | undefined;

    @property({ type: String }) placeholder: string | undefined;

    @property({ type: String }) required: string | undefined;

    @property({ type: Number, reflect: true }) value: number | undefined;

    @state() patrons: any[] = [];

    @state() selectedItemIndex: number | undefined;

    @query("input") input!: HTMLInputElement;

    @query("ul") listBox!: HTMLUListElement;

    private fields: string[] = ["surname", "firstname", "cardnumber", "borrowernumber"];

    private path: string = "/api/v1/patrons";

    private boundDebouncedPatronSearch = debounce(this.searchPatrons.bind(this), 250, false);

    static override styles = [tailwindStyles];

    private handleInput(e: InputEvent) {
        const target = e.target as HTMLInputElement;
        const term = target.value;
        this.boundDebouncedPatronSearch(term);
    }

    private async searchPatrons(term: string) {
        if (!term) {
            this.patrons = [];
            return;
        }

        const url = new URL(this.path, window.location.origin);

        const queryParams = this.fields.map((field) => `{"${field}":{"-like":"${term}%"}}`).join(",");
        const query = `[${queryParams}]`;

        const params = new URLSearchParams();
        params.append("q", query);

        url.search = params.toString();

        const response = await fetch(url);
        const patrons = await response.json();

        this.patrons = patrons;
    }

    private handleItemClick(e: Event) {
        const target = e.target as HTMLLIElement;
        const { borrowernumber } = target.dataset;
        if (!borrowernumber) {
            return;
        }

        this.input.value = borrowernumber;
        this.value = parseInt(borrowernumber, 10);
        this.dispatchEvent(
            new CustomEvent("change", {
                detail: {
                    name: this.name,
                    value: this.value,
                },
                bubbles: true,
                composed: true,
            }),
        );
        this.patrons = [];
    }

    private handleItemKeydown(e: KeyboardEvent) {
        let blur = true;
        let target: HTMLLIElement | Element | null = e.target as HTMLLIElement;

        const hasModifierShift = e.shiftKey;
        switch (e.key) {
            case "Enter": {
                break;
            }
            case " ": {
                e.preventDefault();
                blur = false;
                break;
            }
            case "ArrowUp": {
                if (!this.selectedItemIndex) {
                    this.selectedItemIndex = 0;
                }

                const newSelectedItemIndex = this.selectedItemIndex - 1;
                if (newSelectedItemIndex < 0) {
                    target = this.listBox.lastElementChild;
                    (target as HTMLLIElement).focus();
                    this.selectedItemIndex = this.patrons?.length - 1;

                    return;
                }

                target = target.previousElementSibling;
                if (!target) {
                    return;
                }

                (target as HTMLLIElement).focus();
                this.selectedItemIndex = newSelectedItemIndex;

                return;
            }
            case "ArrowDown": {
                if (!this.selectedItemIndex) {
                    this.selectedItemIndex = 0;
                }

                const newSelectedItemIndex = this.selectedItemIndex + 1;
                if (newSelectedItemIndex > this.patrons?.length - 1) {
                    target = this.listBox.firstElementChild;
                    (target as HTMLLIElement).focus();
                    this.selectedItemIndex = 0;

                    return;
                }

                target = target.nextElementSibling;
                if (!target) {
                    return;
                }

                (target as HTMLLIElement).focus();
                this.selectedItemIndex = newSelectedItemIndex;

                return;
            }
            case "Tab": {
                e.preventDefault();
                if (!this.selectedItemIndex) {
                    this.selectedItemIndex = 0;
                }

                if (hasModifierShift) {
                    const newSelectedItemIndex = this.selectedItemIndex - 1;
                    if (newSelectedItemIndex < 0) {
                        target.dispatchEvent(new Event("blur", { bubbles: true }));
                    }

                    target = target.previousElementSibling;
                    if (!target) {
                        return;
                    }

                    (target as HTMLLIElement).focus();
                    this.selectedItemIndex = newSelectedItemIndex;

                    return;
                } else {
                    const newSelectedItemIndex = this.selectedItemIndex + 1;
                    if (newSelectedItemIndex > this.patrons?.length - 1) {
                        target.dispatchEvent(new Event("blur", { bubbles: true }));
                    }

                    target = target.nextElementSibling;
                    if (!target) {
                        return;
                    }

                    (target as HTMLLIElement).focus();
                    this.selectedItemIndex = newSelectedItemIndex;

                    return;
                }
            }
            default: {
                return;
            }
        }

        const { borrowernumber } = (target as HTMLLIElement).dataset;
        if (!borrowernumber) {
            return;
        }

        this.input.value = borrowernumber;
        this.value = parseInt(borrowernumber, 10);
        this.dispatchEvent(
            new CustomEvent("change", {
                detail: {
                    name: this.name,
                    value: this.value,
                },
                bubbles: true,
                composed: true,
            }),
        );
        if (blur) {
            this.patrons = [];
            this.selectedItemIndex = undefined;
        }
    }

    private handleInputBlur(e: FocusEvent) {
        const relatedTarget = e.relatedTarget as HTMLElement;
        const parentContainer = relatedTarget?.closest("div") as HTMLDivElement;

        // Check if the related target is within the parent container
        if (!relatedTarget || !parentContainer?.contains(relatedTarget)) {
            this.patrons = []; // Clear the dropdown list if blur is not caused by clicking within the same parent
        }
    }

    private handleListBlur() {
        this.patrons = [];
        this.selectedItemIndex = undefined;
    }

    private formatEntry(obj: Record<string, string>) {
        return Array.from(Object.entries(obj))
            .reduce((acc: string[], entry) => {
                const [key, value] = entry;
                switch (key) {
                    case "surname": {
                        acc.push(`${value},`);
                        return acc;
                    }
                    case "firstname": {
                        acc.push(value);
                        return acc;
                    }
                    case "cardnumber": {
                        acc.push(`${__("Cardno")}: ${value}`);
                        return acc;
                    }
                    case "patron_id": {
                        acc.push(`${__("Id")}: ${value}`);
                        return acc;
                    }
                    default: {
                        acc.push(value);
                        return acc;
                    }
                }
            }, [])
            .map((entry) => html`${unsafeHTML(entry)}&nbsp;`);
    }

    private highlightEntries(obj: Record<string, string>) {
        return Array.from(Object.entries(obj)).reduce((acc: Record<string, string>, entry) => {
            const [key, value] = entry;
            if (!this.input.value) {
                acc[key] = value;
                return acc;
            }

            const escapedTerm = this.input.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(escapedTerm, "gi");

            acc[key] =
                value?.toString().replace(regex, (match) => {
                    return `<span class="bg-yellow-200">${match}</span>`;
                }) ?? value;
            return acc;
        }, {});
    }

    override render() {
        return html`
            <div class="form-control relative w-full">
                <label class="label">
                    <span class="label-text">${this.description}</span>
                </label>
                <input
                    class="input input-bordered w-full"
                    type="text"
                    name=${this.name}
                    placeholder=${this.placeholder}
                    ?required=${this.required}
                    value=${this.value}
                    @input=${this.handleInput}
                    @blur=${this.handleInputBlur}
                    autocomplete="off"
                    aria-autocomplete="list"
                    aria-owns="patron-list"
                    aria-haspopup="listbox"
                    aria-controls="patron-list"
                    role="combobox"
                />
                <ul
                    class="dropdown-list ${classMap({
                        hidden: !this.patrons.length,
                    })} pointer-events-auto absolute z-10 mt-1 w-full border border-gray-300 bg-white"
                    style=${styleMap({
                        top: "calc(100% + 0.25rem)",
                    })}
                    aria-labelledby="patron-search"
                    role="listbox"
                    @blur=${this.handleListBlur}
                >
                    ${map(this.patrons, (patron, index) => {
                        const { surname, firstname, cardnumber, patron_id } = patron;
                        const isSelected = index === this.selectedItemIndex;
                        const posInSet = index + 1;

                        const reducedPatron = { surname, firstname, cardnumber, patron_id };
                        return html`
                            <li
                                class="${classMap({
                                    "bg-gray-100": isSelected,
                                })} cursor-pointer px-3 py-1 hover:bg-gray-100"
                                data-borrowernumber=${patron_id}
                                @click=${this.handleItemClick}
                                @keydown=${this.handleItemKeydown}
                                tabindex="0"
                                role="option"
                                aria-selected=${isSelected}
                                aria-setsize=${this.patrons.length}
                                aria-posinset=${posInSet}
                            >
                                ${until(
                                    this.formatEntry(this.highlightEntries(reducedPatron)),
                                    this.formatEntry(reducedPatron),
                                )}
                            </li>
                        `;
                    })}
                </ul>
            </div>
        `;
    }
}
