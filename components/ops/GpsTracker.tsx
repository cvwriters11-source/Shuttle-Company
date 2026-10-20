"use client";

import { useEffect, useState } from "react";
import { saveDriverLocation } from "@/app/actions/ops";

export function GpsTracker({ driverId }: { driverId: string }) {
  const [status, setStatus] = useState("Requesting phone GPS…");

  useEffect(() => {
    let watchId: number | null = null;
    let lastSent = 0;

    function goOffline() {
      const body = JSON.stringify({ lat: 0, lng: 0, is_online: false });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/ops/presence", new Blob([body], { type: "application/json" }));
        return;
      }
      void saveDriverLocation({ lat: 0, lng: 0, isOnline: false });
    }

    if (!navigator.geolocation) {
      queueMicrotask(() => setStatus("This phone does not support GPS."));
      return;
    }

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        if (now - lastSent < 8000) return;
        lastSent = now;
        setStatus("Sharing live GPS with admin");
        void saveDriverLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          heading: position.coords.heading,
          accuracy: position.coords.accuracy,
          isOnline: true,
        });
      },
      (error) => {
        setStatus(error.message || "Allow location access so admin can track this trip.");
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );

    const onHide = () => goOffline();
    window.addEventListener("pagehide", onHide);
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      window.removeEventListener("pagehide", onHide);
      goOffline();
    };
  }, [driverId]);

  return <p className="gps-banner">{status}</p>;
}
