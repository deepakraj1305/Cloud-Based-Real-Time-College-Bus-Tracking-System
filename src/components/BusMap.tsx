import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';

export interface RouteStop {
  id?: number;
  name: string;
  lat: number;
  lng: number;
  sequence?: number;
}

export interface BusOnMap {
  id: number;
  bus_number: string;
  route_name?: string;
  lat: number;
  lng: number;
  status?: string;
}

interface BusMapProps {
  buses?: BusOnMap[];
  stops?: RouteStop[];
  routePath?: [number, number][];
  center?: [number, number];
  zoom?: number;
  height?: string | number;
  demoMode?: boolean;
  onBusMove?: (busId: number, lat: number, lng: number) => void;
}

const busIcon = (label: string, color = '#2563eb') =>
  L.divIcon({
    className: 'bus-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    html: `
      <div style="position:relative;width:36px;height:36px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.2;animation:pulse-ring 2s infinite;"></div>
        <div style="position:absolute;inset:4px;border-radius:50%;background:${color};color:white;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">${label}</div>
      </div>`,
  });

const stopIcon = L.divIcon({
  className: 'bus-marker',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  html: `<div style="width:14px;height:14px;border-radius:50%;background:white;border:3px solid #1d4ed8;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`,
});

export default function BusMap({
  buses = [],
  stops = [],
  routePath,
  center = [12.9716, 77.5946],
  zoom = 12,
  height = 480,
  demoMode = false,
}: BusMapProps) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    const map = L.map(mapEl.current, {
      center,
      zoom,
      zoomControl: true,
      preferCanvas: true,
    });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // eslint-disable-next-line
  }, []);

  // Redraw markers when buses / stops change
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    if (routePath && routePath.length > 1) {
      L.polyline(routePath, { color: '#2563eb', weight: 4, opacity: 0.7, dashArray: '8, 8' }).addTo(layer);
    }

    stops.forEach((s, i) => {
      const marker = L.marker([s.lat, s.lng], { icon: stopIcon }).addTo(layer);
      marker.bindPopup(
        `<div style="font-family:'Space Grotesk',sans-serif;"><b>Stop ${s.sequence ?? i + 1}</b><br/>${s.name}</div>`
      );
    });

    buses.forEach((b) => {
      const marker = L.marker([b.lat, b.lng], { icon: busIcon(b.bus_number.replace(/[^0-9]/g, '').slice(-3) || 'BUS') }).addTo(layer);
      marker.bindPopup(
        `<div style="font-family:'Space Grotesk',sans-serif;min-width:160px;">
          <b>${b.bus_number}</b><br/>
          ${b.route_name ? `<span style="color:#64748b;">Route: ${b.route_name}</span><br/>` : ''}
          <span style="color:#64748b;">Status: ${b.status || 'active'}</span><br/>
          <span style="color:#64748b;font-size:11px;">${b.lat.toFixed(4)}, ${b.lng.toFixed(4)}</span>
        </div>`
      );
    });

    // Fit bounds if we have things
    const allPoints: [number, number][] = [
      ...stops.map((s) => [s.lat, s.lng] as [number, number]),
      ...buses.map((b) => [b.lat, b.lng] as [number, number]),
      ...(routePath || []),
    ];
    if (allPoints.length > 1) {
      map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40], maxZoom: 14 });
    } else if (allPoints.length === 1) {
      map.setView(allPoints[0], 14);
    }
  }, [buses, stops, routePath]);

  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div className="relative rounded-xl overflow-hidden border border-ink-200 dark:border-ink-800 shadow-sm">
      <div ref={mapEl} style={{ height: heightStyle, width: '100%' }} />
      {demoMode && (
        <div className="absolute top-3 left-3 z-[500] bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          DEMO TRACKING MODE
        </div>
      )}
    </div>
  );
}

/**
 * Hook: simulate a bus moving along a set of route points. Used by tracking
 * pages when there is no real GPS data.
 */
export function useDemoBus(
  path: [number, number][],
  opts?: { stepMs?: number; segmentSteps?: number }
) {
  const stepMs = opts?.stepMs ?? 600;
  const segmentSteps = opts?.segmentSteps ?? 20;
  const [position, setPosition] = useState<[number, number] | null>(path[0] || null);

  const flat = useMemo(() => {
    if (path.length < 2) return path;
    const out: [number, number][] = [];
    for (let i = 0; i < path.length - 1; i++) {
      const [a, b] = [path[i], path[i + 1]];
      for (let s = 0; s < segmentSteps; s++) {
        const t = s / segmentSteps;
        out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      }
    }
    out.push(path[path.length - 1]);
    return out;
  }, [path, segmentSteps]);

  useEffect(() => {
    if (flat.length < 2) return;
    let i = 0;
    setPosition(flat[0]);
    const id = setInterval(() => {
      i = (i + 1) % flat.length;
      setPosition(flat[i]);
    }, stepMs);
    return () => clearInterval(id);
  }, [flat, stepMs]);

  return position;
}
