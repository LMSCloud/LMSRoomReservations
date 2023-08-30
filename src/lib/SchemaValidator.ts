import { ZodObject, ZodTypeAny, ZodUnion, z } from "zod";
import { convertToSimpleDatetime } from "./converters/datetimeConverters";

export type Table = "rooms" | "bookingsPublic" | "bookings" | "openHours" | "equipment" | "settings";

export type ValidationSchema = Record<Table, ZodObject<Record<string, any>> | ZodUnion<[ZodTypeAny, ...ZodTypeAny[]]>>;
export class SchemaValidator {
    private schemas: ValidationSchema;

    constructor() {
        this.schemas = {
            rooms: z.object({
                roomnumber: z.coerce.string(),
                maxcapacity: z.coerce.number(),
                description: z.coerce.string().nullable(),
                color: z.coerce.string().nullable(),
                image: z.coerce.string().nullable(),
                branch: z.coerce.string().nullable(),
                maxbookabletime: z.coerce.number().nullable(),
            }),
            bookingsPublic: z.object({
                borrowernumber: z.coerce.number(),
                roomid: z.coerce.number(),
                start: z.coerce.string().transform(convertToSimpleDatetime),
                end: z.coerce.string().transform(convertToSimpleDatetime),
                equipment: z.array(z.coerce.string()).nullable(),
                send_confirmation: z.coerce.number(),
                letter_code: z.string(),
            }),
            bookings: z.object({
                borrowernumber: z.coerce.number(),
                roomid: z.coerce.number(),
                start: z.coerce.string().transform(convertToSimpleDatetime), // DATETIME
                end: z.coerce.string().transform(convertToSimpleDatetime), // DATETIME
                equipment: z.array(z.coerce.string()).nullable(),
                blackedout: z.coerce.number(),
            }),
            openHours: z.union([
                z.object({
                    start: z.coerce.string(), // TIME
                    end: z.coerce.string(), // TIME
                }),
                z.array(
                    z.object({
                        day: z.coerce.number(),
                        start: z.coerce.string(),
                        end: z.coerce.string(),
                        branch: z.coerce.string(),
                    }),
                ),
            ]),
            equipment: z.object({
                equipmentname: z.coerce.string(),
                description: z.coerce.string().nullable(),
                image: z.coerce.string().nullable(),
                maxbookabletime: z.coerce.number().nullable(),
                roomid: z.union([z.coerce.number(), z.undefined()]),
            }),
            settings: z.union([
                z.object({
                    value: z.any(),
                }),
                z.array(
                    z.object({
                        setting: z.string(),
                        value: z.string(),
                    }),
                ),
            ]),
        };
    }

    public validateAndCoerce(type: Table, data: any) {
        if (!(type in this.schemas)) {
            throw new Error(`Schema for '${type}' not found.`);
        }

        const schema = this.schemas[type];

        try {
            const validatedData = schema.parse(data);
            return validatedData;
        } catch (error: unknown) {
            if (!(error instanceof Error)) {
                throw new Error("Unknown error");
            }

            throw new Error(`Data validation error: ${error.message}`);
        }
    }
}

/*
const schemaValidator = new SchemaValidator();
const inputData = {
    roomid: "1", // Assuming this is a string but should be a number
    roomnumber: "101",
    maxcapacity: 5,
    // ... other fields ...
};

try {
    const validatedRoomData = schemaValidator.validateAndCoerce("room", inputData);
    console.log(validatedRoomData);
} catch (error) {
    console.error(error.message);
}
*/
