import { initialMockBuses } from './mockData';

// Haversine formula (Distance in meters)
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// Compute bearing toward depot
function getBearing(lat1, lon1, lat2, lon2) {
    const λ1 = lon1 * Math.PI / 180;
    const λ2 = lon2 * Math.PI / 180;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;

    const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    const brng = Math.atan2(y, x);
    return brng;
}

// Determine status based on distance
function determineStatus(distanceMeters, isDelayed, radii) {
    if (isDelayed && distanceMeters > radii.approaching) return 'DELAYED';
    if (distanceMeters <= radii.arrived) return 'ARRIVED';
    if (distanceMeters <= radii.near) return 'NEAR';
    if (distanceMeters <= radii.approaching) return 'APPROACHING';
    return 'SCHEDULED';
}

function getPositionAtDistance(depotLat, depotLng, distanceMeters) {
    const latOffset = distanceMeters / 111320.0;
    return {
        latitude: depotLat + latOffset,
        longitude: depotLng,
    };
}

function getManualBusInitialState(busData, depotLat, depotLng, radii) {
    const selectedStatus = (busData.status || 'APPROACHING').toUpperCase();
    const targetDistanceByStatus = {
        ARRIVED: Math.max(10, Math.min(radii.arrived - 10, radii.arrived)),
        NEAR: Math.max(radii.arrived + 10, Math.min(radii.near - 10, radii.near - 20)),
        APPROACHING: Math.max(radii.near + 10, Math.min(radii.approaching - 10, radii.approaching - 20)),
        DELAYED: radii.approaching + 100,
    };
    const distance = targetDistanceByStatus[selectedStatus] ?? radii.approaching - 20;
    const position = getPositionAtDistance(depotLat, depotLng, distance);

    return {
        status: selectedStatus,
        is_delayed: selectedStatus === 'DELAYED',
        distance: Math.round(distance),
        latitude: position.latitude,
        longitude: position.longitude,
        arrivedAt: selectedStatus === 'ARRIVED' ? Date.now() : null,
        departedAt: null,
    };
}

export class Simulation {
    constructor(depotLat, depotLng, radii = { arrived: 100, near: 400, approaching: 800 }) {
        this.depotLat = depotLat;
        this.depotLng = depotLng;
        this.radii = radii;
        this.buses = JSON.parse(JSON.stringify(initialMockBuses)); // Deep copy
        this.departed = []; // Store recently departed buses
        this.intervalId = null;
        this.onUpdate = null; // Callback for React state updates
        this.nextManualBusId = Math.max(0, ...this.buses.map(bus => bus.id || 0)) + 1;
    }

    start(onUpdate) {
        this.onUpdate = onUpdate;
        if (this.intervalId) clearInterval(this.intervalId);

        // Run simulation tick every 2 seconds
        this.intervalId = setInterval(() => this.tick(), 2000);
        this.tick(); // Initial tick
    }

    stop() {
        if (this.intervalId) clearInterval(this.intervalId);
    }

    tick() {
        const now = Date.now();
        let busesToRemove = [];

        this.buses.forEach(bus => {
            if (bus.status === 'DEPARTED') {
                if (now - bus.departedAt > 10000) {  // Remove after 10 seconds of being DEPARTED
                    busesToRemove.push(bus.id);
                }
                return;
            }

            // Move bus closer if not already arrived
            if (bus.status !== 'ARRIVED') {
                // Move 30 meters approx + noise toward depot
                const step = 30 + (Math.random() * 10 - 5);
                const bearing = getBearing(bus.latitude, bus.longitude, this.depotLat, this.depotLng);

                const dLat = (step * Math.cos(bearing)) / 111320.0;
                const dLng = (step * Math.sin(bearing)) / (111320.0 * Math.cos(bus.latitude * Math.PI / 180));

                bus.latitude += dLat;
                bus.longitude += dLng;
            }

            const dist = getDistance(bus.latitude, bus.longitude, this.depotLat, this.depotLng);
            bus.distance = Math.round(dist);

            if (bus.is_delayed && dist <= this.radii.approaching) {
                bus.is_delayed = false;
            }

            const oldStatus = bus.status;
            bus.status = determineStatus(dist, bus.is_delayed, this.radii);

            // Handle State Transitions
            if (oldStatus !== 'ARRIVED' && bus.status === 'ARRIVED') {
                bus.arrivedAt = now;
            }

            if (bus.status === 'ARRIVED') {
                if (now - bus.arrivedAt > 12000) { // After 12s of ARRIVED -> move to DEPARTED
                    bus.status = 'DEPARTED';
                    bus.departedAt = now;
                    // Push to separate collection for Recent Departures table
                    this.departed.push({ ...bus });
                }
            }
        });

        // Cleanup deeply departed buses
        this.buses = this.buses.filter(b => !busesToRemove.includes(b.id));

        // Cleanup recent departures table (Remove after 10 secs being departed)
        this.departed = this.departed.filter(b => now - b.departedAt <= 10000);

        if (this.onUpdate) {
            this.onUpdate([...this.buses], [...this.departed]);
        }
    }

    addManualBus(busData) {
        const existingBus = this.buses.find(bus => bus.bus_number === busData.bus_number);
        const manualState = getManualBusInitialState(busData, this.depotLat, this.depotLng, this.radii);
        if (existingBus) {
            existingBus.bus_type = busData.bus_type;
            existingBus.route = busData.route;
            existingBus.destination = busData.destination;
            existingBus.localizedFields = busData.localizedFields || existingBus.localizedFields || null;
            existingBus.status = manualState.status;
            existingBus.is_delayed = manualState.is_delayed;
            existingBus.distance = manualState.distance;
            existingBus.latitude = manualState.latitude;
            existingBus.longitude = manualState.longitude;
            existingBus.arrivedAt = manualState.arrivedAt;
            existingBus.departedAt = manualState.departedAt;
            existingBus.isManualEntry = true;
            if (this.onUpdate) {
                this.onUpdate([...this.buses], [...this.departed]);
            }
            return existingBus;
        }

        const manualBus = {
            id: this.nextManualBusId++,
            bus_number: busData.bus_number,
            bus_type: busData.bus_type,
            route: busData.route,
            destination: busData.destination,
            localizedFields: busData.localizedFields || null,
            status: manualState.status,
            is_delayed: manualState.is_delayed,
            latitude: manualState.latitude,
            longitude: manualState.longitude,
            distance: manualState.distance,
            arrivedAt: manualState.arrivedAt,
            departedAt: manualState.departedAt,
            isManualEntry: true,
        };

        this.buses.push(manualBus);

        if (this.onUpdate) {
            this.onUpdate([...this.buses], [...this.departed]);
        }

        return manualBus;
    }
}
