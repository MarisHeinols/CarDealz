"use client";

import { Box, Paper } from "@mui/material";
import { useEffect, useState } from "react";
import type React from "react";
import { renderToString } from "react-dom/server";

export default function StoreMap() {
  const [components, setComponents] = useState<null | {
    MapContainer: React.ComponentType<any>;
    TileLayer: React.ComponentType<any>;
    Marker: React.ComponentType<any>;
    Popup: React.ComponentType<any>;
    customIcon: any;
  }>(null);

  useEffect(() => {
    (async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      const { MapContainer, TileLayer, Marker, Popup } =
        await import("react-leaflet");

      const { default: LocationOnIcon } =
        await import("@mui/icons-material/LocationOn");

      const iconSvg = renderToString(<LocationOnIcon color="primary" />);

      // Create custom MUI marker icon
      const customIcon = L.divIcon({
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
          ">
            ${iconSvg}
          </div>
        `,
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      setComponents({
        MapContainer: MapContainer as React.ComponentType<any>,
        TileLayer: TileLayer as React.ComponentType<any>,
        Marker: Marker as React.ComponentType<any>,
        Popup: Popup as React.ComponentType<any>,
        customIcon,
      });
    })();
  }, []);

  if (!components) return null;

  const { MapContainer, TileLayer, Marker, Popup, customIcon } = components;

  return (
    <Paper sx={{ height: 240, overflow: "hidden" }}>
      <Box sx={{ height: "100%" }}>
        <MapContainer
          center={[40.7128, -74.006]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={[40.7128, -74.006]} icon={customIcon}></Marker>
        </MapContainer>
      </Box>
    </Paper>
  );
}
