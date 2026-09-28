import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Auctions from "./pages/Auctions.jsx";
import AuctionDetails from "./pages/AuctionDetails.jsx";
import MyBids from "./pages/MyBids.jsx";
import Wallet from "./pages/Wallet.jsx";
import Profile from "./pages/Profile.jsx";
import SellerDashboard from "./pages/SellerDashboard.jsx";
import SellerItems from "./pages/SellerItems.jsx";
import CreateItem from "./pages/CreateItem.jsx";
import EditItem from "./pages/EditItem.jsx";
import SellerOrders from "./pages/SellerOrders.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RoleProtectedRoute from "./components/RoleProtectedRoute.jsx";

function AuctioneerPlaceholder() {
  return <h1>Auctioneer Area</h1>;
}

function AdminPlaceholder() {
  return <h1>Admin Area</h1>;
}

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

        <Route
          path="/seller"
          element={
            <RoleProtectedRoute allowedRoles={["seller"]}>
              <SellerDashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/seller/items"
          element={
            <RoleProtectedRoute allowedRoles={["seller"]}>
              <SellerItems />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/seller/items/create"
          element={
            <RoleProtectedRoute allowedRoles={["seller"]}>
              <CreateItem />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/seller/items/:id/edit"
          element={
            <RoleProtectedRoute allowedRoles={["seller"]}>
              <EditItem />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/seller/orders"
          element={
            <RoleProtectedRoute allowedRoles={["seller"]}>
              <SellerOrders />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/auctioneer"
          element={
            <RoleProtectedRoute allowedRoles={["auctioneer"]}>
              <AuctioneerPlaceholder />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminPlaceholder />
            </RoleProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
