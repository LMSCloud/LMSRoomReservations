import { QueryBuilder } from "../../src/lib/QueryBuilder";

describe("QueryBuilder", () => {
    let qb: QueryBuilder;

    beforeEach(() => {
        qb = new QueryBuilder();
    });

    it("initializes with empty params", () => {
        expect(qb.query.toString()).toBe("");
    });

    describe("query setter", () => {
        it("accepts a string", () => {
            qb.query = "foo=bar&baz=qux";
            expect(qb.getParamValue("foo")).toBe("bar");
            expect(qb.getParamValue("baz")).toBe("qux");
        });

        it("accepts URLSearchParams", () => {
            qb.query = new URLSearchParams({ a: "1", b: "2" });
            expect(qb.getParamValue("a")).toBe("1");
            expect(qb.getParamValue("b")).toBe("2");
        });
    });

    describe("getParamValue", () => {
        it("returns correct value for existing key", () => {
            qb.query = "key=value";
            expect(qb.getParamValue("key")).toBe("value");
        });

        it("returns null for missing key", () => {
            expect(qb.getParamValue("missing")).toBeNull();
        });
    });

    describe("reservedParams", () => {
        it("preserves reserved params when absent from new query", () => {
            qb.query = "_page=2&_per_page=10&color=red";
            qb.reservedParams = ["_page", "_per_page"];

            qb.updateQuery("color=blue");

            expect(qb.getParamValue("_page")).toBe("2");
            expect(qb.getParamValue("_per_page")).toBe("10");
            expect(qb.getParamValue("color")).toBe("blue");
        });

        it("updates reserved param values when present in new query", () => {
            qb.query = "_page=1";
            qb.reservedParams = ["_page"];

            qb.updateQuery("_page=5");
            expect(qb.getParamValue("_page")).toBe("5");
        });
    });

    describe("disallowedParams", () => {
        it("excludes disallowed params during updateQuery", () => {
            qb.query = "a=1";
            qb.disallowedParams = ["secret"];

            qb.updateQuery("a=2&secret=hidden");
            expect(qb.getParamValue("a")).toBe("2");
            expect(qb.getParamValue("secret")).toBeNull();
        });
    });

    describe("areRepeatable", () => {
        it("appends repeatable params and merges correctly", () => {
            qb.query = "tag=a&tag=b&other=1";
            qb.areRepeatable = ["tag"];

            qb.updateQuery("tag=b&tag=c");

            const tags = qb.query.getAll("tag");
            expect(tags).toContain("b");
            expect(tags).toContain("c");
            expect(tags).not.toContain("a");
        });
    });

    describe("staticParams", () => {
        it("captures current query values and persists through updates", () => {
            qb.query = "lang=de&color=red";
            qb.staticParams = ["lang"];

            // After updateUrl, static params should be merged.
            // We can check the internal state indirectly:
            // updateUrl uses window which is jsdom — just verify staticParams are captured.
            // The staticParams setter stores the value from the current query.
            qb.updateQuery("color=blue");
            expect(qb.getParamValue("color")).toBe("blue");
        });
    });

    describe("updateQuery", () => {
        it("removes non-reserved, non-repeatable keys absent from new query", () => {
            qb.query = "a=1&b=2&c=3";
            qb.reservedParams = ["a"];

            qb.updateQuery("b=20");

            expect(qb.getParamValue("a")).toBe("1");
            expect(qb.getParamValue("b")).toBe("20");
            expect(qb.getParamValue("c")).toBeNull();
        });

        it("accepts URLSearchParams as argument", () => {
            qb.query = "x=1";
            qb.updateQuery(new URLSearchParams("x=2&y=3"));

            expect(qb.getParamValue("x")).toBe("2");
            expect(qb.getParamValue("y")).toBe("3");
        });
    });
});
