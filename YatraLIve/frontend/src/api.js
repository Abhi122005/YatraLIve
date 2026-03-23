const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getBuses = () => fetch(`${BASE}/buses`).then(r => r.json());
export const getArrivalBoard = () => fetch(`${BASE}/arrival_board`).then(r => r.json());
export const getDelayAlerts = () => fetch(`${BASE}/delay_alerts`).then(r => r.json());
export const getRecentDepartures = () => fetch(`${BASE}/recent_departures`).then(r => r.json());
export const getDepotConfig = () => fetch(`${BASE}/depot/config`).then(r => r.json());

export const markDelayed = (id) => fetch(`${BASE}/buses/${id}/delay`, { method: 'POST' }).then(r => r.json());
export const markUndelayed = (id) => fetch(`${BASE}/buses/${id}/undelay`, { method: 'POST' }).then(r => r.json());

export const setDepotLocation = (lat, lng) =>
  fetch(`${BASE}/depot/location`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng })
  }).then(r => r.json());

export const addBus = (busData) =>
  fetch(`${BASE}/buses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(busData)
  }).then(r => r.json());

export const loginAdmin = (password) =>
  fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  }).then(r => r.json());

export const simulateStart = () => fetch(`${BASE}/simulate/start`, { method: 'POST' }).then(r => r.json());
export const simulateStop = () => fetch(`${BASE}/simulate/stop`, { method: 'POST' }).then(r => r.json());
export const simulateReset = () => fetch(`${BASE}/simulate/reset`, { method: 'POST' }).then(r => r.json());
