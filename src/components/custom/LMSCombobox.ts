import { LitElement, PropertyValueMap, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { map } from "lit/directives/map.js";
import { __ } from "../../lib/translate";
import { tailwindStyles } from "../../tailwind.lit";

export type LMSComboboxOption = {
    value: string | number;
    label: string;
};

@customElement("lms-combobox")
export default class LMSCombobox extends LitElement {
    @property({ type: Array }) options: LMSComboboxOption[] = [];

    @property({ type: String }) name = "";

    @property({ type: String }) placeholder = "";

    @property({ type: String }) value = "";

    @property({ type: String, attribute: "input-type" }) inputType: "text" | "number" = "text";

    @property({ type: String, attribute: "input-mode" }) override inputMode = "";

    @property({ type: String }) min?: string;

    @property({ type: String }) max?: string;

    @property({ type: String }) step?: string;

    @property({ type: Boolean }) required = false;

    @property({ type: Boolean }) disabled = false;

    @property({ type: String, attribute: "aria-label" }) ariaLabelText = "";

    @state() private isOpen = false;

    @state() private focusedIndex = -1;

    @query("input") private inputEl!: HTMLInputElement;

    @query("ul") private listEl!: HTMLUListElement;

    static override styles = [tailwindStyles];

    private get listboxId() {
        return `lms-combobox-list-${this.name || "x"}`;
    }

    private get filteredOptions(): LMSComboboxOption[] {
        const query = (this.value ?? "").toString().toLowerCase().trim();
        if (!query) {
            return this.options;
        }
        return this.options.filter((option) => String(option.label).toLowerCase().includes(query));
    }

    private optionId(index: number) {
        return `${this.listboxId}-opt-${index}`;
    }

    private openList() {
        if (this.disabled) return;
        this.isOpen = true;
    }

    private closeList() {
        this.isOpen = false;
        this.focusedIndex = -1;
    }

    private handleInput(e: Event) {
        const target = e.target as HTMLInputElement;
        this.value = target.value;
        this.focusedIndex = -1;
        this.openList();
        this.dispatchEvent(
            new CustomEvent("input", {
                detail: { value: this.value },
                bubbles: true,
                composed: true,
            }),
        );
    }

    private handleFocus() {
        this.openList();
    }

    private handleBlur() {
        // Defer so option click registers before close.
        window.setTimeout(() => {
            const active = this.shadowRoot?.activeElement;
            if (!active || !this.contains(active as Node)) {
                this.closeList();
            }
        }, 0);
    }

    private handleKeyDown(e: KeyboardEvent) {
        const items = this.filteredOptions;
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                if (!items.length) {
                    this.openList();
                    return;
                }
                this.openList();
                this.focusedIndex = (this.focusedIndex + 1) % items.length;
                break;
            case "ArrowUp":
                e.preventDefault();
                if (!items.length) {
                    return;
                }
                this.openList();
                this.focusedIndex = (this.focusedIndex - 1 + items.length) % items.length;
                break;
            case "Enter": {
                if (this.isOpen && this.focusedIndex >= 0 && items[this.focusedIndex]) {
                    e.preventDefault();
                    this.selectOption(items[this.focusedIndex]!);
                }
                break;
            }
            case "Escape":
                if (this.isOpen) {
                    e.preventDefault();
                    this.closeList();
                }
                break;
            case "Tab":
                this.closeList();
                break;
            default:
                break;
        }
    }

    private handleOptionClick(e: Event) {
        const target = (e.target as HTMLElement).closest("li[data-index]") as HTMLLIElement | null;
        if (!target) return;
        const index = Number(target.dataset["index"]);
        const items = this.filteredOptions;
        const option = items[index];
        if (!option) return;
        this.selectOption(option);
    }

    private selectOption(option: LMSComboboxOption) {
        this.value = String(option.value);
        this.closeList();
        this.dispatchEvent(
            new CustomEvent("change", {
                detail: { value: this.value, option },
                bubbles: true,
                composed: true,
            }),
        );
        // Refocus input so users can keep typing.
        this.inputEl?.focus();
    }

    public reset() {
        this.value = "";
        this.closeList();
    }

    protected override updated(changedProperties: PropertyValueMap<never> | Map<PropertyKey, unknown>) {
        if (changedProperties.has("focusedIndex") && this.focusedIndex >= 0) {
            const focused = this.listEl?.querySelector<HTMLElement>(`#${this.optionId(this.focusedIndex)}`);
            focused?.scrollIntoView({ block: "nearest" });
        }
    }

    override render() {
        const items = this.filteredOptions;
        const expanded = this.isOpen && (items.length > 0 || !this.value);
        const activeId =
            this.focusedIndex >= 0 && items[this.focusedIndex] ? this.optionId(this.focusedIndex) : undefined;
        return html`
            <div class="relative w-full">
                <input
                    class="input input-bordered w-full"
                    type=${this.inputType}
                    inputmode=${this.inputMode || nothing}
                    name=${this.name}
                    placeholder=${this.placeholder}
                    .value=${this.value}
                    min=${this.min ?? nothing}
                    max=${this.max ?? nothing}
                    step=${this.step ?? nothing}
                    ?required=${this.required}
                    ?disabled=${this.disabled}
                    aria-label=${this.ariaLabelText || nothing}
                    autocomplete="off"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded=${expanded ? "true" : "false"}
                    aria-controls=${this.listboxId}
                    aria-activedescendant=${activeId ?? nothing}
                    @input=${this.handleInput}
                    @focus=${this.handleFocus}
                    @blur=${this.handleBlur}
                    @keydown=${this.handleKeyDown}
                />
                <ul
                    id=${this.listboxId}
                    class="${classMap({
                        hidden: !expanded,
                    })} absolute z-10 mt-1 max-h-60 w-full overflow-y-auto border border-base-300 bg-base-100 shadow-lg"
                    role="listbox"
                    @mousedown=${(e: Event) => e.preventDefault()}
                    @click=${this.handleOptionClick}
                >
                    ${items.length === 0
                        ? html`<li class="px-3 py-1 italic opacity-60" role="option" aria-disabled="true">
                              ${__("No matches")}
                          </li>`
                        : map(items, (option, index) => {
                              const isFocused = index === this.focusedIndex;
                              return html`
                                  <li
                                      id=${this.optionId(index)}
                                      class="${classMap({
                                          "bg-base-200": isFocused,
                                      })} cursor-pointer px-3 py-1 hover:bg-base-200"
                                      role="option"
                                      aria-selected=${isFocused}
                                      data-index=${index}
                                  >
                                      ${option.label}
                                  </li>
                              `;
                          })}
                </ul>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "lms-combobox": LMSCombobox;
    }
}
