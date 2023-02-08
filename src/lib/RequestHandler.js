/** This class should handle requests by implementing
 *  methods for each request type. It should construct
 *  based on an endpoint and take in Objects that it
 *  stringifies to the request body. It should also
 *  handle errors and return the response.
 *  @class RequestHandler
 *  @param {String} endpoint - The endpoint to send requests to.
 *  @param {Object} options - The options to send with the request.
 *  @param {String} options.method - The method to use for the request.
 *  @param {Object} options.headers - The headers to send with the request.
 *  @param {String} options.headers.Accept - The Accept header to send with the request.
 *  @param {String} options.headers.Content-Type - The Content-Type header to send with the request.
 *  @param {Object} options.body - The body to send with the request.
 */
export default class RequestHandler {
  constructor({ endpoint, options } = { endpoint: "", options: {} }) {
    this.endpoint = endpoint;
    this.options = options;
  }

  /** This method should send a request to the endpoint
   * with the options provided in the constructor.
   * @method send
   * @returns {Promise} - The response from the request.
   * @throws {Error} - If the request fails.
   * @example
   * const request = new RequestHandler("https://example.com", {
   *    method: "GET",
   *    headers: {
   *       Accept: "application/json",
   *      "Content-Type": "application/json"
   *   },
   *  body: {}
   * });
   */
  async send() {
    const response = await fetch(this.endpoint, this.options);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response;
  }

  async get() {
    this.options.method = "GET";
    return await this.send();
  }

  async post() {
    this.options.method = "POST";
    return await this.send();
  }

  async put() {
    this.options.method = "PUT";
    return await this.send();
  }

  async delete() {
    this.options.method = "DELETE";
    return await this.send();
  }
}
