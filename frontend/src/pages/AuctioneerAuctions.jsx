import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../services/api.js";

import Navbar from "../components/Navbar";

import "./AuctioneerAuctions.css";

function AuctioneerAuctions() {
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

        console.log("Auctioneer auctions received:", data);

        const allAuctions = Array.isArray(data) ? data : data.auctions || [];

        const myAuctions = allAuctions.filter((auction) => {
          const auctioneerId =
            auction.auctioneer_ID?._id || auction.auctioneer_ID;

          return String(auctioneerId) === String(user?.id);
        });

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

  const getStatusClass = (status) => {
    switch (status) {
      case "scheduled":
        return "scheduled";

      case "active":
        return "active";

      case "completed":
        return "completed";

      case "cancelled":
        return "cancelled";

      default:
        return "";
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="auctioneer-auctions-page">
        <Navbar />

        <main className="auctioneer-auctions-container">
          <div className="auctioneer-auctions-message">
            Loading your auctions...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="auctioneer-auctions-page">
      <Navbar />

      <main className="auctioneer-auctions-container">
        <div className="auctioneer-auctions-header">
          <div>
            <p className="auctioneer-auctions-label">Auctioneer</p>

            <h1>My Auctions</h1>

            <p>Manage the auctions created by you.</p>
          </div>

          <Link
            to="/auctioneer/auctions/create"
            className="auctioneer-add-auction-button"
          >
            + Create Auction
          </Link>
        </div>

        {error && <div className="auctioneer-auctions-error">{error}</div>}

        {auctions.length === 0 && !error && (
          <div className="auctioneer-auctions-empty">
            <h2>No auctions yet</h2>

            <p>You haven't created any auctions yet.</p>

            <Link
              to="/auctioneer/auctions/create"
              className="auctioneer-empty-button"
            >
              Create Your First Auction
            </Link>
          </div>
        )}

        {auctions.length > 0 && (
          <div className="auctioneer-auctions-grid">
            {auctions.map((auction) => (
              <div className="auctioneer-auction-card" key={auction._id}>
                <div className="auctioneer-auction-card-header">
                  <h2>{auction.item_ID?.name || "Auction Item"}</h2>

                  <span
                    className={`auctioneer-auction-status ${getStatusClass(
                      auction.status,
                    )}`}
                  >
                    {auction.status}
                  </span>
                </div>

                <div className="auctioneer-auction-info">
                  <span>Category</span>

                  <strong>{auction.item_ID?.category || "—"}</strong>
                </div>

                <div className="auctioneer-auction-info">
                  <span>Starting Price</span>

                  <strong>₹{auction.item_ID?.start_price ?? "—"}</strong>
                </div>

                <div className="auctioneer-auction-info">
                  <span>Current Bid</span>

                  <strong>
                    ₹
                    {auction.highest_bid_amount ??
                      auction.item_ID?.start_price ??
                      "—"}
                  </strong>
                </div>

                <div className="auctioneer-auction-info">
                  <span>Bid Increment</span>

                  <strong>₹{auction.bid_increment ?? "—"}</strong>
                </div>

                <div className="auctioneer-auction-info">
                  <span>Starts</span>

                  <strong>{formatDate(auction.start_time)}</strong>
                </div>

                <div className="auctioneer-auction-info">
                  <span>Ends</span>

                  <strong>{formatDate(auction.end_time)}</strong>
                </div>

                <div className="auctioneer-auction-actions">
                  <Link
                    to={`/auctions/${auction._id}`}
                    className="auctioneer-view-button"
                  >
                    View Auction
                  </Link>

                  <Link
                    to={`/auctioneer/auctions/${auction._id}/edit`}
                    className="auctioneer-edit-button"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default AuctioneerAuctions;
