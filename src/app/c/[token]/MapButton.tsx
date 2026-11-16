"use client";
import { useEffect, useState } from "react";

export default function MapButton({ address }: { address: string }) {
  const q = encodeURIComponent(address);
  const google = `https://www.google.com/maps/search/?api=1&query=${q}`;
  const apple = `https://maps.apple.com/?q=${q}`;
  const waze = `https://waze.com/ul?q=${q}&navigate=yes`;
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setIos(/iphone|ipad|ipod|macintosh/i.test(navigator.userAgent) && "ontouchend" in document);
  }, []);

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <a href={ios ? apple : google} target="_blank" rel="noopener" className="btn-primary px-4 py-2 text-sm">
        🗺️ Como chegar
      </a>
      <a href={ios ? google : waze} target="_blank" rel="noopener" className="btn-ghost px-4 py-2 text-sm">
        {ios ? "Google Maps" : "Waze"}
      </a>
    </div>
  );
}
