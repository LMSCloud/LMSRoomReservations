import { faEdit, faSave, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { litFontawesome } from "@weavedev/lit-fontawesome";
import { LitElement, html } from "lit";
import { customElement, property, query, queryAll } from "lit/decorators.js";
import { requestHandler } from "../../lib/RequestHandler.js";
import ColorInput from "../../lib/converters/InputConverter/inputs/ColorInput.js";
import NumberInput from "../../lib/converters/InputConverter/inputs/NumberInput.js";
import TextInput from "../../lib/converters/InputConverter/inputs/TextInput.js";
import { __ } from "../../lib/translate.js";
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

    @property({ type: String }) maxbookabletime: string = "";

    @property({ type: String }) maxcapacity: string = "";

    @property({ type: String }) roomid: string = "";

    @property({ type: String }) roomnumber: string = "";

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
            // Emit an event with the current property values
            const event = new CustomEvent("deleted", { bubbles: true });
            this.dispatchEvent(event);
        }
    }

    private handleChange(e: Event) {
        const target = e.target as HTMLInputElement;
        const { value, name } = target;
        if (
            !["roomnumber", "maxcapacity", "description", "color", "image", "roomid", "maxbookabletime"].includes(name)
        ) {
            return;
        }

        const propertyName = name as keyof this;
        this[propertyName] = value as this[keyof this];
    }

    override render() {
        return html`
            <div class="card my-1 bg-base-100 shadow-xl">
                <figure>
                    <img ?hidden=${!this.image} src=${this.image ?? "..."} alt="Image for ${this.roomnumber}" />
                </figure>
                <div class="card-body" @change=${this.handleChange}>
                    <h5 class="card-title">
                        <span class="badge badge-lg">${this.roomid}</span>
                    </h5>
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
                            ${this.libraries?.map(
                                (library) =>
                                    html`<option value=${library.id} ?selected=${this.branch === library.id}>
                                        ${library.name}
                                    </option>`,
                            )}
                        </select>
                    </div>
                    <div class="form-control">
                        <label class="label" for="maxbookabletime">
                            <span class="label-text"> ${__("Max Bookable Time")} </span>
                        </label>
                        ${new NumberInput("maxbookabletime", this.maxbookabletime).render()}
                    </div>
                    <div class="card-actions  my-4 w-full justify-end">
                        <button class="btn btn-secondary btn-outline" @click=${this.toggleEdit}>
                            ${this.editable
                                ? html` ${litFontawesome(faTimes, {
                                          className: "w-4 h-4 inline-block",
                                      })}
                                      <span>${__("Abort")}</span>`
                                : html` ${litFontawesome(faEdit, {
                                          className: "w-4 h-4 inline-block",
                                      })}
                                      <span>${__("Edit")}</span>`}
                        </button>
                        <button class="btn btn-secondary btn-outline" @click=${this.handleSave}>
                            ${litFontawesome(faSave, {
                                className: "w-4 h-4 inline-block",
                            })}
                            <span>${__("Save")}</span>
                        </button>
                        <button class="btn btn-secondary btn-outline" @click=${this.handleConfirm}>
                            ${litFontawesome(faTrash, {
                                className: "w-4 h-4 inline-block",
                            })}
                            <span>${__("Delete")}</span>
                        </button>
                        <lms-confirmation-modal @confirm=${this.handleDelete}></lms-confirmation-modal>
                    </div>
                </div>
            </div>
        `;
    }
}
