import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { repeat } from "lit/directives/repeat.js";
import { requestHandler } from "../lib/RequestHandler";
import { __ } from "../lib/translate";
import { tailwindStyles } from "../tailwind.lit";

type Setting = {
    setting: string;
    value: unknown;
    description?: string;
    type?: "text" | "number" | "email" | "checkbox" | "array" | string;
    placeholder?: string;
};

type PatronCategory = {
    categorycode: string;
    description?: string;
};

type ToastState = {
    heading: unknown;
    message: unknown;
};

type SettingSection = {
    id: string;
    title: unknown;
    description: unknown;
    settings: Setting[];
};

@customElement("lms-settings-table")
export default class LMSSettingsTable extends LitElement {
    @property({ type: Array }) settings: Setting[] = [];

    @state() private savingBySetting: Record<string, boolean> = {};

    @state() private activeSectionId = "";

    @state() private toast: ToastState = { heading: "", message: "" };

    private sectionObserver: IntersectionObserver | null = null;

    static override styles = [
        tailwindStyles,
        css`
            .settings-shell {
                width: 100%;
                padding: 1rem;
            }

            .settings-layout {
                display: grid;
                gap: 1.25rem;
            }

            .settings-sidebar {
                display: none;
            }

            .settings-sections {
                display: grid;
                gap: 1.25rem;
            }

            .settings-section {
                scroll-margin-top: 1rem;
                border-radius: 1rem;
                border: 1px solid rgb(226 232 240);
                background: rgb(255 255 255);
                padding: 1rem;
                overflow: hidden;
            }

            .settings-section__header {
                padding: 1rem;
                margin: -1rem -1rem 0;
                border-bottom: 1px solid rgb(226 232 240);
                background: rgb(248 250 252);
                border-radius: 1rem 1rem 0 0;
            }

            .settings-section__title {
                font-size: 1.1rem;
                font-weight: 700;
                line-height: 1.2;
            }

            .settings-section__description {
                margin-top: 0.25rem;
                font-size: 0.85rem;
                color: rgb(100 116 139);
            }

            .settings-rows {
                display: grid;
                margin: 0 -1rem -1rem;
            }

            .settings-rows > * {
                padding: 0 1rem;
                border-bottom: 1px solid rgb(241 245 249);
            }

            .settings-rows > :last-child {
                border-bottom: none;
            }

            @media (min-width: 1100px) {
                .settings-shell {
                    padding: 1rem 1.5rem 2rem;
                }

                .settings-layout {
                    grid-template-columns: 25rem minmax(0, 1fr);
                    align-items: start;
                }

                .settings-sidebar {
                    display: block;
                    position: sticky;
                    top: 1rem;
                    max-height: calc(100vh - 2rem);
                    overflow: auto;
                    border-radius: 1rem;
                    border: 1px solid rgb(226 232 240);
                    background: linear-gradient(180deg, rgb(255 255 255) 0%, rgb(248 250 252) 100%);
                    padding: 0.75rem;
                    box-shadow: 0 8px 24px -18px rgb(15 23 42 / 0.45);
                }
            }

            @media (max-width: 640px) {
                .settings-shell {
                    padding: 0.75rem;
                }
            }
        `,
    ];

    override updated(changedProperties: Map<string, unknown>) {
        if (changedProperties.has("settings")) {
            this.initSectionObserver();
        }
    }

    override disconnectedCallback() {
        super.disconnectedCallback();
        this.sectionObserver?.disconnect();
        this.sectionObserver = null;
    }

    private get visibleSettings() {
        const ignored = new Set(["patron_categories"]);
        return this.settings.filter((setting) => !ignored.has(setting.setting));
    }

    private getSectionIdForSetting(settingName: string) {
        if (["default_max_booking_time", "absolute_reservation_limit", "daily_reservation_limit"].includes(settingName)) {
            return "limits";
        }

        if (["restricted_patron_categories", "restrict_message"].includes(settingName)) {
            return "access";
        }

        if (["reply_to_address", "enforce_email_notification"].includes(settingName)) {
            return "notifications";
        }

        if (["remove_past_reservations_after"].includes(settingName)) {
            return "maintenance";
        }

        if (["use_koha_calendar"].includes(settingName)) {
            return "integrations";
        }

        return "general";
    }

