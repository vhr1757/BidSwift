import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Auctions from "./pages/Auctions.jsx";
import AuctionDetails from "./pages/AuctionDetails.jsx";
import MyBids from "./pages/MyBids.jsx";
import Wallet from "./pages/Wallet.jsx";
import Profile from "./pages/Profile.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/auctions"
          element={
            <ProtectedRoute>
              <Auctions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/auctions/:id"
          element={
            <ProtectedRoute>
              <AuctionDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-bids"
          element={
            <ProtectedRoute>
              <MyBids />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <Wallet />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
