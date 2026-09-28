import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api.js";
import "./Auctions.css";
import Navbar from "../components/Navbar";

function Auctions() {
  const [auctions, setAuctions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest("/auctions");

        console.log("Auctions received:", data);

        setAuctions(data);
      } catch (error) {
        console.error("Failed to fetch auctions:", error);

        setError(error.message || "Failed to load auctions");
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  // LOADING
  if (loading) {
    return (
      <div className="auctions-page">
        <div className="auctions-container">
          <h1 className="auctions-logo">BidSwift</h1>
          <p className="auctions-message">Loading auctions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auctions-page">
        <div className="auctions-container">
          <h1 className="auctions-logo">BidSwift</h1>
          <p className="auctions-error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="auctions-page">
        <div className="auctions-container">
          <div className="auctions-header">
            <h2 className="auctions-title">Live Auctions</h2>
          </div>

          {auctions.length === 0 ? (
            <div className="auctions-message">No auctions available.</div>
          ) : (
            <div className="auctions-grid">
              {auctions.map((auction) => (
                <div className="auction-card" key={auction._id}>
                  <h3 className="auction-card-title">
                    {auction.item_ID?.name || "Auction Item"}
                  </h3>

                  <div className="auction-info">
                    <span className="auction-info-label">Starting Price</span>

                    <span className="auction-info-value">
                      {auction.item_ID?.start_price}
                    </span>
                  </div>

                  <div className="auction-info">
                    <span className="auction-info-label">Current Bid</span>

                    <span className="auction-info-value">
                      {auction.highest_bid_amount ??
                        auction.item_ID?.start_price}
                    </span>
                  </div>

                  <div className="auction-info">
                    <span className="auction-info-label">Status</span>

                    <span className="auction-status">{auction.status}</span>
                  </div>

                  <Link
                    className="auction-view-button"
                    to={`/auctions/${auction._id}`}
                  >
                    View Auction
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Auctions;
