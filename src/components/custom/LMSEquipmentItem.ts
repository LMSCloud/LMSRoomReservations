import { faEdit, faSave, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { litFontawesome } from "@weavedev/lit-fontawesome";
import { LitElement, html } from "lit";
import { customElement, property, query, queryAll } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { requestHandler } from "../../lib/RequestHandler";
import NumberInput from "../../lib/converters/InputConverter/inputs/NumberInput";
import TextInput from "../../lib/converters/InputConverter/inputs/TextInput";
import { __ } from "../../lib/translate";
import { tailwindStyles } from "../../tailwind.lit";
import LMSConfirmationModal from "../LMSConfirmationModal";

@customElement("lms-equipment-item")
export default class LMSEquipmentItem extends LitElement {
    @property({ type: String }) equipmentid: string = "";

    @property({ type: String }) equipmentname: string = "";

    @property({ type: String }) description: string = "";

    @property({ type: String }) image: string = "";

    @property({ type: String }) maxbookabletime: string = "";

    @property({ type: String }) roomid?: string | undefined;

    @property({ type: Boolean }) editable: boolean = false;

    @property({ type: Array }) rooms: any[] = [];

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
            "equipment",
            {
                equipmentname: this.equipmentname,
                description: this.description,
                image: this.image,
                maxbookabletime: this.maxbookabletime,
                roomid: this.roomid,
            },
            undefined,
            [this.equipmentid],
        );

        if (response.ok) {
            // Emit an event with the current property values
            const event = new CustomEvent("updated", { bubbles: true });
            this.dispatchEvent(event);
            this.toggleEdit();
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

        const name = this.equipmentname;
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
        const response = await requestHandler.delete("equipment", undefined, [this.equipmentid]);

        if (response.ok) {
            // Emit an event with the current property values
            const event = new CustomEvent("deleted", { bubbles: true });
            this.dispatchEvent(event);
        }
    }

    private handleChange(e: Event) {
        const target = e.target as HTMLInputElement;
        const { value, name } = target;
        if (!["equipmentid", "equipmentname", "description", "image", "maxbookabletime", "roomid"].includes(name)) {
            return;
        }

        const propertyName = name as keyof this;
        this[propertyName] = value as this[keyof this];
    }

    override render() {
        return html`
            <div class="lms-equipment-item card my-1 bg-base-100 shadow-xl">
                <figure>
                    <img
                        class="lms-equipment-item-img"
                        ?hidden=${!this.image}
                        src="${this.image ?? "..."}"
                        alt="Image for ${this.equipmentname}"
                    />
                </figure>
                <div class="card-body" @change=${this.handleChange}>
                    <h5 class="card-title">
                        <span class="badge badge-lg">${this.equipmentid}</span>
                    </h5>
                    <div class="form-control w-full">
                        <label class="label" for="equipmentname"
                            ><span class="label-text">${__("Equipmentname")}</span></label
                        >
                        ${new TextInput("equipmentname", this.equipmentname).render()}
                    </div>
                    <div class="form-control w-full">
                        <label class="label" for="description"
                            ><span class="label-text">${__("Description")}</span></label
                        >
                        ${new TextInput("description", this.description).render()}
                    </div>
                    <div class="form-control w-full">
                        <label class="label" for="image"><span class="label-text">${__("Image")}</span></label>
                        ${new TextInput("image", this.image).render()}
                    </div>
                    <div class="form-control w-full">
                        <label class="label" for="maxbookabletime"
                            ><span class="label-text">${__("Max Bookable Time")}</span></label
                        >
                        ${new NumberInput("maxbookabletime", this.maxbookabletime).render()}
                    </div>
                    <div class="form-control w-full" ?hidden=${!this.rooms.length}>
                        <label class="label" for="roomid"><span class="label-text">${__("Roomid")}</span></label>
                        <select class="select select-bordered w-full" name="roomid" disabled>
                            ${map(
                                this.rooms,
                                (room) =>
                                    html`<option ?selected=${room.roomid == this.roomid} value=${room.roomid}>
                                        ${room.roomnumber}
                                    </option>`,
                            )}
                            <option ?selected=${!this.roomid}>${__("No room associated")}</option>
                        </select>
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
                        <lms-confirmation-modal @confirm=${this.handleDelete}> </lms-confirmation-modal>
                    </div>
                </div>
            </div>
        `;
    }
}
