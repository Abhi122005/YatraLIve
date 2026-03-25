from datetime import datetime
from typing import Dict, List, Optional
from .models import Bus, DepotConfig
from .geofence import haversine_distance, get_status
from .database import SessionLocal
import threading

# In-memory bus state for ultra-fast geofence checks
bus_states: Dict[int, dict] = {}
depot_location: dict = {"lat": 9.9816, "lng": 76.2999}
recent_departures: List[dict] = []
lock = threading.Lock()

ARRIVED_TO_DEPARTED_SECONDS = 12
DEPARTED_DISPLAY_SECONDS = 10


def init_bus_states():
    """Load all buses from DB into in-memory state on startup."""
    global depot_location
    db = SessionLocal()
    try:
        buses = db.query(Bus).all()
        for bus in buses:
            bus_states[bus.id] = {
                "id": bus.id,
                "bus_number": bus.bus_number,
                "bus_type": bus.bus_type,
                "route": bus.route,
                "destination": bus.destination,
                "platform": bus.platform or "—",
                "status": bus.status,
                "is_delayed": bus.is_delayed,
                "latitude": bus.latitude,
                "longitude": bus.longitude,
                "distance_from_depot": bus.distance_from_depot,
                "arrived_at": bus.arrived_at,
                "departed_at": bus.departed_at,
            }

        depot = db.query(DepotConfig).first()
        if depot:
            depot_location["lat"] = depot.latitude
            depot_location["lng"] = depot.longitude
    finally:
        db.close()


def update_bus_position(bus_id: int, lat: float, lng: float):
    """Update a single bus's GPS position and recalculate status."""
    with lock:
        if bus_id not in bus_states:
            return

        state = bus_states[bus_id]

        # Skip if already departed
        if state["status"] in ("DEPARTED",):
            return

        state["latitude"] = lat
        state["longitude"] = lng

        distance = haversine_distance(
            lat, lng,
            depot_location["lat"], depot_location["lng"]
        )
        state["distance_from_depot"] = round(distance, 1)

        # Auto-undelay once the bus enters the outer geofence.
        if state["is_delayed"] and distance <= 800:
            state["is_delayed"] = False

        old_status = state["status"]
        new_status = get_status(distance, state["is_delayed"])

        # Only update status if it's a forward transition or delay change
        if new_status != old_status:
            state["status"] = new_status

            if new_status == "ARRIVED" and old_status != "ARRIVED":
                state["arrived_at"] = datetime.utcnow()

        # Persist to DB
        _persist_bus(bus_id, state)


def check_departures():
    """Check for buses that should transition to DEPARTED or be removed."""
    now = datetime.utcnow()
    to_remove = []

    with lock:
        for bus_id, state in bus_states.items():
            # ARRIVED → DEPARTED after 12 seconds
            if state["status"] == "ARRIVED" and state.get("arrived_at"):
                elapsed = (now - state["arrived_at"]).total_seconds()
                if elapsed >= ARRIVED_TO_DEPARTED_SECONDS:
                    state["status"] = "DEPARTED"
                    state["departed_at"] = now
                    recent_departures.append({
                        **state,
                        "departed_at": now
                    })

        # Clean up old departures from the list
        recent_departures[:] = [
            d for d in recent_departures
            if (now - d["departed_at"]).total_seconds() < DEPARTED_DISPLAY_SECONDS
        ]

        # Remove departed buses from active state after they leave recent departures
        for bus_id, state in list(bus_states.items()):
            if state["status"] == "DEPARTED" and state.get("departed_at"):
                elapsed = (now - state["departed_at"]).total_seconds()
                if elapsed >= DEPARTED_DISPLAY_SECONDS:
                    to_remove.append(bus_id)

        for bus_id in to_remove:
            del bus_states[bus_id]


def _persist_bus(bus_id: int, state: dict):
    """Persist bus state to database."""
    db = SessionLocal()
    try:
        bus = db.query(Bus).filter(Bus.id == bus_id).first()
        if bus:
            bus.latitude = state["latitude"]
            bus.longitude = state["longitude"]
            bus.distance_from_depot = state["distance_from_depot"]
            bus.status = state["status"]
            bus.is_delayed = state["is_delayed"]
            bus.arrived_at = state.get("arrived_at")
            bus.departed_at = state.get("departed_at")
            db.commit()
    finally:
        db.close()


def get_all_buses() -> List[dict]:
    """Return all active buses."""
    with lock:
        return list(bus_states.values())


