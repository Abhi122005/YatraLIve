import threading
import time
import random
from math import cos, sin, radians
from .geofence import compute_bearing
from .bus_manager import (
    bus_states, depot_location, update_bus_position,
    check_departures, reset_all_buses, lock
)

# Starting positions for 5 simulation buses (various distances from Ernakulam depot)
SIMULATION_START_POSITIONS = {
    "KL-15-A-1234": {"lat": 9.9850, "lng": 76.3030, "desc": "~0.5 km"},
    "KL-15-B-5678": {"lat": 9.9650, "lng": 76.2850, "desc": "~2.0 km"},
    "KL-07-C-9012": {"lat": 9.9810, "lng": 76.3310, "desc": "~3.5 km"},
    "KL-15-D-3456": {"lat": 9.9360, "lng": 76.2990, "desc": "~5.0 km"},
    "KL-39-E-7890": {"lat": 10.0400, "lng": 76.2990, "desc": "~6.5 km"},
}

sim_running = False
sim_thread = None
sim_positions = {}


def init_simulation_positions():
    """Initialize simulation bus starting positions."""
    global sim_positions
    sim_positions.clear()
    for bus_number, pos in SIMULATION_START_POSITIONS.items():
        sim_positions[bus_number] = {
            "lat": pos["lat"],
            "lng": pos["lng"],
        }


def move_bus_toward_depot(bus_number: str, step_meters: float = 30.0):
    """Move a single bus closer to the depot by step_meters with some noise."""
    if bus_number not in sim_positions:
        return

    pos = sim_positions[bus_number]
    depot_lat = depot_location["lat"]
    depot_lng = depot_location["lng"]

    # Compute bearing to depot
    bearing = compute_bearing(pos["lat"], pos["lng"], depot_lat, depot_lng)

    # Add random noise ±5 meters
    noise = random.uniform(-5, 5)
    actual_step = step_meters + noise

    # Convert step from meters to degrees (approximate)
    delta_lat = (actual_step * cos(bearing)) / 111320.0
    delta_lng = (actual_step * sin(bearing)) / (111320.0 * cos(radians(pos["lat"])))

    pos["lat"] += delta_lat
    pos["lng"] += delta_lng


def simulation_tick():
    """One tick of the simulation — move all buses and update positions."""
    with lock:
        bus_number_to_id = {s["bus_number"]: bid for bid, s in bus_states.items()}

    for bus_number in list(sim_positions.keys()):
        # Move the bus
        step = random.uniform(25, 35)
        move_bus_toward_depot(bus_number, step)

        # Find the bus ID
        bus_id = bus_number_to_id.get(bus_number)
        if bus_id is not None:
            pos = sim_positions[bus_number]
            update_bus_position(bus_id, pos["lat"], pos["lng"])

    # Check for departure transitions
    check_departures()


def sim_loop():
    """Background simulation loop — runs every 2 seconds."""
    global sim_running
    while sim_running:
        try:
            simulation_tick()
        except Exception as e:
            print(f"Simulation error: {e}")
        time.sleep(2)


def start_simulation():
    """Start the simulation background thread."""
    global sim_running, sim_thread
    if sim_running:
        return {"status": "already_running"}

    init_simulation_positions()
    sim_running = True
    sim_thread = threading.Thread(target=sim_loop, daemon=True)
    sim_thread.start()
    return {"status": "started"}


def stop_simulation():
    """Stop the simulation background thread."""
    global sim_running
    sim_running = False
    return {"status": "stopped"}


def reset_simulation():
    """Reset simulation: stop, reset buses, reinitialize positions."""
    global sim_running
    sim_running = False
    time.sleep(0.5)  # Wait for sim loop to stop
    reset_all_buses()
    init_simulation_positions()
    return {"status": "reset"}
