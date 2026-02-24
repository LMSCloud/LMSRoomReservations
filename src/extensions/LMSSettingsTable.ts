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

    @state() private draftValues: Record<string, string | boolean> = {};

    @state() private restrictedCategorySelection: string[] = [];

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

            .setting-card {
                border-radius: 0.9rem;
                border: 1px solid rgb(226 232 240);
                background: rgb(255 255 255);
                box-shadow: 0 6px 20px -20px rgb(15 23 42 / 0.65);
            }

            .setting-card__inner {
                padding: 0.95rem 1rem;
                display: grid;
                gap: 0.65rem;
            }

            .setting-card__header {
                display: grid;
                gap: 0.15rem;
            }

            .setting-card__name {
                font-size: 0.95rem;
                font-weight: 700;
                line-height: 1.2;
            }

            .setting-card__description {
                font-size: 0.85rem;
                color: rgb(71 85 105);
                line-height: 1.3;
            }

            .setting-card__actions {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }

            .setting-card__checkbox {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
            }

            .setting-card__checklist {
                display: grid;
                gap: 0.4rem;
                max-height: 16rem;
                overflow: auto;
                border-radius: 0.75rem;
                border: 1px solid rgb(226 232 240);
                background: rgb(255 255 255);
                padding: 0.6rem 0.8rem;
            }

            .setting-card__checkitem {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                min-height: 2rem;
            }

            .settings-sidebar {
                display: none;
            }

            .settings-sections {
                display: grid;
                gap: 1.25rem;
            }

            .settings-section {
                border-radius: 1rem;
                border: 1px solid rgb(226 232 240);
                background: rgb(248 250 252 / 0.45);
                padding: 1rem;
            }

            .settings-section__header {
                margin-bottom: 0.9rem;
            }

            .settings-section__title {
                font-size: 1.1rem;
                font-weight: 700;
                line-height: 1.2;
            }

            .settings-section__description {
                margin-top: 0.25rem;
                font-size: 0.85rem;
                color: rgb(71 85 105);
            }

            .settings-section__grid {
                display: grid;
                gap: 1rem;
            }

            @media (min-width: 1100px) {
                .settings-shell {
                    padding: 1rem 1.5rem 2rem;
                }

                .settings-layout {
                    grid-template-columns: 17rem minmax(0, 1fr);
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

    override willUpdate(changedProperties: Map<string, unknown>) {
        if (!changedProperties.has("settings")) {
            return;
        }

        this.draftValues = this.settings.reduce<Record<string, string | boolean>>((acc, setting) => {
            if (setting.type === "checkbox") {
                acc[setting.setting] = this.toBool(setting.value);
                return acc;
            }

            if (setting.type === "array") {
                return acc;
            }

            acc[setting.setting] = setting.value == null ? "" : String(setting.value);
            return acc;
        }, {});

        const restricted = this.getSetting("restricted_patron_categories");
        this.restrictedCategorySelection = this.getPatronCategories(restricted?.value).map((category) => category.categorycode);
    }

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

    private handleTextLikeInput(setting: Setting, e: Event) {
        const target = e.target as HTMLInputElement;
        this.draftValues = {
            ...this.draftValues,
            [setting.setting]: target.value,
        };
    }

    private handleCheckboxInput(setting: Setting, e: Event) {
        const target = e.target as HTMLInputElement;
        this.draftValues = {
            ...this.draftValues,
            [setting.setting]: target.checked,
        };
    }

    private resetDraft(setting: Setting) {
        const value = setting.type === "checkbox" ? this.toBool(setting.value) : String(setting.value ?? "");
        this.draftValues = {
            ...this.draftValues,
            [setting.setting]: value,
        };
    }

    private hasDraftChanged(setting: Setting) {
        const draft = this.draftValues[setting.setting];

        if (setting.type === "checkbox") {
            return Boolean(draft) !== this.toBool(setting.value);
        }

        return String(draft ?? "") !== String(setting.value ?? "");
    }

    private async saveSetting(setting: Setting) {
        if (setting.type === "array" && setting.setting === "restricted_patron_categories") {
            await this.saveRestrictedPatronCategories();
            return;
        }

        const key = setting.setting;
        const draft = this.draftValues[key];

        this.setSaving(key, true);

        const value = setting.type === "checkbox" ? (Boolean(draft) ? "1" : "0") : String(draft ?? "");
        const response = await requestHandler.put("settings", { value }, undefined, [key]);

        this.setSaving(key, false);

        if (!response.ok) {
            this.renderToast(response.statusText, await response.json());
            return;
        }

        this.dispatchUpdated(key);
    }

    private handleRestrictedPatronCategoryToggle(e: Event) {
        const target = e.target as HTMLInputElement;
        const code = target.name;

        if (!code) {
            return;
        }

        const selected = new Set(this.restrictedCategorySelection);
        if (target.checked) {
            selected.add(code);
        } else {
            selected.delete(code);
        }

        this.restrictedCategorySelection = Array.from(selected);
    }

    private resetRestrictedPatronCategories() {
        const restricted = this.getPatronCategories(this.getSetting("restricted_patron_categories")?.value);
        this.restrictedCategorySelection = restricted.map((category) => category.categorycode);
    }

    private hasRestrictedPatronCategoriesChanged() {
        const initial = new Set(this.getPatronCategories(this.getSetting("restricted_patron_categories")?.value).map((c) => c.categorycode));
        const current = new Set(this.restrictedCategorySelection);

        if (initial.size !== current.size) {
            return true;
        }

        for (const code of initial) {
            if (!current.has(code)) {
                return true;
            }
        }

        return false;
    }

    private async saveRestrictedPatronCategories() {
        const key = "restricted_patron_categories";
        this.setSaving(key, true);

        const initial = new Set(this.getPatronCategories(this.getSetting(key)?.value).map((category) => category.categorycode));
        const current = new Set(this.restrictedCategorySelection);

        const toAdd = [...current].filter((code) => !initial.has(code));
        const toRemove = [...initial].filter((code) => !current.has(code));

        const responses = await Promise.all([
            ...toAdd.map((code) => requestHandler.post("settings", [{ setting: `rcat_${code}`, value: code }])),
            ...toRemove.map((code) => requestHandler.delete("settings", undefined, [`rcat_${code}`])),
        ]);

        this.setSaving(key, false);

        const failedResponse = responses.find((response) => !response.ok);
        if (failedResponse) {
            this.renderToast(failedResponse.statusText, await failedResponse.json());
            return;
        }

        this.dispatchUpdated(key);
    }

    private renderSettingInput(setting: Setting) {
        const key = setting.setting;

        if (setting.type === "checkbox") {
            const isEnabled = Boolean(this.draftValues[key]);
            return html`
                <div class="setting-card__checkbox">
                    <span class="text-sm font-medium">${__("Enabled")} - ${isEnabled ? __("On") : __("Off")}</span>
                    <input
                        class="toggle toggle-primary"
                        type="checkbox"
                        name=${key}
                        .checked=${isEnabled}
                        @change=${(e: Event) => this.handleCheckboxInput(setting, e)}
                    />
                </div>
            `;
        }

        if (setting.type === "array" && key === "restricted_patron_categories") {
            const categories = this.getAllPatronCategories();
            const selected = new Set(this.restrictedCategorySelection);

            return html`
                <div class="setting-card__checklist">
                    ${repeat(
                        categories,
                        (category) => category.categorycode,
                        (category) => html`
                            <label class="setting-card__checkitem" for=${`category_${category.categorycode}`}>
                                <input
                                    id=${`category_${category.categorycode}`}
                                    class="checkbox"
                                    type="checkbox"
                                    name=${category.categorycode}
                                    .checked=${selected.has(category.categorycode)}
                                    @change=${this.handleRestrictedPatronCategoryToggle}
                                />
                                <span class="text-sm">${category.description || category.categorycode}</span>
                            </label>
                        `,
                    )}
                </div>
            `;
        }

        return html`
            <input
                class="input input-bordered w-full"
                type=${setting.type === "email" ? "email" : setting.type === "number" ? "text" : "text"}
                inputmode=${setting.type === "number" ? "numeric" : "text"}
                pattern=${setting.type === "number" ? "[0-9]*" : ".*"}
                name=${key}
                placeholder=${setting.placeholder ?? ""}
                .value=${String(this.draftValues[key] ?? "")}
                @input=${(e: Event) => this.handleTextLikeInput(setting, e)}
            />
        `;
    }

    private renderActions(setting: Setting) {
        const key = setting.setting;
        const isSaving = Boolean(this.savingBySetting[key]);

        const hasChanges =
            setting.type === "array" && key === "restricted_patron_categories"
                ? this.hasRestrictedPatronCategoriesChanged()
                : this.hasDraftChanged(setting);

        const handleReset = () => {
            if (setting.type === "array" && key === "restricted_patron_categories") {
                this.resetRestrictedPatronCategories();
                return;
            }

            this.resetDraft(setting);
        };

        return html`
            <div class="setting-card__actions">
                <button class="btn btn-primary btn-sm" ?disabled=${isSaving || !hasChanges} @click=${() => this.saveSetting(setting)}>
                    ${__("Save")}
                </button>
                <button class="btn btn-ghost btn-sm" ?disabled=${isSaving || !hasChanges} @click=${handleReset}>
                    ${__("Abort")}
                </button>
            </div>
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
                                    <div class="settings-section__grid">
                                        ${repeat(
                                            section.settings,
                                            (setting) => setting.setting,
                                            (setting) => html`
                                                <article class="setting-card">
                                                    <div class="setting-card__inner">
                                                        <header class="setting-card__header">
                                                            <h3 class="setting-card__name">${__(setting.setting)}</h3>
                                                            ${setting.description
                                                                ? html`<p class="setting-card__description">${setting.description}</p>`
                                                                : null}
                                                        </header>
                                                        ${this.renderSettingInput(setting)} ${this.renderActions(setting)}
                                                    </div>
                                                </article>
                                            `,
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
