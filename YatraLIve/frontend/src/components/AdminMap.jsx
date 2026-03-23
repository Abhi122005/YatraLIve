import React, { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const statusColors = {
    ARRIVED: '#22c55e',
    NEAR: '#eab308',
    APPROACHING: '#3b82f6',
    DELAYED: '#ef4444',
    SCHEDULED: '#6b7280',
    DEPARTED: '#9ca3af',
};

const AdminMap = ({ buses = [], depotConfig, onDepotLocationChange }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef({});
    const circlesRef = useRef([]);
    const depotMarkerRef = useRef(null);

    const clearCircles = useCallback(() => {
        circlesRef.current.forEach(c => c.remove());
        circlesRef.current = [];
    }, []);

    const drawGeofenceCircles = useCallback((map, lat, lng) => {
        const circles = [
            { radius: 800, color: '#3b82f6', label: 'Approaching (800m)' },
            { radius: 400, color: '#eab308', label: 'Near (400m)' },
            { radius: 100, color: '#22c55e', label: 'Arrived (100m)' },
        ];

        circles.forEach(({ radius, color, label }) => {
            const circle = L.circle([lat, lng], {
                radius,
                color,
                fillColor: color,
                fillOpacity: 0.06,
                weight: 2,
                dashArray: '6 4',
            }).addTo(map);
            circle.bindTooltip(label);
            circlesRef.current.push(circle);
        });
    }, []);

    // Initialize map
    useEffect(() => {
        if (mapInstanceRef.current) return;

        const lat = depotConfig?.latitude || 9.9816;
        const lng = depotConfig?.longitude || 76.2999;

        const map = L.map(mapRef.current, {
            center: [lat, lng],
            zoom: 15,
            zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;

        // Depot marker (draggable)
        const depotIcon = L.divIcon({
            className: 'depot-marker',
            html: `<div style="
        width: 24px; height: 24px; background: #f97316; border-radius: 50%;
        border: 3px solid #fff; box-shadow: 0 0 12px rgba(249,115,22,0.6);
        display: flex; align-items: center; justify-content: center;
        font-size: 12px;
      ">🏢</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
        });

        const depotMarker = L.marker([lat, lng], {
            icon: depotIcon,
            draggable: true,
        }).addTo(map);

        depotMarker.bindTooltip('Depot (drag to move)', { permanent: false });

        depotMarker.on('dragend', (e) => {
            const { lat, lng } = e.target.getLatLng();
            if (onDepotLocationChange) {
                onDepotLocationChange(lat, lng);
            }
        });

        depotMarkerRef.current = depotMarker;

        // Draw geofence circles
        drawGeofenceCircles(map, lat, lng);

        // Click to set depot location
        map.on('click', (e) => {
            depotMarker.setLatLng(e.latlng);
            if (onDepotLocationChange) {
                onDepotLocationChange(e.latlng.lat, e.latlng.lng);
            }
            clearCircles();
            drawGeofenceCircles(map, e.latlng.lat, e.latlng.lng);
        });

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    // Update depot position when config changes
    useEffect(() => {
        if (!mapInstanceRef.current || !depotConfig) return;

        const { latitude, longitude } = depotConfig;
        if (depotMarkerRef.current) {
            depotMarkerRef.current.setLatLng([latitude, longitude]);
        }
        clearCircles();
        drawGeofenceCircles(mapInstanceRef.current, latitude, longitude);
    }, [depotConfig?.latitude, depotConfig?.longitude]);

    // Update bus markers
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        const currentIds = new Set();

        buses.forEach(bus => {
            if (!bus.latitude || !bus.longitude) return;
            currentIds.add(bus.id);

            const color = statusColors[bus.status] || '#6b7280';

            const busIcon = L.divIcon({
                className: 'bus-marker-icon',
                html: `<div style="
          position: relative;
          width: 32px; height: 32px;
        ">
          <div style="
            width: 28px; height: 28px; background: ${color};
            border-radius: 6px; border: 2px solid rgba(255,255,255,0.9);
            box-shadow: 0 2px 8px ${color}80;
            display: flex; align-items: center; justify-content: center;
            font-size: 14px; transform: rotate(0deg);
          ">🚌</div>
        </div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
            });

            if (markersRef.current[bus.id]) {
                // Update existing
                markersRef.current[bus.id].setLatLng([bus.latitude, bus.longitude]);
                markersRef.current[bus.id].setIcon(busIcon);
            } else {
                // Add new
                const marker = L.marker([bus.latitude, bus.longitude], { icon: busIcon }).addTo(map);
                marker.bindTooltip(
                    `<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px;">
            <strong>${bus.bus_number}</strong><br/>
            ${bus.destination}<br/>
            <span style="color: ${color};">${bus.status}</span>
            ${bus.distance_from_depot ? `<br/>${Math.round(bus.distance_from_depot)}m` : ''}
          </div>`,
                    { direction: 'top', offset: [0, -16] }
                );
                markersRef.current[bus.id] = marker;
            }
        });

        // Remove departed markers
        Object.keys(markersRef.current).forEach(id => {
            if (!currentIds.has(Number(id))) {
                markersRef.current[id].remove();
                delete markersRef.current[id];
            }
        });
    }, [buses]);

    return (
        <div className="admin-map-container">
            <div ref={mapRef} className="admin-map" />
        </div>
    );
};

export default AdminMap;
