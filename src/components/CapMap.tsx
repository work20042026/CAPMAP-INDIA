import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import type { CapEntry } from "@/lib/caps";

const iconCache: Record<string, L.DivIcon> = {};
function pinIcon(type: string) {
  if (!iconCache[type]) {
    iconCache[type] = L.divIcon({
      className: "",
      html: `<div class="cap-pin cap-pin-${type}"></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
  }
  return iconCache[type];
}

function FlyTo({ entry }: { entry: CapEntry | null }) {
  const map = useMap();
  useEffect(() => {
    if (entry) map.flyTo([entry.lat, entry.lng], 6, { duration: 0.8 });
  }, [entry, map]);
  return null;
}

export function CapMap({
  entries,
  selected,
  onSelect,
}: {
  entries: CapEntry[];
  selected: CapEntry | null;
  onSelect: (e: CapEntry) => void;
}) {
  const center = useMemo<[number, number]>(() => [22.5, 80], []);
  return (
    <MapContainer
      center={center}
      zoom={5}
      minZoom={4}
      scrollWheelZoom
      className="h-full w-full"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {entries.map((e) => (
        <Marker
          key={e.city}
          position={[e.lat, e.lng]}
          icon={pinIcon(e.type)}
          eventHandlers={{ click: () => onSelect(e) }}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">{e.city}</div>
              <div className="capitalize text-xs opacity-70">{e.type}</div>
              <button
                onClick={() => onSelect(e)}
                className="mt-2 text-xs font-medium text-primary underline"
              >
                View CAP details
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
      <FlyTo entry={selected} />
    </MapContainer>
  );
}
