import { formatMonetaryAmountByLocale } from "../../../src/lib/converters/displayConverters";

describe("formatMonetaryAmountByLocale", () => {
    it("formats USD for en-US locale", () => {
        const result = formatMonetaryAmountByLocale("en-US", 42.5);
        expect(result).toContain("42.50");
        expect(result).toContain("$");
    });

    it("formats EUR for de-DE locale", () => {
        const result = formatMonetaryAmountByLocale("de-DE", 42.5);
        expect(result).toContain("42,50");
        expect(result).toContain("€");
    });

    it("returns empty string for null amount", () => {
        expect(formatMonetaryAmountByLocale("en-US", null)).toBe("");
    });

    it("returns empty string for undefined amount", () => {
        expect(formatMonetaryAmountByLocale("en-US")).toBe("");
    });

    it("returns empty string for zero (falsy)", () => {
        expect(formatMonetaryAmountByLocale("en-US", 0)).toBe("");
    });

    it("returns empty string for invalid locale country code", () => {
        expect(formatMonetaryAmountByLocale("xx-XX", 10)).toBe("");
    });
});
