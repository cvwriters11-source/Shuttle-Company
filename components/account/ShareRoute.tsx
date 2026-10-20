"use client";

import { useState } from "react";

export function ShareRoute({ orderNumber, trackingCode, pickup, dropoff }: { orderNumber: string; trackingCode: string; pickup: string; dropoff: string }) {
  const [copied, setCopied] = useState(false);
  const path = `/track/${trackingCode}`;

  async function copyLink() {
    const url = `${window.location.origin}${path}`;
    const text = `Lion's Route order ${orderNumber}: ${pickup} → ${dropoff}. Track the driver: ${url}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy this tracking link", url);
    }
  }

  function shareWhatsApp() {
    const url = `${window.location.origin}${path}`;
    const text = `Lion's Route order ${orderNumber}: ${pickup} → ${dropoff}. Track the driver here: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noreferrer");
  }

  return (
    <div className="share-row">
      <button className="button button-orange" type="button" onClick={copyLink}>
        {copied ? "Route copied" : "Copy route link"}
      </button>
      <button className="button button-light" type="button" onClick={shareWhatsApp}>
        Share on WhatsApp
      </button>
      <a className="text-link" href={path} target="_blank" rel="noreferrer">
        Open public tracking
      </a>
    </div>
  );
}
