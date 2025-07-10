import api from "./api";

const BASE_URL = "/parking-subscription-fees";

export const createParkingSubscriptionFee = (data) => {
  return api.post(BASE_URL, data);
};

export const updateParkingSubscriptionFee = (id, data) => {
  return api.put(`${BASE_URL}/${id}`, data);
};

export const deleteParkingSubscriptionFee = (id) => {
  return api.delete(`${BASE_URL}/${id}`);
};

export const getParkingSubscriptionFeeById = (id) => {
  return api.get(`${BASE_URL}/${id}`);
};

export const getAllParkingSubscriptionFees = () => {
  return api.get(BASE_URL);
};

export const getActiveParkingSubscriptionFees = () => {
  return api.get(`${BASE_URL}/active`);
};

export const getVehicleTypes = () => {
  return api.get(`${BASE_URL}/vehicle-types`);
};

export const calculateFee = (vehicleType, count) => {
  return api.get(`${BASE_URL}/calculate`, {
    params: { vehicleType, count },
  });
}; 