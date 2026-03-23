import { create } from 'zustand';

export const useBusStore = create((set) => ({
    buses: [],
    arrivalBoard: [],
    delayAlerts: [],
    recentDepartures: [],
    depotConfig: null,
    connectionLost: false,
    consecutiveFailures: 0,

    setBuses: (buses) => set({ buses }),
    setArrivalBoard: (arrivalBoard) => set({ arrivalBoard }),
    setDelayAlerts: (delayAlerts) => set({ delayAlerts }),
    setRecentDepartures: (recentDepartures) => set({ recentDepartures }),
    setDepotConfig: (depotConfig) => set({ depotConfig }),

    incrementFailures: () => set((state) => {
        const count = state.consecutiveFailures + 1;
        return { consecutiveFailures: count, connectionLost: count >= 3 };
    }),

    resetFailures: () => set({ consecutiveFailures: 0, connectionLost: false }),
}));

export const useAuthStore = create((set) => ({
    isAuthenticated: false,
    setAuthenticated: (val) => set({ isAuthenticated: val }),
}));
