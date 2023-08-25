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
        requestHandler
            .get("settings")
            .then((response) => response.json())
            .then((settings) => {
                this.settings = settings.map((setting: any) => {
                    try {
                        return {
                            ...setting,
                            plugin_value: JSON.parse(setting.plugin_value.toString()),
                        };
                    } catch {
                        return setting;
                    }
                });
                this.hasLoaded = true;
            });
    }

    async fetchUpdate() {
        const response = await requestHandler.get("settings");
        this.settings = await response.json();
        const isEmptyOrNoResults = this.settings.length === 0;
        this.isEmpty = isEmptyOrNoResults;
        // this.hasNoResults = isEmptyOrNoResults;
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
