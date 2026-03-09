import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import polyline from "@mapbox/polyline";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix default icon issues with Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const CHENNAI_CENTER = [13.0827, 80.2707];

function FlyTo({ position, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, zoom, { duration: 1.0 });
  }, [position, zoom, map]);
  return null;
}

async function fetchRoute(pick, drop) {
  const [plat, plng] = Array.isArray(pick) ? pick : [pick.lat, pick.lng];
  const [dlat, dlng] = Array.isArray(drop) ? drop : [drop.lat, drop.lng];

  const url = `https://router.project-osrm.org/route/v1/driving/${plng},${plat};${dlng},${dlat}?overview=full&geometries=polyline`;

  const res = await fetch(url);
  const json = await res.json();

  if (json.code !== "Ok" || !json.routes?.[0]) return null;

  const r = json.routes[0];
  const coords = polyline.decode(r.geometry).map(([lat, lng]) => [lat, lng]);

  return {
    distanceMeters: r.distance,
    durationSeconds: r.duration,
    line: coords,
  };
}

export default function RouteMap({ pickupLatLng, dropLatLng, onRouteReady }) {
  const [routeLine, setRouteLine] = useState(null);

  // Normalize lat/lng to arrays for Leaflet
  const pick = useMemo(() => {
    if (!pickupLatLng) return null;
    return Array.isArray(pickupLatLng) ? pickupLatLng : [pickupLatLng.lat, pickupLatLng.lng];
  }, [pickupLatLng]);

  const drop = useMemo(() => {
    if (!dropLatLng) return null;
    return Array.isArray(dropLatLng) ? dropLatLng : [dropLatLng.lat, dropLatLng.lng];
  }, [dropLatLng]);

  useEffect(() => {
    if (!pick || !drop) return;

    fetchRoute(pick, drop).then(r => {
      if (r) {
        setRouteLine(r.line);
        if (onRouteReady) {
            onRouteReady({
                distanceMeters: r.distanceMeters,
                durationSeconds: r.durationSeconds
            });
        }
      }
    });
  }, [pick, drop, onRouteReady]);

  const center = pick || CHENNAI_CENTER;

  return (
    <div style={{ width: "100%", height: "320px", borderRadius: "16px", overflow: "hidden" }}>
      <MapContainer
        center={center}
        zoom={12}
        zoomControl={false}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyTo
          position={center}
          zoom={pick && drop ? 13 : 12}
        />

        {pick && (
          <Marker position={pick}>
            <Popup><b>Pickup</b></Popup>
          </Marker>
        )}

        {drop && (
          <Marker position={drop}>
            <Popup><b>Drop</b></Popup>
          </Marker>
        )}

        {routeLine && routeLine.length > 0 && (
          <Polyline positions={routeLine} pathOptions={{ color: '#facc15', weight: 6, opacity: 0.9 }} />
        )}
      </MapContainer>
    </div>
  );
}
