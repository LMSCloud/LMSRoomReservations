import { faEdit, faSave, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { litFontawesome } from "@weavedev/lit-fontawesome";
import { LitElement, html, nothing } from "lit";
import { customElement, property, query, queryAll, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { requestHandler } from "../../lib/RequestHandler.js";
import ColorInput from "../../lib/converters/InputConverter/inputs/ColorInput.js";
import NumberInput from "../../lib/converters/InputConverter/inputs/NumberInput.js";
import TextInput from "../../lib/converters/InputConverter/inputs/TextInput.js";
import { formatMinutesHumanReadable } from "../../lib/converters/timeConverter.js";
import { __, attr__, t } from "../../lib/translate.js";
import { tailwindStyles } from "../../tailwind.lit.js";
import LMSConfirmationModal from "../LMSConfirmationModal";

@customElement("lms-room")
export default class LMSRoom extends LitElement {
    @property({ type: String }) branch: string = "";

    @property({ type: String }) color: string = "";

    @property({ type: String }) description: string = "";

    @property({ type: Boolean }) editable: boolean = false;

    @property({ type: String }) image: string = "";

    @property({ type: Array }) libraries: any[] = [];

    @property({ type: Array }) openHours: any[] = [];

    @property({ type: String }) maxbookabletime: string = "";

    @property({ type: String }) maxcapacity: string = "";

    @property({ type: String }) roomid: string = "";

    @property({ type: String }) roomnumber: string = "";

    @state() private tab: "data" | "preview" = "data";

    @query("lms-confirmation-modal") confirmationModal!: LMSConfirmationModal;

    @queryAll("input, select") inputs!: NodeListOf<HTMLInputElement | HTMLSelectElement>;

    static override styles = [tailwindStyles];

    private toggleEdit() {
        this.editable = !this.editable;
        if (this.editable) {
            Array.from(this.inputs).forEach((input) => {
                input.disabled = false;
            });
        } else {
            Array.from(this.inputs).forEach((input) => {
                input.disabled = true;
            });
        }
    }

    private async handleSave() {
        const response = await requestHandler.put(
            "rooms",
            {
                maxcapacity: this.maxcapacity,
                color: this.color,
                image: this.image,
                description: this.description,
                maxbookabletime: this.maxbookabletime,
                branch: this.branch,
                roomnumber: this.roomnumber,
            },
            undefined,
            [this.roomid],
        );

        if (response.ok) {
            // Emit an event with the current property values
            const event = new CustomEvent("updated", { bubbles: true });
            this.dispatchEvent(event);
            this.toggleEdit();
            return;
        } else {
            const event = new CustomEvent("error", {
                bubbles: true,
                detail: { errors: "FAILED", status: response.status },
            });
            this.dispatchEvent(event);
        }
    }

    private handleConfirm(e: Event) {
        this.confirmationModal.header = __("Please confirm");

        const name = this.roomnumber;
        if (typeof name === "string") {
            this.confirmationModal.message = __("Are you sure you want to delete: ");
            this.confirmationModal.obj = name;
        } else {
            this.confirmationModal.message = __("Are you sure you want to delete this entry?");
        }

        this.confirmationModal.ref = e.target;
        this.confirmationModal.showModal();
    }

    private async handleDelete() {
        const response = await requestHandler.delete("rooms", undefined, [this.roomid]);

        if (response.ok) {
            const event = new CustomEvent("deleted", { bubbles: true });
            this.dispatchEvent(event);
            return;
        }

        let message: string = t("The room could not be deleted.");
        try {
            const body = await response.json();
            if (body?.error) {
                message = body.error;
            }
        } catch {
            // response had no JSON body — keep the default message
        }

        const toast = document.createElement("lms-toast", { is: "lms-toast" }) as HTMLElement & {
            heading: string;
            message: string;
        };
        toast.heading = `${response.status} ${response.statusText}`;
        toast.message = message;
        this.renderRoot.appendChild(toast);
    }

    private handleChange(e: Event) {
        const target = e.target as HTMLInputElement;
        const { value, name } = target;
        if (
            ![
                "roomnumber",
                "maxcapacity",
                "description",
                "color",
                "image",
                "roomid",
                "maxbookabletime",
                "branch",
            ].includes(name)
        ) {
            return;
        }

        const propertyName = name as keyof this;
        this[propertyName] = value as this[keyof this];
    }

    private renderBranchOptions() {
        const librariesWithOpenHours = this.openHours.reduce((accumulator: Set<string>, openHour: any) => {
            if (!accumulator.has(openHour.branch)) {
                accumulator.add(openHour.branch);
            }

            return accumulator;
        }, new Set());

        return this.libraries
            .filter((library) => librariesWithOpenHours.has(library.id))
            .map(
                (library) =>
                    html`<option value=${library.id} ?selected=${this.branch === library.id}>${library.name}</option>`,
            );
    }

    private handleTabClick(e: Event) {
        e.preventDefault();
        const target = e.target as HTMLElement;
        const next = target?.dataset["tab"];
        if (next === "data" || next === "preview") {
            this.tab = next;
        }
    }

    override render() {
        return html`
            <div class="card my-1 bg-base-100 shadow-md">
                <div class="tabs w-full" role="tablist">
                    <a
                        class="${classMap({
                            "tab-active": this.tab === "data",
                        })} tab tab-bordered tab-lg flex-auto text-base"
                        data-tab="data"
                        role="tab"
                        aria-selected=${this.tab === "data"}
                        @click=${this.handleTabClick}
                        >${__("Data")}</a
                    >
                    <a
                        class="${classMap({
                            "tab-active": this.tab === "preview",
                        })} tab tab-bordered tab-lg flex-auto text-base"
                        data-tab="preview"
                        role="tab"
                        aria-selected=${this.tab === "preview"}
                        @click=${this.handleTabClick}
                        >${__("Preview")}</a
                    >
                </div>
                <div class="card-body" @change=${this.handleChange} @input=${this.handleChange}>
                    <div
                        class="card-title flex h-24 items-center justify-center rounded-md bg-base-200 bg-cover bg-center"
                        style=${this.image ? `background-image: url(${this.image});` : ""}
                    >
                        <h3 class="rounded-lg bg-base-100 p-2 text-xl">
                            ${this.roomnumber || html`<span class="badge badge-lg">${this.roomid}</span>`}
                        </h3>
                    </div>

                    <div class=${classMap({ hidden: this.tab !== "data" })} role="tabpanel">
                        <div class="join mb-3 w-full" aria-label=${attr__("Room controls")}>
                            <button class="btn btn-secondary btn-outline join-item flex-auto" @click=${this.toggleEdit}>
                                ${this.editable
                                    ? html`${litFontawesome(faTimes, {
                                              className: "w-4 h-4 inline-block sm:hidden",
                                          })}<span class="hidden sm:inline">&nbsp;${__("Abort")}</span>`
                                    : html`${litFontawesome(faEdit, {
                                              className: "w-4 h-4 inline-block sm:hidden",
                                          })}<span class="hidden sm:inline">&nbsp;${__("Edit")}</span>`}
                            </button>
                            <button class="btn btn-secondary btn-outline join-item flex-auto" @click=${this.handleSave}>
                                ${litFontawesome(faSave, { className: "w-4 h-4 inline-block sm:hidden" })}
                                <span class="hidden sm:inline">&nbsp;${__("Save")}</span>
                            </button>
                            <button
                                class="btn btn-secondary btn-outline join-item flex-auto"
                                @click=${this.handleConfirm}
                            >
                                ${litFontawesome(faTrash, { className: "w-4 h-4 inline-block sm:hidden" })}
                                <span class="hidden sm:inline">&nbsp;${__("Delete")}</span>
                            </button>
                        </div>

                        <div class="form-group">
                            <label class="label" for="roomnumber"
                                ><span class="label-text">${__("Roomnumber")}</span></label
                            >
                            ${new TextInput("roomnumber", this.roomnumber).render()}
                        </div>
                        <div class="form-control">
                            <label class="label" for="maxcapacity"
                                ><span class="label-text">${__("Max Capacity")}</span></label
                            >
                            ${new NumberInput("maxcapacity", this.maxcapacity).render()}
                        </div>
                        <div class="form-control">
                            <label class="label" for="description"
                                ><span class="label-text">${__("Description")}</span></label
                            >
                            ${new TextInput("description", this.description).render()}
                        </div>
                        <div class="form-control">
                            <label class="label" for="color"><span class="label-text">${__("Color")}</span></label>
                            ${new ColorInput("color", this.color).render()}
                        </div>
                        <div class="form-control">
                            <label class="label" for="image"><span class="label-text">${__("Image")}</span></label>
                            ${new TextInput("image", this.image).render()}
                        </div>
                        <div class="form-control">
                            <label class="label" for="branch"><span class="label-text">${__("Branch")}</span></label>
                            <select class="select select-bordered w-full" name="branch" disabled>
                                ${this.renderBranchOptions()}
                            </select>
                        </div>
                        <div class="form-control">
                            <label class="label" for="maxbookabletime">
                                <span class="label-text"> ${__("Max Bookable Time")} </span>
                            </label>
                            ${new NumberInput("maxbookabletime", this.maxbookabletime).render()}
                            ${this.renderMaxBookableTimeHint()}
                        </div>
                    </div>

                    <div class=${classMap({ hidden: this.tab !== "preview" })} role="tabpanel">
                        ${this.renderOpacPreview()}
                    </div>

                    <lms-confirmation-modal @confirm=${this.handleDelete}></lms-confirmation-modal>
                </div>
            </div>
        `;
    }

    private renderMaxBookableTimeHint() {
        const minutes = parseInt(this.maxbookabletime, 10);
        if (!Number.isFinite(minutes) || minutes <= 0) {
            return nothing;
        }
        return html`<label class="label">
            <span class="label-text-alt text-base-content/70">≈ ${formatMinutesHumanReadable(minutes)}</span>
        </label>`;
    }

    private renderOpacPreview() {
        const library = this.libraries.find((lib) => lib.id === this.branch);
        const maxbookabletimeNum = parseInt(this.maxbookabletime, 10);
        const badgeStyle = this.color
            ? `color: ${this.color}; background-color: ${this.color}; border-color: ${this.color};`
            : "";

        return html`
            <div class="card mx-auto w-72 border bg-base-100 sm:w-80">
                ${this.image
                    ? html`<figure>
                          <img
                              class="w-full object-cover"
                              src=${this.image}
                              alt="${attr__("A depiction of room")}&nbsp;${this.roomnumber}"
                          />
                      </figure>`
                    : nothing}
                <div class="card-body">
                    <h2 class="card-title">
                        ${this.roomnumber}&nbsp;<span class="badge badge-lg shadow-md" style=${badgeStyle}></span>
                    </h2>
                    <p>${this.description}</p>
                    <hr />
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="font-semibold">${__("Branch")}</span>
                            <span>${library?.name ?? this.branch}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="font-semibold">${__("Max Bookable Time")}</span>
                            <span
                                >${Number.isFinite(maxbookabletimeNum)
                                    ? formatMinutesHumanReadable(maxbookabletimeNum)
                                    : nothing}</span
                            >
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="font-semibold">${__("Max Capacity")}</span>
                            <span>${this.maxcapacity} ${__("persons")}</span>
                        </div>
                    </div>
                    <hr />
                    <div class="card-actions justify-end">
                        <button class="btn btn-outline" disabled>${__("Book this room")}</button>
                    </div>
                </div>
            </div>
        `;
    }
}
