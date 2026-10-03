import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../services/api.js";

import Navbar from "../components/Navbar";

import "./AuctioneerDashboard.css";

function AuctioneerDashboard() {
  const [auctions, setAuctions] = useState([]);

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
    const fetchAuctions = async () => {
      try {
        setLoading(true);

        setError("");

        const data = await apiRequest("/auctions");

        console.log("Auctions received:", data);

        const allAuctions = Array.isArray(data) ? data : data.auctions || [];

        const myAuctions = allAuctions.filter(
          (auction) =>
            String(auction.auctioneer_ID?._id || auction.auctioneer_ID) ===
            String(user?.id),
        );

        setAuctions(myAuctions);
      } catch (error) {
        console.error("Failed to fetch auctioneer auctions:", error);

        setError(error.message || "Failed to load auctions");
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  const totalAuctions = auctions.length;

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

  return (
    <div className="auctioneer-dashboard">
      <Navbar />

      <main className="auctioneer-dashboard-content">
        <section className="auctioneer-welcome">
          <div>
            <p className="auctioneer-dashboard-label">Auctioneer Dashboard</p>

            <h1>Welcome, {user?.first_name || "Auctioneer"}!</h1>

            <p>Manage your auctions and keep track of their activity.</p>
          </div>
        </section>

        {error && <div className="auctioneer-dashboard-error">{error}</div>}

        <section className="auctioneer-stat-grid">
          <div className="auctioneer-stat-card">
            <span className="auctioneer-stat-label">Total Auctions</span>

            <strong>{loading ? "—" : totalAuctions}</strong>
          </div>

          <div className="auctioneer-stat-card">
            <span className="auctioneer-stat-label">Scheduled</span>

            <strong>{loading ? "—" : scheduledAuctions}</strong>
          </div>

          <div className="auctioneer-stat-card">
            <span className="auctioneer-stat-label">Active</span>

            <strong>{loading ? "—" : activeAuctions}</strong>
          </div>

          <div className="auctioneer-stat-card">
            <span className="auctioneer-stat-label">Completed</span>

            <strong>{loading ? "—" : completedAuctions}</strong>
          </div>

          <div className="auctioneer-stat-card">
            <span className="auctioneer-stat-label">Cancelled</span>

            <strong>{loading ? "—" : cancelledAuctions}</strong>
          </div>
        </section>

        <section className="auctioneer-dashboard-grid">
          <div className="auctioneer-dashboard-card">
            <h2>Quick Actions</h2>

            <div className="auctioneer-action-list">
              <Link
                to="/auctioneer/auctions/create"
                className="auctioneer-action-button"
              >
                Create Auction
              </Link>

              <Link
                to="/auctioneer/auctions"
                className="auctioneer-action-button secondary"
              >
                Manage My Auctions
              </Link>
            </div>
          </div>

          <div className="auctioneer-dashboard-card">
            <h2>Auctioneer Information</h2>

            <div className="auctioneer-information">
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

                <strong>Auctioneer</strong>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AuctioneerDashboard;
