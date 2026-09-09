const axios = require("axios");
const { getCached, setCached } = require("./cache.service");
const config = require("../config/env");

class PythonServiceClient {
  async fetchModelData(variable, depth, time) {
    const cacheKey = `model:${variable}:${depth}:${time}`;
    const cached = await getCached(cacheKey);
    if (cached) return cached;

    const response = await axios.get(`${config.pythonServiceUrl}/api/model-data`, {
      params: { variable, depth, time },
    });

    const data = response.data;
    await setCached(cacheKey, data);
    return data;
  }

  async fetchTimesteps(variable) {
    const cacheKey = `timesteps:${variable}`;
    const cached = await getCached(cacheKey);
    if (cached) return cached;

    const response = await axios.get(`${config.pythonServiceUrl}/api/model-data/timesteps`, {
      params: { variable },
    });

    const data = response.data;
    await setCached(cacheKey, data);
    return data;
  }
}

module.exports = new PythonServiceClient();