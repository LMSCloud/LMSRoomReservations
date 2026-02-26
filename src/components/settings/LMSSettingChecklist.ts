import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { __ } from "../../lib/translate";
import { tailwindStyles } from "../../tailwind.lit";

type ChecklistItem = {
    code: string;
    label: string;
};

@customElement("lms-setting-checklist")
export default class LMSSettingChecklist extends LitElement {
    @property({ type: String }) name = "";
    @property({ type: String }) description = "";
    @property({ type: Array }) items: ChecklistItem[] = [];
    @property({ type: Array }) selected: string[] = [];
    @property({ type: Boolean }) saving = false;

    @state() private draftSelection: Set<string> = new Set();

    static override styles = [
        tailwindStyles,
        css`
            :host {
                display: block;
            }

            .setting-row {
                display: grid;
                gap: 0.5rem;
                padding: 0.6rem 0;
            }

            .setting-row__name {
                font-size: 0.95rem;
                font-weight: 700;
                line-height: 1.3;
            }

            .setting-row__description {
                font-size: 0.8rem;
                color: rgb(100 116 139);
                line-height: 1.3;
                margin-top: 0.1rem;
            }

            .setting-row__control {
                display: grid;
                gap: 0.5rem;
            }

            .setting-row__checklist {
                display: grid;
                gap: 0.25rem;
                max-height: 12rem;
                overflow: auto;
                border-radius: 0.75rem;
                border: 1px solid rgb(209 213 219);
                background: rgb(249 250 251);
                padding: 0.6rem 0.8rem;
            }

            .setting-row__checkitem {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                min-height: 1.75rem;
            }

            .setting-row__actions {
                display: flex;
                gap: 0.5rem;
                justify-content: flex-end;
            }

            @media (min-width: 768px) {
                .setting-row {
                    grid-template-columns: minmax(12rem, 2fr) minmax(0, 3fr);
                    gap: 1rem;
                    align-items: start;
                }
            }
        `,
    ];

    override willUpdate(changedProperties: Map<string, unknown>) {
        if (changedProperties.has("selected")) {
            this.draftSelection = new Set(this.selected);
        }
    }

    private get dirty() {
        const initial = new Set(this.selected);
        if (initial.size !== this.draftSelection.size) return true;
        for (const code of initial) {
            if (!this.draftSelection.has(code)) return true;
        }
        return false;
    }

    private handleToggle(e: Event) {
        const target = e.target as HTMLInputElement;
        const code = target.name;
        if (!code) return;

        const next = new Set(this.draftSelection);
        if (target.checked) {
            next.add(code);
        } else {
            next.delete(code);
        }
        this.draftSelection = next;
    }

    private save() {
        const initial = new Set(this.selected);
        const added = [...this.draftSelection].filter((code) => !initial.has(code));
        const removed = [...initial].filter((code) => !this.draftSelection.has(code));

        this.dispatchEvent(
            new CustomEvent("setting-save", {
                detail: { key: this.name, added, removed },
                bubbles: true,
                composed: true,
            }),
        );
    }

    private abort() {
        this.draftSelection = new Set(this.selected);
    }

    override render() {
        return html`
            <div class="setting-row">
                <div>
                    <div class="setting-row__name">${__(this.name)}</div>
                    ${this.description ? html`<div class="setting-row__description">${this.description}</div>` : null}
                </div>
                <div class="setting-row__control">
                    <div class="setting-row__checklist">
                        ${repeat(
                            this.items,
                            (item) => item.code,
                            (item) => html`
                                <label class="setting-row__checkitem" for=${`checklist_${item.code}`}>
                                    <input
                                        id=${`checklist_${item.code}`}
                                        class="checkbox"
                                        type="checkbox"
                                        name=${item.code}
                                        .checked=${this.draftSelection.has(item.code)}
                                        @change=${this.handleToggle}
                                    />
                                    <span class="text-sm">${item.label}</span>
                                </label>
                            `,
                        )}
                    </div>
                    <div class="setting-row__actions">
                        <button class="btn btn-primary" ?disabled=${this.saving || !this.dirty} @click=${this.save}>
                            ${__("Save")}
                        </button>
                        <button class="btn btn-ghost" ?disabled=${this.saving || !this.dirty} @click=${this.abort}>
                            ${__("Abort")}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}
