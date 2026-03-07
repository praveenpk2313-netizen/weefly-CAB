import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import polyline from "@mapbox/polyline";
import "./BookRide.css";
import LocationAutocomplete from "../components/LocationAutocomplete";
import Navbar from "../components/Navbar";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

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

// ✅ Route via OSRM (free)
async function fetchRoute(pick, drop) {
  const [plat, plng] = pick;
  const [dlat, dlng] = drop;

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

export default function BookRide() {
  const nav = useNavigate();
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");

  const [pickupLatLng, setPickupLatLng] = useState(null);
  const [dropLatLng, setDropLatLng] = useState(null);

  const [pickupLabel, setPickupLabel] = useState("");
  const [dropLabel, setDropLabel] = useState("");

  const [geoStatus, setGeoStatus] = useState("");

  const [route, setRoute] = useState(null);
  const [routeStatus, setRouteStatus] = useState(""); // "", "loading", "failed"

  const [loading, setLoading] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const [selectedCab, setSelectedCab] = useState(null);
  const [userName, setUserName] = useState("");

  const baseFare = 40;
  const rates = { Bike: 6, Auto: 10, Mini: 12, Sedan: 15, SUV: 18 };
  const vehicles = [
    { type: "Bike", seats: 1, eta: "2 min" },
    { type: "Auto", seats: 3, eta: "4 min" },
    { type: "Mini", seats: 4, eta: "5 min" },
    { type: "Sedan", seats: 4, eta: "7 min" },
    { type: "SUV", seats: 6, eta: "10 min" },
  ];

  // Removed internal user data fetching as Navbar handles it

  const showCabs = pickup.trim() && drop.trim() && pickupLatLng && dropLatLng;

  const distanceKm = useMemo(() => {
    if (!route?.distanceMeters) return null;
    return Math.max(1, Math.round(route.distanceMeters / 1000));
  }, [route]);

  const etaText = useMemo(() => {
    if (!route?.durationSeconds) return null;
    const mins = Math.max(1, Math.round(route.durationSeconds / 60));
    return `${mins} min`;
  }, [route]);

  const routeTimer = useRef(null);

  const handlePickupSelect = (label, pos) => {
    setPickup(label);
    setPickupLatLng(pos);
    setPickupLabel(label);
    setGeoStatus("");
  };

  const handleDropSelect = (label, pos) => {
    setDrop(label);
    setDropLatLng(pos);
    setDropLabel(label);
    setGeoStatus("");
  };

  const swapLocations = () => {
    // Swap labels
    const tempLabel = pickup;
    setPickup(drop);
    setDrop(tempLabel);

    // Swap LatLngs
    const tempLatLng = pickupLatLng;
    setPickupLatLng(dropLatLng);
    setDropLatLng(tempLatLng);

    // Swap Display labels
    const tempDispLabel = pickupLabel;
    setPickupLabel(dropLabel);
    setDropLabel(tempDispLabel);
  };

  useEffect(() => {
    clearTimeout(routeTimer.current);

    if (!pickupLatLng || !dropLatLng) {
      setRoute(null);
      setRouteStatus("");
      return;
    }

    setRouteStatus("loading");
    routeTimer.current = setTimeout(async () => {
      try {
        const r = await fetchRoute(pickupLatLng, dropLatLng);
        if (!r) {
          setRoute(null);
          setRouteStatus("failed");
        } else {
          setRoute(r);
          setRouteStatus("");
        }
      } catch (e) {
        setRoute(null);
        setRouteStatus("failed");
      }
    }, 300);

    return () => clearTimeout(routeTimer.current);
  }, [pickupLatLng, dropLatLng]);

  const mapFocus = pickupLatLng || dropLatLng || CHENNAI_CENTER;

  // Removed internal handleLogout and homePath as Navbar handles it

  const confirmRide = async () => {
    if (!selectedCab) return alert("Please select a cab");
    if (!route || !distanceKm) return alert("Route is not ready. Please wait...");

    try {
      setLoading(true);
      const fare = baseFare + distanceKm * rates[selectedCab];

      const res = await api.post("/booking/create", {
        phone: localStorage.getItem("phone"),
        pickup,
        drop,
        cabType: selectedCab,
        fare,
        distanceKm,
        durationMin: route?.durationSeconds
          ? Math.round(route.durationSeconds / 60)
          : null,
        pickupLatLng,
        dropLatLng,
        scheduledAt: isScheduled ? `${scheduleDate} T${scheduleTime}` : null,
      });

      const bookingId = res.data?.booking?._id;
      if (bookingId) {
        nav(`/track/${bookingId}`);
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-wrap">
      <Navbar />
      <div className="book-container">
        {/* LEFT SIDE: Map Card Section */}
        <section className="left-map-section">
          <div className="map-card">
            <MapContainer
              center={CHENNAI_CENTER}
              zoom={12}
              zoomControl={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <FlyTo
                position={mapFocus}
                zoom={pickupLatLng && dropLatLng ? 13 : 12}
              />

              {pickupLatLng && (
                <Marker position={pickupLatLng}>
                  <Popup>
                    <b>Pickup</b>
                    <div style={{ maxWidth: 220 }}>{pickupLabel || pickup}</div>
                  </Popup>
                </Marker>
              )}

              {dropLatLng && (
                <Marker position={dropLatLng}>
                  <Popup>
                    <b>Drop</b>
                    <div style={{ maxWidth: 220 }}>{dropLabel || drop}</div>
                  </Popup>
                </Marker>
              )}

              {route?.line?.length ? <Polyline positions={route.line} pathOptions={{ color: '#facc15', weight: 6, opacity: 0.9 }} /> : null}
            </MapContainer>
          </div>

          {route && distanceKm && (
            <div className="map-stats-container">
              <div className="stat-badge">
                <span className="stat-label">Distance</span>
                <span className="stat-value">{distanceKm} km</span>
              </div>
              <div className="stat-badge">
                <span className="stat-label">Est. Time</span>
                <span className="stat-value">{etaText}</span>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT SIDE: Booking Panel */}
        <aside className="right-booking-panel">
          <div className="panel-fixed-header">
            <header className="booking-header">
              <h2>Book Your Ride</h2>
              <button className="sos-btn-compact" onClick={() => alert("SOS Alert Sent!")}>
                🚨 SOS
              </button>
            </header>
          </div>

          <div className="panel-scroll-area">
            <div className="location-panel-inputs">
              <h3 className="section-heading">Plan Your Trip</h3>
              <div className="swap-button-container">
                <button className="swap-btn-circular" onClick={swapLocations} title="Swap Locations">
                  ⇅
                </button>
              </div>

              <div className="input-field-group">
                <span className="input-label">Pickup Location</span>
                <div className="input-container">
                  <span className="input-icon">📍</span>
                  <LocationAutocomplete
                    placeholder="Where to pick up?"
                    value={pickup}
                    onChange={setPickup}
                    onSelect={handlePickupSelect}
                  />
                </div>
              </div>

              <div className="input-field-group">
                <span className="input-label">Drop Location</span>
                <div className="input-container">
                  <span className="input-icon">🏁</span>
                  <LocationAutocomplete
                    placeholder="Where to drop off?"
                    value={drop}
                    onChange={setDrop}
                    onSelect={handleDropSelect}
                  />
                </div>
              </div>
            </div>

            <div className="schedule-container">
              <div className="schedule-header">
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Schedule for later?</span>
                <label className="premium-switch">
                  <input
                    type="checkbox"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>

              {isScheduled && (
                <div className="schedule-pickers">
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="vehicle-selection">
              <h3 className="section-heading">Select Your Ride</h3>
              {vehicles.map((v) => {
                const km = distanceKm || 0;
                const fare = km ? baseFare + km * rates[v.type] : "--";
                const isSelected = selectedCab === v.type;

                return (
                  <div
                    className={`vehicle-card ${isSelected ? 'selected' : ''}`}
                    key={v.type}
                    onClick={() => setSelectedCab(v.type)}
                  >
                    <div className="vehicle-info">
                      <span className="vehicle-name">{v.type}</span>
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>
                        {v.seats} seats • {isSelected ? 'Selected' : `${v.eta} away`}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className="vehicle-price">{km ? `₹${fare}` : "—"}</span>
                      {isSelected && <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: '800', letterSpacing: '0.5px' }}>BEST CHOICE</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel-fixed-footer">
            <div className="action-panel">
              <button
                className="book-now-btn"
                onClick={confirmRide}
                disabled={loading || !pickup.trim() || !drop.trim()}
              >
                {loading ? "Confirming..." : "Book Now"}
              </button>
              {routeStatus === "loading" && (
                <p className="calculating-route-text">
                  Calculating optimal route...
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
