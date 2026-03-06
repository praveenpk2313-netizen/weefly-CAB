import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  GoogleMap,
  LoadScript,
  Marker,
} from "@react-google-maps/api";
import Navbar from "../components/Navbar";
import "./BookRide.css"; // Reuse BookRide styles for consistency

const socket = io("http://localhost:5000");
const mapStyle = { width: "100%", height: "400px", borderRadius: "14px" };

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
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={mapStyle}
              center={driverLatLng || { lat: 13.0827, lng: 80.2707 }}
              zoom={14}
            >
              {driverLatLng && <Marker position={driverLatLng} />}
            </GoogleMap>
          </LoadScript>
        </div>
        <div className="status-text" style={{ marginTop: '20px', textAlign: 'center' }}>
          {driverLatLng ? "Tracking driver's live location..." : "Waiting for driver location..."}
        </div>
      </div>
    </div>
  );
}
