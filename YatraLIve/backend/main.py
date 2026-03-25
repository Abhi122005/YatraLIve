from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
import os
from sqlalchemy import inspect, text

from .database import engine, Base, SessionLocal
from .models import Bus, DepotConfig, ManualBusEntry
from .bus_manager import (
    init_bus_states, get_all_buses, get_arrival_board,
    get_delay_alerts, get_recent_departures_list,
    mark_bus_delayed, mark_bus_undelayed, add_bus,
    update_depot_location, get_depot_config
)
from .simulation import start_simulation, stop_simulation, reset_simulation

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="KSRTC Smart Terminal API",
    description="Real-Time Passenger Information System for Kerala KSRTC Bus Depots",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──── Pydantic Schemas ────

class BusCreate(BaseModel):
    bus_number: str
    bus_type: str
    route: str
    destination: str
    platform: Optional[str] = "—"


class DepotLocationUpdate(BaseModel):
    lat: float
    lng: float


class LoginRequest(BaseModel):
    password: str


class LocalizedFieldSet(BaseModel):
    ml: str
    hi: str


class ManualBusCreate(BaseModel):
    bus_number: str
    bus_type: str
    route: str
    destination: str
    status: str = "APPROACHING"
    localizedFields: dict[str, LocalizedFieldSet]


# ──── Seed Data ────

def seed_data():
    db = SessionLocal()
    try:
        # Seed depot config if empty
        if db.query(DepotConfig).count() == 0:
            depot = DepotConfig(
                name="Ernakulam KSRTC Depot",
                latitude=9.9816,
                longitude=76.2999,
                radius_approaching=800,
                radius_near=400,
                radius_arrived=100,
            )
            db.add(depot)
            db.commit()

        # Seed simulation buses if empty
        if db.query(Bus).count() == 0:
            buses = [
                Bus(
                    bus_number="KL-15-A-1234",
                    bus_type="Super Fast",
                    route="via Aluva, Thrissur",
                    destination="Kozhikode",
                    platform="1",
                    status="SCHEDULED",
                ),
                Bus(
                    bus_number="KL-15-B-5678",
                    bus_type="Super Deluxe",
                    route="via Kottayam",
                    destination="Thiruvananthapuram",
                    platform="3",
                    status="SCHEDULED",
                ),
                Bus(
                    bus_number="KL-07-C-9012",
                    bus_type="Ordinary",
                    route="via Perumbavoor",
                    destination="Muvattupuzha",
                    platform="5",
                    status="SCHEDULED",
                ),
                Bus(
                    bus_number="KL-15-D-3456",
                    bus_type="Fast Passenger",
                    route="via Alappuzha",
                    destination="Kollam",
                    platform="2",
                    status="SCHEDULED",
                ),
                Bus(
                    bus_number="KL-39-E-7890",
                    bus_type="AC Super Fast",
                    route="via Thrissur, Palakkad",
                    destination="Coimbatore",
                    platform="4",
                    status="SCHEDULED",
                ),
            ]
            db.add_all(buses)
            db.commit()
    finally:
        db.close()


def serialize_manual_bus(bus: ManualBusEntry) -> dict:
    return {
        "id": bus.id,
        "bus_number": bus.bus_number,
        "bus_type": bus.bus_type,
        "route": bus.route,
        "destination": bus.destination,
        "status": bus.status or "APPROACHING",
        "localizedFields": {
            "route": {
                "ml": bus.route_ml or bus.route,
                "hi": bus.route_hi or bus.route,
            },
            "destination": {
                "ml": bus.destination_ml or bus.destination,
                "hi": bus.destination_hi or bus.destination,
            },
        },
    }


def ensure_manual_bus_status_column():
    inspector = inspect(engine)
    columns = {column["name"] for column in inspector.get_columns("manual_bus_entries")}
    if "status" in columns:
        return

    with engine.begin() as connection:
        connection.execute(
            text("ALTER TABLE manual_bus_entries ADD COLUMN status VARCHAR NOT NULL DEFAULT 'APPROACHING'")
        )


