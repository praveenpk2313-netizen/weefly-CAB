import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Otp from "./pages/Otp";
import BookRide from "./pages/BookRide";
import Driver from "./pages/Driver";
import DriverTrip from "./pages/DriverTrip";
import TripHistory from "./pages/TripHistory";
import DriverOnboarding from "./pages/DriverOnboarding";
import AdminDashboard from "./pages/AdminDashboard";

import AdminRegister from "./pages/AdminRegister";
import TrackRide from "./pages/TrackRide";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/book" element={<BookRide />} />
        <Route path="/history" element={<TripHistory />} />
        <Route path="/driver" element={<Driver />} />
        <Route path="/driver/onboarding" element={<DriverOnboarding />} />
        <Route path="/driver-trip/:id" element={<DriverTrip />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/track/:id" element={<TrackRide />} />
      </Routes>
    </BrowserRouter>
  );
}
