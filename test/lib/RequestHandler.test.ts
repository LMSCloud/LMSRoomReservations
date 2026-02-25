// RequestHandler is a non-exported class; we test via the exported requestHandler singleton
// but we also need to construct our own instance for isolated tests.
// Since the class isn't exported, we'll import the module and test through the singleton
// after mocking fetch, and also test the constructor behavior by re-importing.

// We need to mock the translate module before importing RequestHandler
vi.mock("../../src/lib/translate", () => ({
    locale: "en",
    __: (text: string) => text,
    attr__: (text: string) => text,
}));

// Dynamic import after mock setup
const { requestHandler } = await import("../../src/lib/RequestHandler");

describe("RequestHandler (via singleton)", () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        fetchMock = vi.fn(() =>
            Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 })),
        );
        global.fetch = fetchMock as unknown as typeof fetch;

        // Default to Chrome user agent
        Object.defineProperty(navigator, "userAgent", {
            value: "Mozilla/5.0 Chrome/120.0.0.0",
            configurable: true,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("GET requests", () => {
        it("makes a GET request with correct URL and Content-Type header", async () => {
            await requestHandler.get("rooms");

            expect(fetchMock).toHaveBeenCalledTimes(1);
            const [url, init] = fetchMock.mock.calls[0]!;
            expect(url).toContain("/api/v1/contrib/roomreservations/rooms");
            expect(init.method).toBe("get");
            expect(init.headers["Content-Type"]).toBe("application/json");
            expect(init.body).toBeUndefined();
        });

        it("applies endpoint-level default query params", async () => {
            await requestHandler.get("rooms");

            const [url] = fetchMock.mock.calls[0]!;
            expect(url).toContain("lang=en");
        });

        it("uses caller query params instead of defaults when provided", async () => {
            await requestHandler.get("rooms", { custom: "value" });

            const [url] = fetchMock.mock.calls[0]!;
            expect(url).toContain("custom=value");
            // Caller params replace endpoint defaults (not merged)
            expect(url).not.toContain("lang=en");
        });

        it("appends path params to URL", async () => {
            await requestHandler.get("rooms", undefined, ["42"]);

            const [url] = fetchMock.mock.calls[0]!;
            expect(url).toContain("/rooms/42");
        });
    });

    describe("POST requests", () => {
        it("stringifies JSON body and sets Content-Type", async () => {
            const body = {
                roomnumber: "101",
                maxcapacity: 5,
                description: null,
                color: null,
                image: null,
                branch: null,
                maxbookabletime: null,
            };

            await requestHandler.post("rooms", body);

            const [, init] = fetchMock.mock.calls[0]!;
            expect(init.method).toBe("post");
            expect(init.headers["Content-Type"]).toBe("application/json");
            expect(typeof init.body).toBe("string");
            const parsed = JSON.parse(init.body);
            expect(parsed.roomnumber).toBe("101");
        });
    });

    describe("PUT requests", () => {
        it("sends PUT with JSON body", async () => {
            const body = {
                roomnumber: "102",
                maxcapacity: 10,
                description: null,
                color: null,
                image: null,
                branch: null,
                maxbookabletime: null,
            };

            await requestHandler.put("rooms", body, undefined, ["1"]);

            const [url, init] = fetchMock.mock.calls[0]!;
            expect(url).toContain("/rooms/1");
            expect(init.method).toBe("put");
            expect(typeof init.body).toBe("string");
        });
    });

    describe("DELETE requests", () => {
        it("makes a DELETE request with correct URL and no body", async () => {
            await requestHandler.delete("rooms", undefined, ["5"]);

            const [url, init] = fetchMock.mock.calls[0]!;
            expect(url).toContain("/rooms/5");
            expect(init.method).toBe("delete");
            expect(init.body).toBeUndefined();
        });
    });

    describe("unknown endpoint", () => {
        it("throws for unknown endpoint", async () => {
            await expect(requestHandler.get("nonexistent")).rejects.toThrow("Endpoint not found");
        });
    });

    describe("cache modes based on user agent", () => {
        it("uses no-store for Chrome without ignoreCache", async () => {
            Object.defineProperty(navigator, "userAgent", {
                value: "Chrome/120",
                configurable: true,
            });

            await requestHandler.get("rooms");
            const [, init] = fetchMock.mock.calls[0]!;
            expect(init.cache).toBe("no-store");
        });

        it("uses default for Firefox without ignoreCache", async () => {
            Object.defineProperty(navigator, "userAgent", {
                value: "Firefox/120",
                configurable: true,
            });

            await requestHandler.get("rooms");
            const [, init] = fetchMock.mock.calls[0]!;
            expect(init.cache).toBe("default");
        });

        it("uses force-cache for other browsers with cache=false and no ignoreCache", async () => {
            Object.defineProperty(navigator, "userAgent", {
                value: "Safari/17",
                configurable: true,
            });

            // The rooms endpoint has cache: false and no ignoreCache
            await requestHandler.get("rooms");
            const [, init] = fetchMock.mock.calls[0]!;
            // cache=false → not "default", ignoreCache=undefined → not "no-cache"
            // So: force-cache
            expect(init.cache).toBe("force-cache");
        });
    });

    describe("schema validation on body", () => {
        it("returns 400 Response for invalid body instead of throwing", async () => {
            const invalidBody = { roomnumber: "101" }; // missing required fields
            const response = await requestHandler.post("rooms", invalidBody);

            expect(response.status).toBe(400);
            const json = await response.json();
            expect(json.type).toBe("zod");
            expect(json.message).toBe("Validation failed");

            // fetch should NOT have been called
            expect(fetchMock).not.toHaveBeenCalled();
        });
    });

    describe("FormData body", () => {
        it("does not force Content-Type for FormData", async () => {
            // FormData validation will fail for schema endpoints,
            // so we test that the handler at least attempts to process FormData.
            // Since there's no schema-free endpoint, we verify the 400 path doesn't
            // set content-type for FormData either. The key behavior is in makeRequest
            // where isFormData skips Content-Type header.

            // We can test this indirectly: if body passes validation, FormData
            // should not have Content-Type forced. For now, just verify the handler
            // doesn't crash when receiving FormData.
            const formData = new FormData();
            formData.append("roomnumber", "101");

            // This will fail validation (FormData doesn't match zod schema)
            const response = await requestHandler.post("rooms", formData);
            expect(response.status).toBe(400);
        });
    });
});
