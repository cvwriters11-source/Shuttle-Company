"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapDriver = {
  id: string;
  full_name: string;
  phone: string | null;
  vehicle_label: string | null;
  lat: number;
  lng: number;
  is_online: boolean;
  updated_at: string;
};

const pin = L.divIcon({
  className: "driver-pin",
  html: "<span></span>",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function FitDrivers({ drivers }: { drivers: MapDriver[] }) {
  const map = useMap();
  const key = drivers.map((driver) => `${driver.id}:${driver.lat}:${driver.lng}`).join("|");

  useEffect(() => {
    const live = drivers.filter((driver) => driver.is_online && (driver.lat !== 0 || driver.lng !== 0));
    if (!live.length) {
      map.setView([-26.2041, 28.0473], 6);
      return;
    }
    if (live.length === 1) {
      map.setView([live[0].lat, live[0].lng], 12);
      return;
    }
    map.fitBounds(
      live.map((driver) => [driver.lat, driver.lng] as [number, number]),
      { padding: [40, 40] },
    );
  }, [key, drivers, map]);

  return null;
}

export function LiveMap({ drivers }: { drivers: MapDriver[] }) {
  const live = useMemo(
    () => drivers.filter((driver) => driver.is_online && (driver.lat !== 0 || driver.lng !== 0)),
    [drivers],
  );

  return (
    <MapContainer className="live-map" center={[-26.2041, 28.0473]} zoom={6} scrollWheelZoom>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitDrivers drivers={live} />
      {live.map((driver) => (
        <Marker key={driver.id} position={[driver.lat, driver.lng]} icon={pin}>
          <Popup>
            <strong>{driver.full_name}</strong>
            <br />
            {driver.vehicle_label || "Executive vehicle"}
            <br />
            {driver.phone}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
