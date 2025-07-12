import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_APP_URL;

// Get current user profile
export const getCurrentUser = async () => {
  const response = await axios.get(`${API_BASE_URL}/v1/user/current`, {
    withCredentials: true
  });
  return response.data;
};

// Update user profile
export const updateProfile = async (profileData) => {
  const response = await axios.patch(`${API_BASE_URL}/v1/user/profile`, profileData, {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

// Change password
export const changePassword = async (passwordData) => {
  const response = await axios.patch(`${API_BASE_URL}/v1/user/change-password`, passwordData, {
    withCredentials: true
  });
  return response.data;
};

// Get user by ID
export const getUserById = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/v1/user/profile/${userId}`, {
    withCredentials: true
  });
  return response.data;
}; 