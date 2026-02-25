import { SchemaValidator } from "../../src/lib/SchemaValidator";

describe("SchemaValidator", () => {
    let validator: SchemaValidator;

    beforeEach(() => {
        validator = new SchemaValidator();
    });

    describe("rooms", () => {
        it("validates and coerces valid room data", () => {
            const input = {
                roomnumber: "101",
                maxcapacity: "5",
                description: "Conference Room",
                color: "#fff",
                image: null,
                branch: "LIB1",
                maxbookabletime: "120",
            };

            const result = validator.validateAndCoerce("rooms", input);
            expect(result.maxcapacity).toBe(5);
            expect(result.maxbookabletime).toBe(120);
            expect(typeof result.roomnumber).toBe("string");
        });

        it("throws on invalid room data", () => {
            const input = { roomnumber: "101" }; // missing required fields
            expect(() => validator.validateAndCoerce("rooms", input)).toThrow();
        });

        it("accepts nullable fields as null", () => {
            const input = {
                roomnumber: "101",
                maxcapacity: 5,
                description: null,
                color: null,
                image: null,
                branch: null,
                maxbookabletime: null,
            };

            const result = validator.validateAndCoerce("rooms", input);
            expect(result.description).toBeNull();
            expect(result.color).toBeNull();
            expect(result.maxbookabletime).toBeNull();
        });
    });

    describe("bookings", () => {
        it("validates and coerces booking data with datetime strings", () => {
            const input = {
                borrowernumber: "42",
                roomid: "1",
                start: "2024-01-15T10:00:00",
                end: "2024-01-15T11:00:00",
                equipment: ["1", "2"],
                blackedout: "0",
                send_confirmation: "1",
                letter_code: "ROOM_CONFIRM",
            };

            const result = validator.validateAndCoerce("bookings", input);
            expect(result.borrowernumber).toBe(42);
            expect(result.roomid).toBe(1);
            expect(typeof result.start).toBe("string");
            expect(typeof result.end).toBe("string");
        });
    });

    describe("equipment", () => {
        it("handles optional roomid", () => {
            const input = {
                equipmentname: "Projector",
                description: "HD Projector",
                image: null,
                maxbookabletime: null,
            };

            const result = validator.validateAndCoerce("equipment", input);
            expect(result.equipmentname).toBe("Projector");
            expect(result.roomid).toBeUndefined();
        });

        it("accepts roomid when provided", () => {
            const input = {
                equipmentname: "Projector",
                description: null,
                image: null,
                maxbookabletime: null,
                roomid: "3",
            };

            const result = validator.validateAndCoerce("equipment", input);
            expect(result.roomid).toBe(3);
        });
    });

    describe("openHours", () => {
        it("accepts single object form", () => {
            const input = { start: "08:00", end: "17:00" };
            const result = validator.validateAndCoerce("openHours", input);
            expect(result).toEqual({ start: "08:00", end: "17:00" });
        });

        it("accepts array form", () => {
            const input = [
                { day: 1, start: "08:00", end: "17:00", branch: "LIB1" },
                { day: 2, start: "09:00", end: "18:00", branch: "LIB1" },
            ];
            const result = validator.validateAndCoerce("openHours", input);
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
        });
    });

    describe("settings", () => {
        it("accepts single object form", () => {
            const input = { value: "some_value" };
            const result = validator.validateAndCoerce("settings", input);
            expect(result.value).toBe("some_value");
        });

        it("accepts array form", () => {
            const input = [
                { setting: "max_rooms", value: "10" },
                { setting: "timezone", value: "UTC" },
            ];
            const result = validator.validateAndCoerce("settings", input);
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
        });
    });

    describe("unknown schema", () => {
        it("throws for unknown schema type", () => {
            expect(() => validator.validateAndCoerce("nonexistent" as any, {})).toThrow(
                "Schema for 'nonexistent' not found",
            );
        });
    });
});
