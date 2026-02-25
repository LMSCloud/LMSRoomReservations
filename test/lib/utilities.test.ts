import { deepCopy, debounce, isDeepEqual, throttle } from "../../src/lib/utilities";

describe("deepCopy", () => {
    it("passes primitives through unchanged", () => {
        expect(deepCopy(42)).toBe(42);
        expect(deepCopy("hello")).toBe("hello");
        expect(deepCopy(true)).toBe(true);
        expect(deepCopy(undefined)).toBe(undefined);
    });

    it("returns null for null", () => {
        expect(deepCopy(null)).toBeNull();
    });

    it("clones nested objects without shared references", () => {
        const original = { a: 1, b: { c: 2 } };
        const copy = deepCopy(original);

        expect(copy).toEqual(original);
        expect(copy).not.toBe(original);
        expect(copy.b).not.toBe(original.b);

        copy.b.c = 99;
        expect(original.b.c).toBe(2);
    });

    it("deeply clones arrays", () => {
        const original = [1, [2, 3], { a: 4 }];
        const copy = deepCopy(original);

        expect(copy).toEqual(original);
        expect(copy).not.toBe(original);
        expect(copy[1]).not.toBe(original[1]);
        expect(copy[2]).not.toBe(original[2]);
    });

    it("clones Date objects (different reference, same time)", () => {
        const original = new Date("2024-01-15T10:30:00Z");
        const copy = deepCopy(original);

        expect(copy).not.toBe(original);
        expect(copy.getTime()).toBe(original.getTime());
    });
});

describe("isDeepEqual", () => {
    it("returns true for same reference", () => {
        const obj = { a: 1 };
        expect(isDeepEqual(obj, obj)).toBe(true);
    });

    it("returns true for equal primitives", () => {
        expect(isDeepEqual(1, 1)).toBe(true);
        expect(isDeepEqual("abc", "abc")).toBe(true);
    });

    it("returns false for different primitives", () => {
        expect(isDeepEqual(1, 2)).toBe(false);
        expect(isDeepEqual("a", "b")).toBe(false);
    });

    it("returns true for equal nested objects", () => {
        const a = { x: { y: [1, 2, 3] } };
        const b = { x: { y: [1, 2, 3] } };
        expect(isDeepEqual(a, b)).toBe(true);
    });

    it("returns false for different nested objects", () => {
        const a = { x: { y: 1 } };
        const b = { x: { y: 2 } };
        expect(isDeepEqual(a, b)).toBe(false);
    });

    it("returns false for different key counts", () => {
        const a = { x: 1 };
        const b = { x: 1, y: 2 };
        expect(isDeepEqual(a, b)).toBe(false);
    });

    it("compares functions by string representation", () => {
        const a = { fn: () => 1 };
        const b = { fn: () => 1 };
        expect(isDeepEqual(a, b)).toBe(true);

        const c = { fn: () => 2 };
        expect(isDeepEqual(a, c)).toBe(false);
    });

    it("handles null values", () => {
        expect(isDeepEqual(null, null)).toBe(true);
        expect(isDeepEqual(null, { a: 1 })).toBe(false);
        expect(isDeepEqual({ a: 1 }, null)).toBe(false);
    });
});

describe("throttle", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("does not call more than once within the delay period", () => {
        const callback = vi.fn();

        vi.setSystemTime(new Date(0));
        const throttled = throttle(callback, 1000);

        // At time 0, previousCall=0, time=0 → 0-0 < 1000 → not called
        // Advance to exactly the delay so the first call goes through
        vi.setSystemTime(new Date(1000));
        throttled();
        expect(callback).toHaveBeenCalledTimes(1);

        // Rapid calls within the delay window should be suppressed
        vi.setSystemTime(new Date(1500));
        throttled();
        expect(callback).toHaveBeenCalledTimes(1);

        vi.setSystemTime(new Date(1999));
        throttled();
        expect(callback).toHaveBeenCalledTimes(1);

        // After another full delay, the next call goes through
        vi.setSystemTime(new Date(2000));
        throttled();
        expect(callback).toHaveBeenCalledTimes(2);
    });
});

describe("debounce", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("delays callback by wait ms", () => {
        const callback = vi.fn();
        const debounced = debounce(callback, 200, false);

        debounced();
        expect(callback).not.toHaveBeenCalled();

        vi.advanceTimersByTime(200);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it("fires on leading edge with immediate flag", () => {
        const callback = vi.fn();
        const debounced = debounce(callback, 200, true);

        debounced();
        expect(callback).toHaveBeenCalledTimes(1);

        // Subsequent calls within the wait period should not fire
        debounced();
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it("resets the timer on rapid calls", () => {
        const callback = vi.fn();
        const debounced = debounce(callback, 200, false);

        debounced();
        vi.advanceTimersByTime(100);
        debounced(); // resets
        vi.advanceTimersByTime(100);
        expect(callback).not.toHaveBeenCalled();

        vi.advanceTimersByTime(100);
        expect(callback).toHaveBeenCalledTimes(1);
    });
});