    private get sections(): SettingSection[] {
        const sectionDefs = [
            {
                id: "general",
                title: __("General"),
                description: __("Global defaults for room reservations."),
            },
            {
                id: "limits",
                title: __("Reservation Limits"),
                description: __("Control how long and how often patrons can reserve."),
            },
            {
                id: "access",
                title: __("Access Rules"),
                description: __("Manage who is allowed to make reservations."),
            },
            {
                id: "notifications",
                title: __("Notifications"),
                description: __("Configure email and confirmation behavior."),
            },
            {
                id: "maintenance",
                title: __("Retention"),
                description: __("Define cleanup behavior for historical reservations."),
            },
            {
                id: "integrations",
                title: __("Integrations"),
                description: __("Enable optional integrations with Koha features."),
            },
        ];

        const settingsBySection = this.visibleSettings.reduce<Record<string, Setting[]>>((acc, setting) => {
            const sectionId = this.getSectionIdForSetting(setting.setting);
            acc[sectionId] = [...(acc[sectionId] ?? []), setting];
            return acc;
        }, {});

        return sectionDefs.map((section) => ({
            ...section,
            settings: settingsBySection[section.id] ?? [],
        }));
    }

    private scrollToSection(sectionId: string) {
        const section = this.renderRoot.querySelector<HTMLElement>(`#section-${sectionId}`);
        if (!section) {
            return;
        }

        section.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    private initSectionObserver() {
        this.sectionObserver?.disconnect();
        this.sectionObserver = null;

        const sections = this.renderRoot.querySelectorAll<HTMLElement>(".settings-section[id]");
        if (!sections.length) {
            this.activeSectionId = "";
            return;
        }

        const firstSection = sections.item(0);
        this.activeSectionId = firstSection ? firstSection.id.replace("section-", "") : "";

        this.sectionObserver = new IntersectionObserver(
            (entries) => {
                const visibleSections = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

                const current = visibleSections[0];
                if (!current || !(current.target instanceof HTMLElement)) {
                    return;
                }

                const sectionId = current.target.id.replace("section-", "");
                if (!sectionId) {
                    return;
                }

                this.activeSectionId = sectionId;
            },
            {
                root: null,
                threshold: [0.2, 0.5, 0.8],
                rootMargin: "-15% 0px -60% 0px",
            },
        );

        sections.forEach((section) => this.sectionObserver?.observe(section));
    }

    private getSetting(key: string) {
        return this.settings.find((setting) => setting.setting === key);
    }

    private toBool(value: unknown) {
        return value === true || value === 1 || value === "1";
    }

    private getPatronCategories(value: unknown): PatronCategory[] {
        if (!Array.isArray(value)) {
            return [];
        }

        return value
            .filter((item): item is PatronCategory => Boolean(item) && typeof item === "object" && "categorycode" in item)
            .map((item) => ({
                categorycode: String(item.categorycode),
                description: typeof item.description === "string" ? item.description : "",
            }));
    }

    private getAllPatronCategories() {
        const restricted = this.getPatronCategories(this.getSetting("restricted_patron_categories")?.value);
        const available = this.getPatronCategories(this.getSetting("patron_categories")?.value);
        const byCode = new Map<string, PatronCategory>();

        [...restricted, ...available].forEach((category) => {
            byCode.set(category.categorycode, category);
        });

        return Array.from(byCode.values()).sort((a, b) => a.categorycode.localeCompare(b.categorycode));
    }

    private setSaving(settingKey: string, isSaving: boolean) {
        this.savingBySetting = {
            ...this.savingBySetting,
            [settingKey]: isSaving,
        };
    }

    private renderToast(statusText: string, error: unknown) {
        this.toast = {
            heading: statusText || __("Error"),
            message: JSON.stringify(error),
        };

        window.setTimeout(() => {
            this.toast = { heading: "", message: "" };
        }, 4000);
    }

    private dispatchUpdated(setting: string) {
        this.dispatchEvent(new CustomEvent("updated", { detail: setting }));
    }

    private async handleSettingSave(e: CustomEvent) {
        const { key, value } = e.detail;

        this.setSaving(key, true);

        const response = await requestHandler.put("settings", { value }, undefined, [key]);

        this.setSaving(key, false);

        if (!response.ok) {
            this.renderToast(response.statusText, await response.json());
            return;
        }

        this.dispatchUpdated(key);
    }

    private async handleChecklistSave(e: CustomEvent) {
        const { key, added, removed } = e.detail as { key: string; added: string[]; removed: string[] };

        this.setSaving(key, true);

        const responses = await Promise.all([
            ...added.map((code: string) => requestHandler.post("settings", [{ setting: `rcat_${code}`, value: code }])),
            ...removed.map((code: string) => requestHandler.delete("settings", undefined, [`rcat_${code}`])),
        ]);

        this.setSaving(key, false);

        const failedResponse = responses.find((response) => !response.ok);
        if (failedResponse) {
            this.renderToast(failedResponse.statusText, await failedResponse.json());
            return;
        }

        this.dispatchUpdated(key);
    }

    private renderSettingRow(setting: Setting) {
        const key = setting.setting;
        const isSaving = Boolean(this.savingBySetting[key]);

        if (setting.type === "checkbox") {
            return html`
                <lms-setting-toggle
                    .name=${key}
                    .description=${setting.description ?? ""}
                    .value=${this.toBool(setting.value)}
                    .saving=${isSaving}
                    @setting-save=${this.handleSettingSave}
                ></lms-setting-toggle>
            `;
        }

        if (setting.type === "array" && key === "restricted_patron_categories") {
            const categories = this.getAllPatronCategories();
            const items = categories.map((c) => ({ code: c.categorycode, label: c.description || c.categorycode }));
            const selected = this.getPatronCategories(setting.value).map((c) => c.categorycode);

            return html`
                <lms-setting-checklist
                    .name=${key}
                    .description=${setting.description ?? ""}
                    .items=${items}
                    .selected=${selected}
                    .saving=${isSaving}
                    @setting-save=${this.handleChecklistSave}
                ></lms-setting-checklist>
            `;
        }

        const inputType = setting.type === "email" ? "email" : setting.type === "number" ? "number" : "text";
        return html`
            <lms-setting-text
                .name=${key}
                .description=${setting.description ?? ""}
                .value=${setting.value == null ? "" : String(setting.value)}
                .inputType=${inputType}
                .placeholder=${setting.placeholder ?? ""}
                .saving=${isSaving}
                @setting-save=${this.handleSettingSave}
            ></lms-setting-text>
        `;
    }

    private renderSidebar() {
        const sections = this.sections.filter((section) => section.settings.length > 0);

        return html`
            <aside class="settings-sidebar">
                <nav class="menu w-full gap-1">
                    ${repeat(
                        sections,
                        (section) => section.id,
                        (section) => html`
                            <li>
                                <button
                                    class=${classMap({
                                        btn: true,
                                        "btn-ghost": section.id !== this.activeSectionId,
                                        "btn-active": section.id === this.activeSectionId,
                                        "justify-between": true,
                                    })}
                                    @click=${() => this.scrollToSection(section.id)}
                                >
                                    <span>${section.title}</span>
                                    <span class="badge badge-sm">${section.settings.length}</span>
                                </button>
                            </li>
                        `,
                    )}
                </nav>
            </aside>
        `;
    }

    override render() {
        const sections = this.sections.filter((section) => section.settings.length > 0);

        return html`
            <div class="settings-shell">
                <div class="settings-layout">
                    ${this.renderSidebar()}
                    <div class="settings-sections">
                        ${repeat(
                            sections,
                            (section) => section.id,
                            (section) => html`
                                <section class="settings-section" id=${`section-${section.id}`}>
                                    <header class="settings-section__header">
                                        <h2 class="settings-section__title">${section.title}</h2>
                                        <p class="settings-section__description">${section.description}</p>
                                    </header>
                                    <div class="settings-rows">
                                        ${repeat(
                                            section.settings,
                                            (setting) => setting.setting,
                                            (setting) => this.renderSettingRow(setting),
                                        )}
                                    </div>
                                </section>
                            `,
                        )}
                    </div>
                </div>
            </div>
            ${this.toast.heading && this.toast.message
                ? html`<lms-toast .heading=${this.toast.heading} .message=${this.toast.message}></lms-toast>`
                : null}
        `;
    }
}
