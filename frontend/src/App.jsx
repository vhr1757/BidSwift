import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Auctions from "./pages/Auctions.jsx";
import AuctionDetails from "./pages/AuctionDetails.jsx";
import MyBids from "./pages/MyBids.jsx";
import Wallet from "./pages/Wallet.jsx";
import Profile from "./pages/Profile.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import SellerDashboard from "./pages/SellerDashboard.jsx";
import SellerItems from "./pages/SellerItems.jsx";
import CreateItem from "./pages/CreateItem.jsx";
import EditItem from "./pages/EditItem.jsx";
import SellerOrders from "./pages/SellerOrders.jsx";
import AuctioneerDashboard from "./pages/AuctioneerDashboard.jsx";
import AuctioneerAuctions from "./pages/AuctioneerAuctions.jsx";
import CreateAuction from "./pages/CreateAuction.jsx";
import EditAuction from "./pages/EditAuction.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminAuctions from "./pages/AdminAuctions.jsx";
import AdminItems from "./pages/AdminItems.jsx";
import AdminOrders from "./pages/AdminOrders.jsx";
import AdminBills from "./pages/AdminBills.jsx";

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
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/password"
          element={
            <ProtectedRoute>
              <ChangePassword />
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
              <AuctioneerDashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/auctioneer/auctions"
          element={
            <RoleProtectedRoute allowedRoles={["auctioneer"]}>
              <AuctioneerAuctions />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/auctioneer/auctions/create"
          element={
            <RoleProtectedRoute allowedRoles={["auctioneer"]}>
              <CreateAuction />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/auctioneer/auctions/:id/edit"
          element={
            <RoleProtectedRoute allowedRoles={["auctioneer"]}>
              <EditAuction />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminUsers />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/auctions"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminAuctions />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/items"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminItems />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminOrders />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/bills"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminBills />
            </RoleProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
