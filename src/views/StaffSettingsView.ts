import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { requestHandler } from "../lib/RequestHandler";
import { __ } from "../lib/translate";
import { skeletonStyles } from "../styles/skeleton";
import { tailwindStyles } from "../tailwind.lit";
import { Column } from "../types/common";

@customElement("lms-staff-settings-view")
export default class StaffSettingsView extends LitElement {
    @state() hasLoaded = false;

    private isEmpty = false;

    private settings: Column[] = [];

    static override styles = [tailwindStyles, skeletonStyles];

    override connectedCallback() {
        super.connectedCallback();
        this.fetchUpdate().finally(() => {
            this.hasLoaded = true;
        });
    }

    async fetchUpdate() {
        const response = await requestHandler.get("settings");
        const settings = await response.json();
        this.settings = settings.map((setting: any) => {
            try {
                return {
                    ...setting,
                    plugin_value: JSON.parse(setting.plugin_value?.toString()),
                };
            } catch {
                return setting;
            }
        });
        this.isEmpty = this.settings.length === 0;
        this.requestUpdate();
    }

    override render() {
        if (!this.hasLoaded) {
            return html` <div class="mx-8">
                <div class="skeleton skeleton-table"></div>
            </div>`;
        }

        if (this.hasLoaded && this.isEmpty) {
            return html`<h1 class="text-center">${__("No settings found")}!</h1>`;
        }

        return html`<lms-settings-table @updated=${this.fetchUpdate} .settings=${this.settings}></lms-settings-table>`;
    }
}
