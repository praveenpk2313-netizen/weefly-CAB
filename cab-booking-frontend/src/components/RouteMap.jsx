import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer, Marker } from "@react-google-maps/api";
import { useState } from "react";

const containerStyle = { width: "100%", height: "320px", borderRadius: "16px" };

export default function RouteMap({ pickupLatLng, dropLatLng, onRouteReady }) {
  const [directions, setDirections] = useState(null);

  const handleDirections = (result) => {
    if (result && result.status === "OK") {
      setDirections(result);

      const leg = result.routes?.[0]?.legs?.[0];
      if (leg && onRouteReady) {
        onRouteReady({
          distanceText: leg.distance?.text,
          durationText: leg.duration?.text,
          distanceMeters: leg.distance?.value,
          durationSeconds: leg.duration?.value,
        });
      }
    }
  };

  const center = pickupLatLng || { lat: 13.0827, lng: 80.2707 }; // Chennai fallback

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
        {pickupLatLng && <Marker position={pickupLatLng} />}
        {dropLatLng && <Marker position={dropLatLng} />}

        {pickupLatLng && dropLatLng && !directions && (
          <DirectionsService
            options={{
              origin: pickupLatLng,
              destination: dropLatLng,
              travelMode: "DRIVING",
            }}
            callback={handleDirections}
          />
        )}

        {directions && <DirectionsRenderer options={{ directions }} />}
      </GoogleMap>
    </LoadScript>
  );
}
