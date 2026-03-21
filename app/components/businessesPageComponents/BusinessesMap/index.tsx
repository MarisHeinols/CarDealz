"use client";

import { Box, Paper } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { renderToString } from "react-dom/server";

type BizMarker = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  subtitle?: string;
  isTop5?: boolean;
};

export default function BusinessesMap({ markers }: { markers: BizMarker[] }) {
  const [components, setComponents] = useState<null | {
    MapContainer: React.ComponentType<any>;
    TileLayer: React.ComponentType<any>;
    Marker: React.ComponentType<any>;
    Popup: React.ComponentType<any>;
    iconTop5: any;
    iconNormal: any;
  }>(null);

  useEffect(() => {
    (async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      const { MapContainer, TileLayer, Marker, Popup } = await import("react-leaflet");
      const { default: LocationOnIcon } = await import("@mui/icons-material/LocationOn");
      
      const iconSvgTop5 = renderToString(<LocationOnIcon sx={{ color: "#9c27b0" }} fontSize="large" />);
      const iconSvgNormal = renderToString(<LocationOnIcon sx={{ color: "#757575" }} />);

      const iconTop5 = L.divIcon({
        html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;">${iconSvgTop5}</div>`,
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const iconNormal = L.divIcon({
        html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;">${iconSvgNormal}</div>`,
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      setComponents({
        MapContainer: MapContainer as React.ComponentType<any>,
        TileLayer: TileLayer as React.ComponentType<any>,
        Marker: Marker as React.ComponentType<any>,
        Popup: Popup as React.ComponentType<any>,
        iconTop5,
        iconNormal,
      });
    })();
  }, []);

  const center = useMemo(() => {
    if (!markers.length) return [56.9496, 24.1052]; // Riga fallback
    const avgLat = markers.reduce((s, m) => s + m.lat, 0) / markers.length;
    const avgLng = markers.reduce((s, m) => s + m.lng, 0) / markers.length;
    return [avgLat, avgLng];
  }, [markers]);

  if (!components) return null;
  const { MapContainer, TileLayer, Marker, Popup, iconTop5, iconNormal } = components;

  return (
    <Paper sx={{ height: 420, overflow: "hidden" }}>
      <Box sx={{ height: "100%" }}>
        <MapContainer center={center} zoom={6} style={{ height: "100%", width: "100%" }}>
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {markers.map((m) => (
            <Marker key={m.id} position={[m.lat, m.lng]} icon={m.isTop5 ? iconTop5 : iconNormal} zIndexOffset={m.isTop5 ? 1000 : 0}>
              <Popup>
                <strong>{m.name}</strong>
                {m.subtitle ? <div>{m.subtitle}</div> : null}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </Paper>
  );
}

