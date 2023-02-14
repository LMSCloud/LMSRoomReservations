import { LitState } from "lit-element-state";

class RequestHandler extends LitState {
  static get stateVars() {
    return {
      bookings: {
        data: [],
        url: "/api/v1/contrib/roomreservations/bookings",
        lastResponse: {},
        lastFetched: new Date(0),
      },
      publicBookings: {
        data: [],
        url: "/api/v1/contrib/roomreservations/public/bookings",
        lastResponse: {},
        lastFetched: new Date(0),
      },
      equipment: {
        data: [],
        url: "/api/v1/contrib/roomreservations/equipment",
        lastResponse: {},
        lastFetched: new Date(0),
      },
      publicEquipment: {
        data: [],
        url: "/api/v1/contrib/roomreservations/public/equipment",
        lastResponse: {},
        lastFetched: new Date(0),
      },
      libraries: {
        data: [],
        url: "/api/v1/libraries",
        lastResponse: {},
        lastFetched: new Date(0),
      },
      openHours: {
        data: [],
        url: "/api/v1/contrib/roomreservations/open_hours",
        lastResponse: {},
        lastFetched: new Date(0),
      },
      publicOpenHours: {
        data: [],
        url: "/api/v1/contrib/roomreservations/public/open_hours",
        lastResponse: {},
        lastFetched: new Date(0),
      },
      rooms: {
        data: [],
        url: "/api/v1/contrib/roomreservations/rooms",
        lastResponse: {},
        lastFetched: new Date(0),
      },
      publicRooms: {
        data: [],
        url: "/api/v1/contrib/roomreservations/public/rooms",
        lastResponse: {},
        lastFetched: new Date(0),
      },
      settings: {
        data: [],
        url: "/api/v1/contrib/roomreservations/settings",
        lastResponse: {},
        lastFetched: new Date(0),
      },
      publicSettings: {
        data: [],
        url: "/api/v1/contrib/roomreservations/public/settings",
        lastResponse: {},
        lastFetched: new Date(0),
      },
    };
  }

  constructor() {
    super();
  }

  static getInstance() {
    if (!RequestHandler.instance) {
      RequestHandler.instance = new RequestHandler();
    }
    return RequestHandler.instance;
  }

  async fetchData({ endpoint, uriComponents, id, force }) {
    const currentTime = new Date();
    if (!force) {
      const timeSinceLastFetch = currentTime - this[endpoint].lastFetched;
      if (timeSinceLastFetch < 60 * 1000) {
        // block requests if data was fetched less than a minute ago
        return Promise.resolve({
          response: this[endpoint].lastResponse,
          data: this[endpoint].data,
        });
      }
    }

    try {
      const response = await fetch(
        `${this[endpoint].url}${
          uriComponents?.reduce(
            (acc, uriComponent) => `${acc}/${uriComponent}`,
            ""
          ) ?? ""
        }${id ? `/${id}` : ""}`
      );
      const data = await response.json();
      this[endpoint].data = data;
      this[endpoint].lastResponse = response;
      this[endpoint].lastFetched = currentTime;
      return Promise.resolve({
        response,
        data: this[endpoint].data,
      });
    } catch (error) {
      console.error(error);
      return Promise.reject({
        response: this[endpoint].lastResponse,
        error,
      });
    }
  }

  async createData({ endpoint, data, uriComponents, id }) {
    try {
      const response = await fetch(
        `${this[endpoint].url}${
          uriComponents?.reduce(
            (acc, uriComponent) => `${acc}/${uriComponent}`,
            ""
          ) ?? ""
        }${id ? `/${id}` : ""}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      this[endpoint].lastResponse = response;
      const newData = await response.json();

      /** If the data has zero length we need to fetch
       *  the data again */
      if (!this[endpoint].data.length) {
        await this.fetchData(endpoint);
        return Promise.resolve({
          response,
          data: this[endpoint].data,
        });
      }

      this[endpoint].data.push(newData);
      return Promise.resolve({ response, data: this[endpoint].data });
    } catch (error) {
      console.error(error);
      return Promise.reject({
        response: this[endpoint].lastResponse,
        error,
      });
    }
  }

  async updateData({ endpoint, data, uriComponents, id, compareOn }) {
    try {
      const response = await fetch(
        `${this[endpoint].url}${
          uriComponents?.reduce(
            (acc, uriComponent) => `${acc}/${uriComponent}`,
            ""
          ) ?? ""
        }${id ? `/${id}` : ""}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      this[endpoint].lastResponse = response;
      const updatedData = await response.json();

      /** If the data has zero length we need to fetch
       *  the data again */
      if (!this[endpoint].data.length) {
        await this.fetchData({ endpoint });
        return Promise.resolve({
          response,
          data: this[endpoint].data,
        });
      }

      let _compareOn = compareOn;
      if (!compareOn) {
        _compareOn = Object.keys(updatedData).find((key) =>
          key.match(/(\w+)id/g)
        );
      }
      const index = this[endpoint].data.findIndex(
        /** If _compareOn is a string we just strict equality check the updatedData
         *  at the key specified as the _compareOn variable. However, if _compareOn
         *  is an array we need to find the item in the array that matches all keys specified
         *  in the _compareOn array. If the item is found we return the index of the item
         *  in the array. If the item is not found we return -1. */
        Array.isArray(_compareOn)
          ? (item) =>
              _compareOn.every(
                (key) => item[key].toString() === updatedData[key].toString()
              )
          : (item) =>
              item[_compareOn].toString() === updatedData[_compareOn].toString()
      );
      this[endpoint].data.splice(index, 1, updatedData);
      return Promise.resolve({ response, data: updatedData });
    } catch (error) {
      console.error(error);
      return Promise.reject({
        response: this[endpoint].lastResponse,
        error,
      });
    }
  }

  async deleteData({ endpoint, uriComponents, id }) {
    try {
      const response = await fetch(
        `${this[endpoint].url}${
          uriComponents?.reduce(
            (acc, uriComponent) => `${acc}/${uriComponent}`,
            ""
          ) ?? ""
        }${id ? `/${id}` : ""}`,
        { method: "DELETE" }
      );
      this[endpoint].lastResponse = response;
      const index = this[endpoint].data.findIndex(
        (item) => item[/\w+id/] === id
      );
      this[endpoint].data.splice(index, 1);
      return Promise.resolve({ response });
    } catch (error) {
      console.error(error);
      return Promise.reject({
        response: this[endpoint].lastResponse,
        error,
      });
    }
  }
}

const requestHandler = RequestHandler.getInstance();
export default requestHandler;
