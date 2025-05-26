import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const fetchLayoutNames = async () => {
  const res = await axios.get(`${API_BASE_URL}/layouts`);
  return res.data;
};

export const fetchLayoutByName = async (name) => {
  const res = await axios.get(`${API_BASE_URL}/layouts/${name}`);
  if (Array.isArray(res.data.elements)) return res.data.elements;
  if (Array.isArray(res.data.coordinates)) return res.data.coordinates;
  console.warn('Unexpected layout data format:', res.data);
  return [];
};

export const saveLayout = async (name, elements) => {
  return axios.post(`${API_BASE_URL}/layouts`, { name, elements });
};

export const assignSeatToGuest = async (layoutName, seatId, guestName) => {
  return axios.post(`${API_BASE_URL}/layouts/${layoutName}/assign-seat`, {
    seatId,
    guestName,
  });
};
