from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from .database import Base
from datetime import datetime


class Bus(Base):
    __tablename__ = "buses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    bus_number = Column(String, unique=True, nullable=False)
    bus_type = Column(String, nullable=False)  # e.g., "Super Fast", "Ordinary"
    route = Column(String, nullable=False)      # e.g., "via Aluva, Thrissur"
    destination = Column(String, nullable=False)
    platform = Column(String, nullable=True)
    status = Column(String, default="SCHEDULED")  # SCHEDULED, APPROACHING, NEAR, ARRIVED, DEPARTED, DELAYED, CANCELLED
    is_delayed = Column(Boolean, default=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    distance_from_depot = Column(Float, nullable=True)  # in metres
    arrived_at = Column(DateTime, nullable=True)
    departed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DepotConfig(Base):
    __tablename__ = "depot_config"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="Ernakulam KSRTC Depot")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius_approaching = Column(Integer, default=800)   # metres
    radius_near = Column(Integer, default=400)           # metres
    radius_arrived = Column(Integer, default=100)        # metres
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
