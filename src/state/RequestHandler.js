import { LitState, stateVar } from "lit-element-state";

class RequestHandler extends LitState {
  static get stateVars() {
    return {
      libraries: stateVar({
        type: Object,
        defaultValue: {
          data: {},
          lastFetched: new Date(0),
        },
      }),
      rooms: stateVar({
        type: Object,
        defaultValue: {
          data: {},
          lastFetched: new Date(0),
        },
      }),
      equipment: stateVar({
        type: Object,
        defaultValue: {
          data: {},
          lastFetched: new Date(0),
        },
      }),
    };
  }

  async fetchData(url, endpoint) {
    const currentTime = new Date();
    const timeSinceLastFetch = currentTime - this[endpoint].lastFetched;
    if (timeSinceLastFetch < 60 * 1000) {
      // block requests if data was fetched less than a minute ago
      return Promise.resolve(this[endpoint].data);
    }

    try {
      const response = await fetch(url);
      const data = await response.json();
      this[endpoint].data = data;
      this[endpoint].lastFetched = currentTime;
      return Promise.resolve(this[endpoint].data);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  async createData(url, endpoint, data) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const newData = await response.json();
      this[endpoint].data.push(newData);
      return Promise.resolve(newData);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  async updateData(url, endpoint, data) {
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updatedData = await response.json();
      const index = this[endpoint].data.findIndex(
        (item) => item.id === updatedData.id
      );
      this[endpoint].data.splice(index, 1, updatedData);
      return Promise.resolve(updatedData);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  async deleteData(url, endpoint, id) {
    try {
      await fetch(url, { method: "DELETE" });
      const index = this[endpoint].data.findIndex((item) => item.id === id);
      this[endpoint].data.splice(index, 1);
      return Promise.resolve();
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }
}

export default new RequestHandler();
