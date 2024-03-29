import { SchemaValidator, Table } from "./SchemaValidator";
import { locale } from "./translate";

/**
 * @property {string} url - The URL of the endpoint.
 * @property {boolean} cache - If true, cache the result of requests to this endpoint.
 * @property {boolean} ignoreCache - If true, ignore any cached data and always fetch from this endpoint.
 * @property {Object} requestInfo - Additional request info to send with fetch.
 * @property {Object} queryParams - Default query parameters to append to the URL.
 * @property {Array<string>} pathParams - Default path parameters to append to the URL.
 */
type Endpoint = {
    url?: string;
    cache?: boolean;
    ignoreCache?: boolean;
    requestInfo?: { [key in keyof RequestInit]?: RequestInit[key] };
    queryParams?: Record<string, string>;
    pathParams?: Array<string>;
};

/**
 * @property {Record<string, Endpoint>} endpoints - Group of API endpoints
 */
type ApiGroup = Record<string, Endpoint>;

/**
 * @property {ApiGroup} get - Endpoints for GET requests
 * @property {ApiGroup} post - Endpoints for POST requests
 * @property {ApiGroup} put - Endpoints for PUT requests
 * @property {ApiGroup} delete - Endpoints for DELETE requests
 */
type ApiEndpoints = {
    get: ApiGroup;
    post: ApiGroup;
    put: ApiGroup;
    delete: ApiGroup;
};

/**
 * @class
 * @description RequestHandler class handles requests to a set of configured API endpoints.
 */
class RequestHandler {
    private endpoints: ApiEndpoints;

    private schemaValidator: SchemaValidator = new SchemaValidator();

    /**
     * @constructor
     * @param {ApiEndpoints} endpoints - API endpoints
     */
    constructor(endpoints: ApiEndpoints) {
        this.endpoints = endpoints;
    }

    /**
     * @method makeRequest
     * @description Makes a request to a configured endpoint.
     * @private
     * @param {keyof ApiEndpoints} method - The HTTP method to use for the request
     * @param {string} endpoint - The name of the endpoint to request
     * @param {any} [body] - The body of the request
     * @param {Record<string, string> | string} [queryParams] - Additional query parameters to append to the URL
     * @param {Array<string>} [pathParams] - Path parameters to append to the URL
     * @throws {Error} - Throws an error if the specified endpoint is not found
     * @returns {Promise<Response>} - A promise that resolves to the fetch Response
     */
    private async makeRequest(
        method: keyof ApiEndpoints,
        endpoint: keyof ApiGroup,
        body?: unknown,
        queryParams?: Record<string, string> | string,
        pathParams?: Array<string>,
    ): Promise<Response> {
        const endpointData = this.endpoints[method][endpoint];

        if (!endpointData) {
            throw new Error(`Endpoint not found: ${endpoint}`);
        }

        if (body) {
            try {
                const schemaType = endpoint;
                if (
                    !["rooms", "bookingsPublic", "bookings", "openHours", "equipment", "settings"].includes(schemaType)
                ) {
                    throw new Error("No schema type defined for endpoint");
                }

                body = this.schemaValidator.validateAndCoerce(schemaType as Table, body);
            } catch (error: unknown) {
                if (!(error instanceof Error)) {
                    throw new Error("Unknown error");
                }

                const errorResponse = {
                    type: "zod",
                    status: 400,
                    message: "Validation failed",
                    details: error.message,
                };

                return new Response(JSON.stringify(errorResponse), {
                    status: 400, // Bad Request status code
                    headers: { "Content-Type": "application/json" },
                });
            }
        }

        let url = endpointData.url + (pathParams ? `/${pathParams.join("/")}` : "");

        // Check if the body is FormData
        const isFormData = body instanceof FormData;

        const requestInfo: RequestInit = {
            ...endpointData.requestInfo,
            headers: {
                ...(endpointData.requestInfo?.headers || {}),
                // Only set Content-Type to application/json if the body is not FormData
                ...(isFormData ? {} : { "Content-Type": "application/json" }),
            },
            method,
            // Only stringify the body if it's not FormData
            body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
        };

        let cacheMode: RequestCache;
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes("chrome")) {
            cacheMode = endpointData.ignoreCache ? "no-cache" : "no-store";
        } else if (userAgent.includes("firefox")) {
            cacheMode = endpointData.ignoreCache ? "no-cache" : "default";
        } else {
            cacheMode = endpointData.ignoreCache ? "no-cache" : endpointData.cache ? "default" : "force-cache";
        }

        requestInfo.cache = cacheMode;

        if (queryParams) {
            const searchParams = new URLSearchParams(queryParams);
            url += `?${searchParams.toString()}`;
        } else if (endpointData.queryParams) {
            const searchParams = new URLSearchParams(endpointData.queryParams);
            url += `?${searchParams.toString()}`;
        }