# ──── Startup ────

@app.on_event("startup")
async def startup():
    seed_data()
    ensure_manual_bus_status_column()
    init_bus_states()
    start_simulation()


# ──── API Routes ────

@app.get("/")
async def root():
    return {"message": "KSRTC Smart Terminal API", "version": "1.0.0"}


@app.get("/buses")
async def list_buses():
    """Get all active buses with their current status and positions."""
    return get_all_buses()


@app.get("/arrival_board")
async def arrival_board():
    """Get buses for the arrival display board."""
    return get_arrival_board()


@app.get("/delay_alerts")
async def delay_alerts():
    """Get delayed buses."""
    return get_delay_alerts()


@app.get("/recent_departures")
async def recent_departures():
    """Get recently departed buses."""
    return get_recent_departures_list()


@app.post("/buses")
async def create_bus(bus: BusCreate):
    """Add a new bus to the system."""
    try:
        new_bus = add_bus(bus.dict())
        return new_bus
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/manual_buses")
async def list_manual_buses():
    db = SessionLocal()
    try:
        buses = db.query(ManualBusEntry).order_by(ManualBusEntry.created_at.asc()).all()
        return [serialize_manual_bus(bus) for bus in buses]
    finally:
        db.close()


@app.post("/manual_buses")
async def create_manual_bus(bus: ManualBusCreate):
    db = SessionLocal()
    try:
        existing = db.query(ManualBusEntry).filter(ManualBusEntry.bus_number == bus.bus_number).first()
        if existing:
            existing.bus_type = bus.bus_type
            existing.route = bus.route
            existing.destination = bus.destination
            existing.status = bus.status
            existing.route_ml = bus.localizedFields["route"].ml
            existing.route_hi = bus.localizedFields["route"].hi
            existing.destination_ml = bus.localizedFields["destination"].ml
            existing.destination_hi = bus.localizedFields["destination"].hi
            db.commit()
            db.refresh(existing)
            return serialize_manual_bus(existing)

        manual_bus = ManualBusEntry(
            bus_number=bus.bus_number,
            bus_type=bus.bus_type,
            route=bus.route,
            destination=bus.destination,
            status=bus.status,
            route_ml=bus.localizedFields["route"].ml,
            route_hi=bus.localizedFields["route"].hi,
            destination_ml=bus.localizedFields["destination"].ml,
            destination_hi=bus.localizedFields["destination"].hi,
        )
        db.add(manual_bus)
        db.commit()
        db.refresh(manual_bus)
        return serialize_manual_bus(manual_bus)
    finally:
        db.close()


@app.post("/buses/{bus_id}/delay")
async def delay_bus(bus_id: int):
    """Mark a bus as delayed."""
    result = mark_bus_delayed(bus_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Bus not found")
    return result


@app.post("/buses/{bus_id}/undelay")
async def undelay_bus(bus_id: int):
    """Remove delay flag from a bus."""
    result = mark_bus_undelayed(bus_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Bus not found")
    return result


@app.get("/depot/config")
async def depot_config():
    """Get depot configuration including geofence radii."""
    return get_depot_config()


@app.put("/depot/location")
async def set_depot_location(data: DepotLocationUpdate):
    """Update depot location (geofence centre)."""
    return update_depot_location(data.lat, data.lng)


@app.post("/simulate/start")
async def sim_start():
    """Start the GPS simulation."""
    return start_simulation()


@app.post("/simulate/stop")
async def sim_stop():
    """Stop the GPS simulation."""
    return stop_simulation()


@app.post("/simulate/reset")
async def sim_reset():
    """Reset all buses to starting positions."""
    return reset_simulation()


@app.post("/auth/login")
async def login(data: LoginRequest):
    """Simple depot admin authentication."""
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "ksrtc2024")
    if data.password == ADMIN_PASSWORD:
        return {"success": True, "message": "Authenticated"}
    raise HTTPException(status_code=401, detail="Invalid password")


# Serve frontend static files (production)
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
