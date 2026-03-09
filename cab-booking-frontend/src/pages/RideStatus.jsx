import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Navbar from "../components/Navbar";
import "./BookRide.css"; // Reuse BookRide styles for consistency

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

const apiBase = import.meta.env.VITE_API_URL || "";
const socketUrl = apiBase.replace("/api", "").replace("http://", "ws://").replace("https://", "wss://") || "http://localhost:5000";
const socket = io(socketUrl);

function FlyTo({ position, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, zoom, { duration: 1.0 });
  }, [position, zoom, map]);
  return null;
}

export default function RideStatus({ rideId }) {
  const [driverLatLng, setDriverLatLng] = useState(null);

  useEffect(() => {
    if (!rideId) return;

    socket.emit("joinRide", { rideId });

    socket.on("driverLocationUpdate", ({ lat, lng }) => {
      setDriverLatLng({ lat, lng });
    });

    return () => {
      socket.off("driverLocationUpdate");
    };
  }, [rideId]);

  return (
    <div className="book-wrap">
      <Navbar />
      <div className="book-box" style={{ marginTop: '100px' }}>
        <h1 className="book-title">Ride Status</h1>
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden', height: '400px' }}>
            <MapContainer
              center={driverLatLng ? [driverLatLng.lat, driverLatLng.lng] : [13.0827, 80.2707]}
              zoom={14}
              zoomControl={false}
              style={{ height: "100%", width: "100%", zIndex: 1 }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <FlyTo
                position={driverLatLng ? [driverLatLng.lat, driverLatLng.lng] : [13.0827, 80.2707]}
                zoom={14}
              />

              {driverLatLng && (
                <Marker position={[driverLatLng.lat, driverLatLng.lng]}>
                  <Popup><b>Driver Location</b></Popup>
                </Marker>
              )}
            </MapContainer>
        </div>
        <div className="status-text" style={{ marginTop: '20px', textAlign: 'center' }}>
          {driverLatLng ? "Tracking driver's live location..." : "Waiting for driver location..."}
        </div>
      </div>
    </div>
  );
}