        const response = await fetch(url, requestInfo);
        return response;
    }

    /**
     * @method get
     * @description Makes a GET request to a configured endpoint.
     * @public
     * @param {string} endpoint - The name of the endpoint to request
     * @param {Record<string, string> | string} [queryParams] - Additional query parameters to append to the URL
     * @param {Array<string>} [pathParams] - Path parameters to append to the URL
     * @throws {Error} - Throws an error if the specified endpoint is not found
     * @returns {Promise<Response>} - A promise that resolves to the fetch Response
     */
    public async get(
        endpoint: keyof ApiGroup,
        queryParams?: Record<string, string> | string,
        pathParams?: Array<string>,
    ): Promise<Response> {
        return this.makeRequest("get", endpoint, undefined, queryParams, pathParams);
    }

    /**
     * @method post
     * @description Makes a POST request to a configured endpoint.
     * @public
     * @param {string} endpoint - The name of the endpoint to request
     * @param {any} [body] - The body of the request
     * @param {Record<string, string> | string} [queryParams] - Additional query parameters to append to the URL
     * @param {Array<string>} [pathParams] - Path parameters to append to the URL
     * @throws {Error} - Throws an error if the specified endpoint is not found
     * @returns {Promise<Response>} - A promise that resolves to the fetch Response
     */
    public async post(
        endpoint: keyof ApiGroup,
        body?: unknown,
        queryParams?: Record<string, string> | string,
        pathParams?: Array<string>,
    ): Promise<Response> {
        return this.makeRequest("post", endpoint, body, queryParams, pathParams);
    }

    /**
     * @method put
     * @description Makes a PUT request to a configured endpoint.
     * @public
     * @param {string} endpoint - The name of the endpoint to request
     * @param {any} [body] - The body of the request
     * @param {Record<string, string> | string} [queryParams] - Additional query parameters to append to the URL
     * @param {Array<string>} [pathParams] - Path parameters to append to the URL
     * @throws {Error} - Throws an error if the specified endpoint is not found
     * @returns {Promise<Response>} - A promise that resolves to the fetch Response
     */
    public async put(
        endpoint: keyof ApiGroup,
        body?: unknown,
        queryParams?: Record<string, string> | string,
        pathParams?: Array<string>,
    ): Promise<Response> {
        return this.makeRequest("put", endpoint, body, queryParams, pathParams);
    }

    /**
     * @method delete
     * @description Makes a DELETE request to a configured endpoint.
     * @public
     * @param {string} endpoint - The name of the endpoint to request
     * @param {any} [body] - The body of the request
     * @param {Record<string, string> | string} [queryParams] - Additional query parameters to append to the URL
     * @param {Array<string>} [pathParams] - Path parameters to append to the URL
     * @throws {Error} - Throws an error if the specified endpoint is not found
     * @returns {Promise<Response>} - A promise that resolves to the fetch Response
     */
    public async delete(
        endpoint: keyof ApiGroup,
        queryParams?: Record<string, string> | string,
        pathParams?: Array<string>,
    ): Promise<Response> {
        return this.makeRequest("delete", endpoint, undefined, queryParams, pathParams);
    }
}

const BASE_URL = "/api/v1/contrib/roomreservations";
const endpoints: ApiEndpoints = {
    get: {
        roomsPublic: {
            url: `${BASE_URL}/public/rooms`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        rooms: {
            url: `${BASE_URL}/rooms`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        equipmentPublic: {
            url: `${BASE_URL}/public/equipment`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        equipment: {
            url: `${BASE_URL}/equipment`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        settingsPublic: {
            url: `${BASE_URL}/public/settings`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        settings: {
            url: `${BASE_URL}/settings`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        openHoursPublic: {
            url: `${BASE_URL}/public/open_hours`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        openHours: {
            url: `${BASE_URL}/open_hours`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        bookingsPublic: {
            url: `${BASE_URL}/public/bookings`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        patronPublic: {
            url: `${BASE_URL}/public/patron`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        patronBookingsPublic: {
            url: `${BASE_URL}/public/patron/bookings`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        bookings: {
            url: `${BASE_URL}/bookings`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        // TODO: Replace librariesPublic on 22.11 w/ native endpoint
        librariesPublic: {
            url: `${BASE_URL}/public/libraries`,
            cache: false,
        },
    },
    post: {
        rooms: {
            url: `${BASE_URL}/rooms`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        equipment: {
            url: `${BASE_URL}/equipment`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        settings: {
            url: `${BASE_URL}/settings`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        openHours: {
            url: `${BASE_URL}/open_hours`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        bookingsPublic: {
            url: `${BASE_URL}/public/bookings`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        bookings: {
            url: `${BASE_URL}/bookings`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
    },
    put: {
        rooms: {
            url: `${BASE_URL}/rooms`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        equipment: {
            url: `${BASE_URL}/equipment`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        settings: {
            url: `${BASE_URL}/settings`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        openHours: {
            url: `${BASE_URL}/open_hours`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        bookings: {
            url: `${BASE_URL}/bookings`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
    },
    delete: {
        rooms: {
            url: `${BASE_URL}/rooms`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        equipment: {
            url: `${BASE_URL}/equipment`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        settings: {
            url: `${BASE_URL}/settings`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        openHours: {
            url: `${BASE_URL}/open_hours`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        patronBookingsPublic: {
            url: `${BASE_URL}/public/patron/bookings`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
        bookings: {
            url: `${BASE_URL}/bookings`,
            cache: false,
            queryParams: {
                lang: locale,
            },
        },
    },
};

export const requestHandler = new RequestHandler(endpoints);
