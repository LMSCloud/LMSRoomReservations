import { TemplateResult } from "lit";
import { DirectiveResult } from "lit/directive";
import { TranslateDirective } from "../lib/translate";

/* Utility types */

export type Column = Record<string, ColumnValue>;

type ColumnValue = string | number | TemplateResult;

export type ComprehensiveInputType = InputType | SpecialFieldType | "matrix" | "patron-search";

export type CreateOpts = Omit<RequestInit, "endpoint"> & {
    endpoint: string;
};

export type Facets = {
    description: string;
    end_time: Date;
    eventTypeIds: Array<number | null>;
    id: number;
    image: string;
    locationIds: Array<number | null>;
    max_age: number;
    max_participants: number;
    min_age: number;
    name: string;
    open_registration: boolean;
    registration_end: Date;
    registration_link: string;
    registration_start: Date;
    start_time: Date;
    status: "pending" | "confirmed" | "canceled" | "sold_out";
    targetGroupIds: Array<number | null>;
};

export type Image = {
    src: string;
    alt: string;
};

export type Input = {
    name: string;
    value: string;
};

export type InputElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export type InputType =
    | "button"
    | "checkbox"
    | "color"
    | "date"
    | "datetime-local"
    | "email"
    | "file"
    | "hidden"
    | "image"
    | "info"
    | "month"
    | "number"
    | "password"
    | "radio"
    | "range"
    | "reset"
    | "search"
    | "select"
    | "submit"
    | "tel"
    | "text"
    | "time"
    | "url"
    | "week";

export type InputTypeValue = string | number | boolean | Array<unknown> | Record<string, unknown> | null;

export type KohaAPIError = Record<"message" | "path", string>;

export type MatrixGroup = {
    id: string;
    [key: string]: string | number | boolean;
};

export type ModalField = {
    name: string;
    type: ComprehensiveInputType;
    desc: string | TranslatedString;
    placeholder?: string | TranslatedString;
    required?: boolean;
    value?: string | number | boolean | Array<unknown> | Record<string, unknown>;
    headers?: Array<Array<string>>;
};

export type SelectOption = {
    id: string | number;
    name: string | TranslatedString;
};

export type SortableColumns = Array<string> & { 0: "id" };

export type SpecialFieldType = "checkbox" | "info" | "select" | "checklist";

type StringRecord = Record<string, string>;

export type TaggedColumn = Column & {
    uuid: string;
};

export type TaggedData = ["branch" | "roomid" | "borrowernumber" | "equipment" | "value", Array<unknown>];

export type Toast = {
    heading: string | TemplateResult;
    message: string | TemplateResult;
};

export type TranslatedString = DirectiveResult<typeof TranslateDirective>;

export type UploadedImage = {
    image: string;
    metadata: {
        dtcreated: string;
        id: number;
        permanent: number;
        dir: string;
        public: number;
        filename: string;
        uploadcategorycode: string;
        owner: number;
        hashvalue: string;
        filesize: number;
    };
};

export type URIComponents = {
    path?: string;
    query?: boolean;
    params?: StringRecord;
    fragment?: string;
};

/* Data: These interfaces represent the schema of the underlying database */
