import { html, TemplateResult } from "lit";
import { InputType, InputTypeValue, ModalField, SelectOption, TaggedData } from "../../../types/common";
import { dayMapping } from "../../../views/StaffOpenHoursView";
import { __, localeFull } from "../../translate";
import { formatDatetimeByLocale } from "../datetimeConverters";
import Checkbox from "./inputs/Checkbox";
import Checklist from "./inputs/Checklist";
import DatetimeLocalInput from "./inputs/DatetimeLocalInput";
import EmailInput from "./inputs/EmailInput";
import ModalCheckboxInput from "./inputs/modal/ModalCheckboxInput";
import ModalChecklist from "./inputs/modal/ModalChecklist";
import ModalColorInput from "./inputs/modal/ModalColorInput";
import ModalDatetimeLocalInput from "./inputs/modal/ModalDatetimeLocalInputs";
import ModalHiddenInput from "./inputs/modal/ModalHiddenInput";
import ModalInfo from "./inputs/modal/ModalInfo";
import ModalNumberInput from "./inputs/modal/ModalNumberInputs";
import ModalSelect from "./inputs/modal/ModalSelect";
import ModalTextInput from "./inputs/modal/ModalTextInput";
import NumberInput from "./inputs/NumberInput";
import Select from "./inputs/Select";
import TextInput from "./inputs/TextInput";
import TimeInput from "./inputs/TimeInput";

type TemplateQuery = {
    name: string;
    value: InputType | InputTypeValue | ModalField;
    data?: TaggedData[];
};

type TemplateFunction = (value: InputTypeValue | ModalField, data?: any[]) => TemplateResult;

/**
 * Represents an InputConverter that handles conversion of input fields based on their name.
 */
export class InputConverter {
    private conversionMap: Record<string, TemplateFunction> = {};

    private static readonly DATA_REQUIRING_TEMPLATES = ["branch", "roomid", "borrowernumber", "equipment", "value"];

    constructor() {
        this.conversionMap = {
            day: (value) => {
                const stringifiedIndex = value?.toString();
                if (!stringifiedIndex) {
                    return this.renderError();
                }

                const dayString = dayMapping.get(stringifiedIndex);
                if (!dayString) {
                    return html``;
                }

                return html`<span data-index=${stringifiedIndex}> ${__(dayString)} </span>`;
            },
            end: (value) =>
                /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(value as string)
                    ? new TimeInput("end", value).render()
                    : new DatetimeLocalInput("end", value).render(),
            blackedout: (value) => new Checkbox("blackedout", value).render(),
            borrowernumber: (value, data) => {
                let borrowernumber = value;
                if (!borrowernumber) {
                    return this.renderError();
                }

                if (!(typeof borrowernumber === "number")) {
                    borrowernumber = Number(borrowernumber);
                }

                const { firstname, surname } = data?.[borrowernumber];
                return html`
                    <a
                        class="link-primary link"
                        href="/cgi-bin/koha/members/moremember.pl?borrowernumber=${borrowernumber}"
                        >${firstname}&nbsp;${surname}</a
                    >
                    &nbsp;
                    <div class="badge">${value}</div>
                `;
            },
            created: (value) => html`${formatDatetimeByLocale(value as string, localeFull)}`,
            equipment: (value, data) => {
                const [roomid, equipmentItems] = value as [number, any[]];
                if (!equipmentItems) {
                    return html``;
                }

                let equipmentItemsByRoom = data?.filter((equipmentItem) => equipmentItem.roomid == roomid) ?? [];
                const equipmentItemIds = equipmentItems.map((equipmentItem) => equipmentItem.equipmentid);
                return html` <div class="flex flex-row overflow-x-scroll">
                    ${equipmentItemsByRoom.map(
                        (equipmentItemByRoom: any) => html`
                            <div class="form-control">
                                <label class="label cursor-pointer">
                                    <input
                                        type="checkbox"
                                        ?checked=${equipmentItemIds.includes(equipmentItemByRoom.id)}
                                        id="equipment_${equipmentItemByRoom.id}"
                                        name=${equipmentItemByRoom.id}
                                        class="checkbox mr-2"
                                        disabled
                                    />
                                    <span class="label-text">${equipmentItemByRoom.name}</span>
                                </label>
                            </div>
                        `,
                    )}
                </div>`;
            },
            modal_checkbox: (value) => new ModalCheckboxInput(value as ModalField).render(),
            modal_checklist: (value, data) => {
                return new ModalChecklist(value as ModalField, data as SelectOption[]).render();
            },
            modal_color: (value) => new ModalColorInput(value as ModalField).render(),
            "modal_datetime-local": (value) => new ModalDatetimeLocalInput(value as ModalField).render(),
            modal_hidden: (value) => new ModalHiddenInput(value as ModalField).render(),
            modal_info: (value) => new ModalInfo(value as ModalField).render(),
            modal_number: (value) => new ModalNumberInput(value as ModalField).render(),
            modal_select: (value, data) => new ModalSelect(value as ModalField, data as SelectOption[]).render(),
            modal_text: (value) => new ModalTextInput(value as ModalField).render(),
            "modal_patron-search": (value) => {
                const { name, desc, placeholder, required, value: _value } = value as ModalField;
                return html`
                    <lms-patron-search
                        .name=${name}
                        .description=${desc}
                        .placeholder=${placeholder}
                        .value=${_value}
                        .required=${required}
                        class="lit-element"
                    ></lms-patron-search>
                `;
            },
            roomid: (value, data) => new Select("roomid", value, data as SelectOption[]).render(),
            start: (value) =>
                /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(value as string)
                    ? new TimeInput("start", value).render()
                    : new DatetimeLocalInput("start", value).render(),
            updated_at: (value) => html`${formatDatetimeByLocale(value as string, localeFull)}`,
            value: (value, data) => {
                const [name, _value] = value as [string, any];
                const datum = data?.find((datum) => datum.setting === name);
                const { type, placeholder } = datum;
                switch (type) {
                    case "text": {
                        return new TextInput("value", _value, placeholder).render();
                    }
                    case "number": {
                        return new NumberInput("value", _value, placeholder).render();
                    }
                    case "email": {
                        return new EmailInput("value", _value, placeholder).render();
                    }
                    case "array": {
                        const mappedValue = _value.map((item: Record<string, string>) => {
                            const [name, value] = Object.values(item);
                            return {
                                name,
                                value,
                            };
                        });
                        return new Checklist(mappedValue).render();
                    }
                    default: {
                        return new TextInput("value", _value).render();
                    }
                }
            },
        };
    }

