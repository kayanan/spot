import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_APP_URL;

export const locationService = {
  // Get all provinces
  getProvinces: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/v1/province/`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching provinces:', error);
      throw error;
    }
  },

  // Get districts by province ID
  getDistricts: async (provinceId = '') => {
    try {
      const params = provinceId ? { provinceId } : {};
      const response = await axios.get(`${BASE_URL}/v1/district/`, {
        params,
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching districts:', error);
      throw error;
    }
  },

  // Get cities by district ID
  getCities: async (districtId = '') => {
    try {
      const params = districtId ? { districtId } : {};
      const response = await axios.get(`${BASE_URL}/v1/city/`, {
        params,
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cities:', error);
      throw error;
    }
  },
}; 