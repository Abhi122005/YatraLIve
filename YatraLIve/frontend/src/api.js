const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const parseJson = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || data.message || `Request failed with ${response.status}`);
  }
  return data;
};

export const getBuses = () => fetch(`${BASE}/buses`).then(parseJson);
export const getArrivalBoard = () => fetch(`${BASE}/arrival_board`).then(parseJson);
export const getDelayAlerts = () => fetch(`${BASE}/delay_alerts`).then(parseJson);
export const getRecentDepartures = () => fetch(`${BASE}/recent_departures`).then(parseJson);
export const getDepotConfig = () => fetch(`${BASE}/depot/config`).then(parseJson);

export const markDelayed = (id) => fetch(`${BASE}/buses/${id}/delay`, { method: 'POST' }).then(parseJson);
export const markUndelayed = (id) => fetch(`${BASE}/buses/${id}/undelay`, { method: 'POST' }).then(parseJson);

export const setDepotLocation = (lat, lng) =>
  fetch(`${BASE}/depot/location`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng })
  }).then(parseJson);

export const addBus = (busData) =>
  fetch(`${BASE}/buses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(busData)
  }).then(parseJson);

export const getManualBuses = () => fetch(`${BASE}/manual_buses`).then(parseJson);
export const addManualBus = (busData) =>
  fetch(`${BASE}/manual_buses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(busData)
  }).then(parseJson);

export const loginAdmin = (password) =>
  fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  }).then(parseJson);

export const simulateStart = () => fetch(`${BASE}/simulate/start`, { method: 'POST' }).then(parseJson);
export const simulateStop = () => fetch(`${BASE}/simulate/stop`, { method: 'POST' }).then(parseJson);
export const simulateReset = () => fetch(`${BASE}/simulate/reset`, { method: 'POST' }).then(parseJson);