    private needsData(templateName: string): boolean {
        return InputConverter.DATA_REQUIRING_TEMPLATES.includes(templateName);
    }

    public getInputTemplate({ name, value, data }: TemplateQuery): TemplateResult {
        const template = this.conversionMap[name];
        if (!template) return this.renderValue(value);

        const targetName = this.getTargetName(name, value);
        if (!targetName) return this.renderError();

        if (this.needsData(targetName)) {
            const requiredData = this.findDataByName(targetName, data);
            if (!requiredData) return this.renderError();

            return template(value, requiredData);
        }

        return template(value);
    }

    private getTargetName(name: string, value: unknown): string | undefined {
        if (name.startsWith("modal_")) {
            return (value as ModalField)?.name;
        }

        return name;
    }

    private findDataByName(name: string, data?: TaggedData[]): any {
        return data?.find(([tag]) => tag === name)?.[1];
    }

    /**
     * Renders the value as a TemplateResult.
     * @param value - The value to be rendered.
     * @returns The rendered value as a TemplateResult.
     */
    private renderValue(value: InputTypeValue): TemplateResult {
        return html`${value}`;
    }

    /**
     * Renders an error message as a TemplateResult.
     * @returns The rendered error message as a TemplateResult.
     */
    private renderError(): TemplateResult {
        return html`<strong>${__("Error")}!</strong>`;
    }
}

