import { customElement, property } from "lit/decorators.js";
import LMSTable from "../components/LMSTable";
import { requestHandler } from "../lib/RequestHandler";
import { Input } from "../types/common";

@customElement("lms-settings-table")
export default class LMSSettingsTable extends LMSTable {
    @property({ type: Array }) settings: any[] = [];

    constructor() {
        super();
        this.order = ["setting", "value", "description"];
        this.isEditable = true;
        this.isDeletable = false;
        this.hasControls = false;
    }

    override connectedCallback() {
        super.connectedCallback();
        this.hydrate();
    }

    override async handleSave(e: Event) {
        const target = e.target as HTMLElement;

        let parent = target.parentElement;
        while (parent && parent.tagName !== "TR") {
            parent = parent.parentElement;
        }

        let key,
            inputs = undefined;
        if (parent) {
            key = parent.firstElementChild?.textContent?.trim();
            inputs = parent.querySelectorAll("input");
        }

        if (!key || !inputs) {
            return;
        }

        let response = undefined;
        let patronCategoryCodes = undefined;
        switch (key) {
            case "patron_categories": {
                patronCategoryCodes = Array.from(inputs)
                    .filter((input) => input.checked)
                    .map((input) => input.name);

                response = await requestHandler.post("settings", [
                    ...patronCategoryCodes.map((patronCategoryCode) => ({
                        setting: `rcat_${patronCategoryCode}`,
                        value: patronCategoryCode,
                    })),
                ]);
                break;
            }
            case "restricted_patron_categories": {
                patronCategoryCodes = Array.from(inputs)
                    .filter((input) => input.checked)
                    .map((input) => input.name);

                const deletePromises = patronCategoryCodes.map((patronCategoryCode) =>
                    requestHandler.delete("settings", undefined, [`rcat_${patronCategoryCode}`]),
                );

                const responses = await Promise.all(deletePromises);
                response = {
                    ok: responses.every((response) => response.ok),
                    statusText: responses.map((response) => response.statusText).join(" "),
                    json: () => responses.map((response) => response.json()).join(" "),
                };
                break;
            }
            default: {
                response = await requestHandler.put(
                    "settings",
                    {
                        ...Array.from(inputs).reduce((acc: { [key: string]: string }, input: Input) => {
                            // For checkboxes, use checked state instead of value
                            if (input.type === "checkbox") {
                                acc[input.name] = input.checked ? "1" : "0";
                            } else {
                                acc[input.name] = input.value;
                            }
                            return acc;
                        }, {}),
                    },
                    undefined,
                    [key],
                );
            }
        }

        if (response.ok) {
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
        } else {
            const error = await response.json();
            this.renderToast(response.statusText, error);
        }
    }

    private hydrate() {
        this.data = this.settings
            .filter(
                ({ plugin_key }) =>
                    ![
                        "__ENABLED__",
                        "__INSTALLED__",
                        "__INSTALLED_VERSION__",
                        "last_upgraded",
                        "__CURRENT_MIGRATION__",
                    ].includes(plugin_key),
            )
            .map((setting) => {
                const { setting: name, value } = setting;
                return {
                    ...setting,
                    value: [name, value],
                };
            })
            .map((setting) => Object.fromEntries(this.getColumnData(setting, [["value", this.settings]])));
    }

    override updated(changedProperties: Map<string, never>) {
        super.updated(changedProperties);
        if (changedProperties.has("settings")) {
            this.hydrate();
        }
    }
}