def get_arrival_board() -> List[dict]:
    """Return buses for the arrival board (non-delayed, non-departed, within geofence)."""
    with lock:
        buses = [
            b for b in bus_states.values()
            if b["status"] in ("APPROACHING", "NEAR", "ARRIVED")
        ]
        # Sort: ARRIVED first, then NEAR, then APPROACHING
        order = {"ARRIVED": 0, "NEAR": 1, "APPROACHING": 2}
        buses.sort(key=lambda b: order.get(b["status"], 3))
        return buses


def get_delay_alerts() -> List[dict]:
    """Return only delayed buses."""
    with lock:
        return [b for b in bus_states.values() if b["status"] == "DELAYED"]


def get_recent_departures_list() -> List[dict]:
    """Return recently departed buses."""
    with lock:
        return list(recent_departures)


def mark_bus_delayed(bus_id: int) -> Optional[dict]:
    """Mark a bus as delayed."""
    with lock:
        if bus_id not in bus_states:
            return None
        state = bus_states[bus_id]
        state["is_delayed"] = True
        state["status"] = "DELAYED"
        _persist_bus(bus_id, state)
        return state


def mark_bus_undelayed(bus_id: int) -> Optional[dict]:
    """Remove delay flag from a bus."""
    with lock:
        if bus_id not in bus_states:
            return None
        state = bus_states[bus_id]
        state["is_delayed"] = False
        # Recalculate status based on distance
        if state["distance_from_depot"] is not None:
            state["status"] = get_status(state["distance_from_depot"], False)
        _persist_bus(bus_id, state)
        return state


def add_bus(bus_data: dict) -> dict:
    """Add a new bus to the system."""
    db = SessionLocal()
    try:
        bus = Bus(
            bus_number=bus_data["bus_number"],
            bus_type=bus_data["bus_type"],
            route=bus_data["route"],
            destination=bus_data["destination"],
            platform=bus_data.get("platform", "—"),
            status="SCHEDULED",
        )
        db.add(bus)
        db.commit()
        db.refresh(bus)

        state = {
            "id": bus.id,
            "bus_number": bus.bus_number,
            "bus_type": bus.bus_type,
            "route": bus.route,
            "destination": bus.destination,
            "platform": bus.platform or "—",
            "status": "SCHEDULED",
            "is_delayed": False,
            "latitude": None,
            "longitude": None,
            "distance_from_depot": None,
            "arrived_at": None,
            "departed_at": None,
        }

        with lock:
            bus_states[bus.id] = state

        return state
    finally:
        db.close()


def update_depot_location(lat: float, lng: float) -> dict:
    """Update the depot location (geofence centre)."""
    global depot_location
    depot_location["lat"] = lat
    depot_location["lng"] = lng

    db = SessionLocal()
    try:
        depot = db.query(DepotConfig).first()
        if depot:
            depot.latitude = lat
            depot.longitude = lng
            db.commit()
        return depot_location
    finally:
        db.close()


def get_depot_config() -> dict:
    db = SessionLocal()
    try:
        depot = db.query(DepotConfig).first()
        if depot:
            return {
                "id": depot.id,
                "name": depot.name,
                "latitude": depot.latitude,
                "longitude": depot.longitude,
                "radius_approaching": depot.radius_approaching,
                "radius_near": depot.radius_near,
                "radius_arrived": depot.radius_arrived,
            }
        return depot_location
    finally:
        db.close()


def reset_all_buses():
    """Reset all buses to SCHEDULED status and clear recent departures."""
    global recent_departures
    db = SessionLocal()
    try:
        buses = db.query(Bus).all()
        for bus in buses:
            bus.status = "SCHEDULED"
            bus.is_delayed = False
            bus.latitude = None
            bus.longitude = None
            bus.distance_from_depot = None
            bus.arrived_at = None
            bus.departed_at = None
        db.commit()

        with lock:
            bus_states.clear()
            recent_departures.clear()

        # Reload
        for bus in buses:
            bus_states[bus.id] = {
                "id": bus.id,
                "bus_number": bus.bus_number,
                "bus_type": bus.bus_type,
                "route": bus.route,
                "destination": bus.destination,
                "platform": bus.platform or "—",
                "status": "SCHEDULED",
                "is_delayed": False,
                "latitude": None,
                "longitude": None,
                "distance_from_depot": None,
                "arrived_at": None,
                "departed_at": None,
            }
    finally:
        db.close()
