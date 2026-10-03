import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../services/api.js";

import Navbar from "../components/Navbar.jsx";

import "./AdminDashboard.css";

function AdminDashboard() {
  const [statistics, setStatistics] = useState({
    buyers: 0,
    sellers: 0,
    auctioneers: 0,
    admins: 0,

    totalItems: 0,

    totalAuctions: 0,
    scheduledAuctions: 0,
    activeAuctions: 0,
    completedAuctions: 0,
    cancelledAuctions: 0,

    totalOrders: 0,

    totalBills: 0,
    paidBills: 0,
    pendingBills: 0,
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const storedUser = localStorage.getItem("user");

  let user = null;

  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      user = null;
    }
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        setError("");

        const [
          buyersData,
          sellersData,
          auctioneersData,
          adminsData,
          itemsData,
          auctionsData,
          ordersData,
          billsData,
        ] = await Promise.all([
          apiRequest("/buyers"),

          apiRequest("/sellers"),

          apiRequest("/auctioneers"),

          apiRequest("/admins"),

          apiRequest("/items"),

          apiRequest("/auctions"),

          apiRequest("/orders"),

          apiRequest("/bills"),
        ]);

        const buyers = Array.isArray(buyersData)
          ? buyersData
          : buyersData.buyers || [];

        const sellers = Array.isArray(sellersData)
          ? sellersData
          : sellersData.sellers || [];

        const auctioneers = Array.isArray(auctioneersData)
          ? auctioneersData
          : auctioneersData.auctioneers || [];

        const admins = Array.isArray(adminsData)
          ? adminsData
          : adminsData.admins || [];

        const items = Array.isArray(itemsData)
          ? itemsData
          : itemsData.items || [];

        const auctions = Array.isArray(auctionsData)
          ? auctionsData
          : auctionsData.auctions || [];

        const orders = Array.isArray(ordersData)
          ? ordersData
          : ordersData.orders || [];

        const bills = Array.isArray(billsData)
          ? billsData
          : billsData.bills || [];

        const scheduledAuctions = auctions.filter(
          (auction) => auction.status === "scheduled",
        ).length;

        const activeAuctions = auctions.filter(
          (auction) => auction.status === "active",
        ).length;

        const completedAuctions = auctions.filter(
          (auction) => auction.status === "completed",
        ).length;

        const cancelledAuctions = auctions.filter(
          (auction) => auction.status === "cancelled",
        ).length;

        const paidBills = bills.filter(
          (bill) => bill.payment_status === "paid",
        ).length;

        const pendingBills = bills.filter(
          (bill) => bill.payment_status === "pending",
        ).length;

        setStatistics({
          buyers: buyers.length,

          sellers: sellers.length,

          auctioneers: auctioneers.length,

          admins: admins.length,

          totalItems: items.length,

          totalAuctions: auctions.length,

          scheduledAuctions,

          activeAuctions,

          completedAuctions,

          cancelledAuctions,

          totalOrders: orders.length,

          totalBills: bills.length,

          paidBills,

          pendingBills,
        });
      } catch (error) {
        console.error("Failed to fetch admin dashboard data:", error);

        setError(error.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalUsers =
    statistics.buyers +
    statistics.sellers +
    statistics.auctioneers +
    statistics.admins;

  return (
    <div className="admin-dashboard">
      <Navbar />

      <main className="admin-dashboard-content">
        <section className="admin-welcome">
          <div>
            <p className="admin-dashboard-label">Admin Dashboard</p>

            <h1>Welcome, {user?.first_name || "Admin"}!</h1>

            <p>Monitor and manage the BidSwift auction platform.</p>
          </div>
        </section>

        {error && <div className="admin-dashboard-error">{error}</div>}

        <section className="admin-section">
          <h2 className="admin-section-title">Users</h2>

          <div className="admin-stat-grid">
            <div className="admin-stat-card">
              <span className="admin-stat-label">Total Users</span>

              <strong>{loading ? "—" : totalUsers}</strong>
            </div>

            <div className="admin-stat-card">
              <span className="admin-stat-label">Buyers</span>

              <strong>{loading ? "—" : statistics.buyers}</strong>
            </div>

            <div className="admin-stat-card">
              <span className="admin-stat-label">Sellers</span>

              <strong>{loading ? "—" : statistics.sellers}</strong>
            </div>

            <div className="admin-stat-card">
              <span className="admin-stat-label">Auctioneers</span>

              <strong>{loading ? "—" : statistics.auctioneers}</strong>
            </div>

            <div className="admin-stat-card">
              <span className="admin-stat-label">Admins</span>

              <strong>{loading ? "—" : statistics.admins}</strong>
            </div>
          </div>
        </section>

        <section className="admin-section">
          <h2 className="admin-section-title">Platform Overview</h2>

          <div className="admin-stat-grid">
            <div className="admin-stat-card">
              <span className="admin-stat-label">Total Items</span>

              <strong>{loading ? "—" : statistics.totalItems}</strong>
            </div>

            <div className="admin-stat-card">
              <span className="admin-stat-label">Total Auctions</span>

              <strong>{loading ? "—" : statistics.totalAuctions}</strong>
            </div>

            <div className="admin-stat-card">
              <span className="admin-stat-label">Active Auctions</span>

              <strong>{loading ? "—" : statistics.activeAuctions}</strong>
            </div>

            <div className="admin-stat-card">
              <span className="admin-stat-label">Completed Auctions</span>

              <strong>{loading ? "—" : statistics.completedAuctions}</strong>
            </div>

            <div className="admin-stat-card">
              <span className="admin-stat-label">Total Orders</span>

              <strong>{loading ? "—" : statistics.totalOrders}</strong>
            </div>

            <div className="admin-stat-card">
              <span className="admin-stat-label">Total Bills</span>

              <strong>{loading ? "—" : statistics.totalBills}</strong>
            </div>
          </div>
        </section>

        <section className="admin-dashboard-grid">
          <div className="admin-dashboard-card">
            <h2>Quick Actions</h2>

            <div className="admin-action-list">
              <Link to="/admin/users" className="admin-action-button">
                Manage Users
              </Link>

              <Link to="/admin/auctions" className="admin-action-button">
                Manage Auctions
              </Link>

              <Link to="/admin/items" className="admin-action-button">
                Manage Items
              </Link>

              <Link to="/admin/orders" className="admin-action-button">
                Manage Orders
              </Link>

              <Link to="/admin/bills" className="admin-action-button">
                Manage Bills
              </Link>
            </div>
          </div>

          <div className="admin-dashboard-card">
            <h2>Auction Status</h2>

            <div className="admin-information">
              <div>
                <span>Scheduled</span>

                <strong>{loading ? "—" : statistics.scheduledAuctions}</strong>
              </div>

              <div>
                <span>Active</span>

                <strong>{loading ? "—" : statistics.activeAuctions}</strong>
              </div>

              <div>
                <span>Completed</span>

                <strong>{loading ? "—" : statistics.completedAuctions}</strong>
              </div>

              <div>
                <span>Cancelled</span>

                <strong>{loading ? "—" : statistics.cancelledAuctions}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="admin-dashboard-grid">
          <div className="admin-dashboard-card">
            <h2>Bill Status</h2>

            <div className="admin-information">
              <div>
                <span>Total Bills</span>

                <strong>{loading ? "—" : statistics.totalBills}</strong>
              </div>

              <div>
                <span>Paid</span>

                <strong>{loading ? "—" : statistics.paidBills}</strong>
              </div>

              <div>
                <span>Pending</span>

                <strong>{loading ? "—" : statistics.pendingBills}</strong>
              </div>
            </div>
          </div>

          <div className="admin-dashboard-card">
            <h2>Admin Information</h2>

            <div className="admin-information">
              <div>
                <span>Name</span>

                <strong>
                  {user?.first_name} {user?.last_name}
                </strong>
              </div>

              <div>
                <span>Email</span>

                <strong>{user?.email || "—"}</strong>
              </div>

              <div>
                <span>Role</span>

                <strong>Administrator</strong>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