/*
import { html, TemplateResult } from "lit";
import {
    InputType,
    InputTypeValue,
    ModalField,
    SelectOption,
    TaggedData,
    UploadedImage,
} from "../../../types/common";
import { __ } from "../../translate";
import Checkbox from "./inputs/Checkbox";
import Input from "./inputs/Input";
import ModalCheckboxInput from "./inputs/modal/ModalCheckboxInput";
import ModalColorInput from "./inputs/modal/ModalColorInput";
import ModalDatetimeLocalInput from "./inputs/modal/ModalDatetimeLocalInputs";
import ModalMatrix from "./inputs/modal/ModalMatrix";
import ModalNumberInput from "./inputs/modal/ModalNumberInputs";
import ModalSelect from "./inputs/modal/ModalSelect";
import ModalTextInput from "./inputs/modal/ModalTextInput";
import Select from "./inputs/Select";

enum TemplateType {
    Regular,
    Modal,
    Select,
    // ... add more template types as needed
}

type TemplateQuery = {
    name: string;
    value: InputType | InputTypeValue | ModalField;
    data?: TaggedData[];
};

abstract class InputTemplate {
    constructor(private name: string, private type: TemplateType) {}

    abstract render(value: InputTypeValue | ModalField, data?: any): TemplateResult;
}

class RegularInputTemplate extends InputTemplate {
    constructor(name: string) {
        super(name, TemplateType.Regular);
    }

    render(value: InputTypeValue): TemplateResult {
        return new Input(this.name, value).render();
    }
}

class ModalInputTemplate extends InputTemplate {
    constructor(name: string, private data: TaggedData[]) {
        super(name, TemplateType.Modal);
    }

    render(value: ModalField): TemplateResult {
        switch (this.name) {
            case "modal_checkbox":
                return new ModalCheckboxInput(value).render();
            case "modal_color":
                return new ModalColorInput(value).render();
            case "modal_datetime-local":
                return new ModalDatetimeLocalInput(value).render();
            case "modal_matrix":
                return new ModalMatrix(value, this.data).render();
            case "modal_number":
                return new ModalNumberInput(value).render();
            case "modal_select":
                const options = this.data
                    .filter(([tag]) => tag === "modal_select")
                    .map(({ id, name }) => ({ id, name }));
                return new ModalSelect(value, options).render();
            case "modal_text":
                return new ModalTextInput(value).render();
            // Add more cases for other modal templates
            default:
                return this.renderError();
        }
    }

}

class SelectInputTemplate extends InputTemplate {
    constructor(name: string, private options: SelectOption[]) {
        super(name, TemplateType.Select);
    }

    render(value: InputTypeValue): TemplateResult {
        return new Select(this.name, value, this.options).render();
    }
}

export class InputConverter {
    private conversionMap: Record<string, InputTemplate> = {};

    constructor(private data: TaggedData[]) {
        this.initializeConversionMap();
    }

    private initializeConversionMap() {
        this.conversionMap = {
            end: new RegularInputTemplate("end"),
            blackedout: new Checkbox("blackedout"),
            modal_checkbox: new ModalInputTemplate("modal_checkbox", this.data),
            modal_color: new ModalInputTemplate("modal_color", this.data),
            "modal_datetime-local": new ModalInputTemplate("modal_datetime-local", this.data),
            modal_matrix: new ModalInputTemplate("modal_matrix", this.data),
            modal_number: new ModalInputTemplate("modal_number", this.data),
            modal_select: new ModalInputTemplate("modal_select", this.data),
            modal_text: new ModalInputTemplate("modal_text", this.data),
            roomid: new SelectInputTemplate("roomid", this.getSelectOptions("roomid")),
            start: new RegularInputTemplate("start"),
            value: new RegularInputTemplate("value"),
        };
    }

    private static readonly DATA_REQUIRING_TEMPLATES = ["branch", "roomid"];

    private determineTemplateType(name: string): TemplateType {
        if (this.isModalTemplate(name)) {
            return TemplateType.Modal;
        }
        if (this.isSelectTemplate(name)) {
            return TemplateType.Select;
        }

        return TemplateType.Regular;
    }

    private isModalTemplate(templateName: string): boolean {
        return templateName.startsWith("modal_");
    }

    private isSelectTemplate(templateName: string): boolean {
        return templateName === "roomid"; // Add more conditions for other select templates
    }

    private getTemplateName(name: string, type: TemplateType): string {
        if (type === TemplateType.Modal) {
            return name.split("_")[1];
        }
        return name;
    }

    public getInputTemplate({ name, value }: TemplateQuery): TemplateResult {
        const type = this.determineTemplateType(name);
        const templateName = this.getTemplateName(name, type);
        const template = this.conversionMap[templateName];

        if (!template) {
            return this.renderError();
        }

        if (this.needsData(templateName)) {
            const requiredData = this.findDataByName(templateName);
            if (!requiredData) {
                return this.renderError();
            }

            return template.render(value, requiredData);
        }

        return template.render(value);
    }

    private needsData(templateName: string): boolean {
        return InputConverter.DATA_REQUIRING_TEMPLATES.includes(templateName);
    }

    private getSelectOptions(name: string): SelectOption[] {
        return this.data
            .filter(([tag]) => tag === name)
            .map(({ id, name }) => ({ id, name }));
    }

    private findDataByName(name: string): any {
        return this.data.find(([tag]) => tag === name)?.[1];
    }

    private renderError(): TemplateResult {
        return html`<strong>${__("Error")}!</strong>`;
    }
}
 
 */
