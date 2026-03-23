import React, { useState, useCallback } from 'react';
import AdminMap from '../components/AdminMap';
import { usePoll } from '../hooks/usePoll';
import {
    getBuses, getDepotConfig, markDelayed, markUndelayed,
    addBus, setDepotLocation, simulateStart, simulateStop, simulateReset
} from '../api';
import { useBusStore, useAuthStore } from '../store/busStore';

const statusColors = {
    ARRIVED: '#22c55e',
    NEAR: '#eab308',
    APPROACHING: '#3b82f6',
    DELAYED: '#ef4444',
    SCHEDULED: '#6b7280',
    DEPARTED: '#9ca3af',
};

const AdminPage = () => {
    const { buses, setBuses, depotConfig, setDepotConfig } = useBusStore();
    const { setAuthenticated } = useAuthStore();
    const [showAddBus, setShowAddBus] = useState(false);
    const [simStatus, setSimStatus] = useState('running');
    const [newBus, setNewBus] = useState({
        bus_number: '', bus_type: '', route: '', destination: '', platform: ''
    });

    // Poll buses every 3s
    usePoll(useCallback(async () => {
        const [busData, depot] = await Promise.all([
            getBuses(),
            getDepotConfig(),
        ]);
        setBuses(busData);
        setDepotConfig(depot);
    }, []), 3000);

    const handleDepotLocationChange = async (lat, lng) => {
        await setDepotLocation(lat, lng);
        const depot = await getDepotConfig();
        setDepotConfig(depot);
    };

    const handleMarkDelayed = async (busId) => {
        await markDelayed(busId);
    };

    const handleUndelay = async (busId) => {
        await markUndelayed(busId);
    };

    const handleAddBus = async (e) => {
        e.preventDefault();
        await addBus(newBus);
        setNewBus({ bus_number: '', bus_type: '', route: '', destination: '', platform: '' });
        setShowAddBus(false);
    };

    const handleSimAction = async (action) => {
        if (action === 'start') {
            await simulateStart();
            setSimStatus('running');
        } else if (action === 'stop') {
            await simulateStop();
            setSimStatus('stopped');
        } else if (action === 'reset') {
            await simulateReset();
            await simulateStart();
            setSimStatus('running');
        }
    };

    const activeBuses = buses.filter(b => b.status !== 'DEPARTED');
    const arrivedCount = buses.filter(b => b.status === 'ARRIVED').length;
    const nearCount = buses.filter(b => b.status === 'NEAR').length;
    const approachingCount = buses.filter(b => b.status === 'APPROACHING').length;
    const delayedCount = buses.filter(b => b.status === 'DELAYED').length;

    return (
        <div className="admin-page">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <span className="sidebar-logo">🚌</span>
                    <h2>KSRTC Admin</h2>
                </div>

                {/* Stats */}
                <div className="admin-stats">
                    <div className="stat-card stat-arrived">
                        <div className="stat-number">{arrivedCount}</div>
                        <div className="stat-label">Arrived</div>
                    </div>
                    <div className="stat-card stat-near">
                        <div className="stat-number">{nearCount}</div>
                        <div className="stat-label">Near</div>
                    </div>
                    <div className="stat-card stat-approaching">
                        <div className="stat-number">{approachingCount}</div>
                        <div className="stat-label">Approaching</div>
                    </div>
                    <div className="stat-card stat-delayed">
                        <div className="stat-number">{delayedCount}</div>
                        <div className="stat-label">Delayed</div>
                    </div>
                </div>

                {/* Simulation Controls */}
                <div className="admin-section">
                    <h3>🎮 Simulation</h3>
                    <div className="sim-controls">
                        <button
                            className={`sim-btn ${simStatus === 'running' ? 'active' : ''}`}
                            onClick={() => handleSimAction('start')}
                        >
                            ▶ Start
                        </button>
                        <button
                            className="sim-btn"
                            onClick={() => handleSimAction('stop')}
                        >
                            ⏸ Stop
                        </button>
                        <button
                            className="sim-btn sim-reset"
                            onClick={() => handleSimAction('reset')}
                        >
                            🔄 Reset
                        </button>
                    </div>
                </div>

                {/* Add Bus */}
                <div className="admin-section">
                    <div className="section-header">
                        <h3>🚌 Buses</h3>
                        <button className="add-btn" onClick={() => setShowAddBus(!showAddBus)}>
                            {showAddBus ? '✕' : '+ Add'}
                        </button>
                    </div>

                    {showAddBus && (
                        <form className="add-bus-form" onSubmit={handleAddBus}>
                            <input
                                type="text" placeholder="Bus Number (e.g., KL-07-X-1234)"
                                value={newBus.bus_number}
                                onChange={e => setNewBus({ ...newBus, bus_number: e.target.value })}
                                required
                            />
                            <input
                                type="text" placeholder="Bus Type"
                                value={newBus.bus_type}
                                onChange={e => setNewBus({ ...newBus, bus_type: e.target.value })}
                                required
                            />
                            <input
                                type="text" placeholder="Route (e.g., via Aluva)"
                                value={newBus.route}
                                onChange={e => setNewBus({ ...newBus, route: e.target.value })}
                                required
                            />
                            <input
                                type="text" placeholder="Destination"
                                value={newBus.destination}
                                onChange={e => setNewBus({ ...newBus, destination: e.target.value })}
                                required
                            />
                            <input
                                type="text" placeholder="Platform"
                                value={newBus.platform}
                                onChange={e => setNewBus({ ...newBus, platform: e.target.value })}
                            />
                            <button type="submit" className="submit-btn">Add Bus</button>
                        </form>
                    )}
                </div>

                {/* Bus List */}
                <div className="bus-list">
                    {activeBuses.map(bus => (
                        <div key={bus.id} className="bus-card">
                            <div className="bus-card-header">
                                <span className="bus-card-number">{bus.bus_number}</span>
                                <span
                                    className="bus-card-status"
                                    style={{ color: statusColors[bus.status] }}
                                >
                                    {bus.status}
                                </span>
                            </div>
                            <div className="bus-card-info">
                                <span>{bus.bus_type}</span>
                                <span>→ {bus.destination}</span>
                            </div>
                            {bus.distance_from_depot && (
                                <div className="bus-card-distance">
                                    📍 {Math.round(bus.distance_from_depot)}m
                                </div>
                            )}
                            <div className="bus-card-actions">
                                {bus.status !== 'DELAYED' ? (
                                    <button
                                        className="delay-btn"
                                        onClick={() => handleMarkDelayed(bus.id)}
                                    >
                                        ⚠️ Mark Delayed
                                    </button>
                                ) : (
                                    <button
                                        className="undelay-btn"
                                        onClick={() => handleUndelay(bus.id)}
                                    >
                                        ✅ Remove Delay
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Logout */}
                <button className="logout-btn" onClick={() => setAuthenticated(false)}>
                    🔓 Logout
                </button>
            </aside>

            {/* Main Content - Map */}
            <main className="admin-main">
                <div className="admin-map-header">
                    <h2>📡 Live Bus Tracking</h2>
                    <p>Click on the map to set depot location • Drag depot marker to adjust</p>
                </div>
                <AdminMap
                    buses={buses}
                    depotConfig={depotConfig}
                    onDepotLocationChange={handleDepotLocationChange}
                />
            </main>
        </div>
    );
};

export default AdminPage;
