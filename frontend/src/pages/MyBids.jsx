import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import { apiRequest } from "../services/api.js";

import "./MyBids.css";

function MyBids() {
  const [bids, setBids] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyBids = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest("/bids");

        console.log("All bids received:", data);

        const token = localStorage.getItem("accessToken");

        if (!token) {
          setError("Authentication token not found");
          return;
        }

        const payload = JSON.parse(
          atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
        );

        const userId = String(payload.userId);

        console.log("Logged-in user ID:", userId);

        const myBids = data
          .filter((bid) => {
            const bidderId = bid.bidder_ID?._id || bid.bidder_ID;

            return String(bidderId) === userId;
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setBids(myBids);
      } catch (error) {
        console.error("Failed to fetch my bids:", error);

        setError(error.message || "Failed to load your bids");
      } finally {
        setLoading(false);
      }
    };

    fetchMyBids();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="my-bids-page">
          <div className="my-bids-container">
            <h1 className="my-bids-title">My Bids</h1>

            <p className="my-bids-message">Loading your bids...</p>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />

        <main className="my-bids-page">
          <div className="my-bids-container">
            <h1 className="my-bids-title">My Bids</h1>

            <p className="my-bids-error">{error}</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="my-bids-page">
        <div className="my-bids-container">
          <div className="my-bids-header">
            <h1>My Bids</h1>

            <p>Auctions where you have placed bids.</p>
          </div>

          {bids.length === 0 ? (
            <div className="my-bids-empty">
              <h2>No bids yet</h2>

              <p>You haven't placed any bids.</p>

              <Link to="/auctions" className="browse-auctions-button">
                Browse Auctions
              </Link>
            </div>
          ) : (
            <div className="my-bids-list">
              {bids.map((bid) => (
                <div className="my-bid-card" key={bid._id}>
                  <div className="my-bid-header">
                    <div>
                      <h2>{bid.auction_ID?.item_ID?.name || "Auction Item"}</h2>

                      <p>
                        Bid placed on {new Date(bid.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <span
                      className={`my-bid-status ${
                        bid.auction_ID?.status || "unknown"
                      }`}
                    >
                      {bid.auction_ID?.status || "Unknown"}
                    </span>
                  </div>

                  <div className="my-bid-details">
                    <div className="my-bid-info">
                      <span>Your Bid</span>

                      <strong>₹ {bid.amount}</strong>
                    </div>

                    <div className="my-bid-info">
                      <span>Current Highest Bid</span>

                      <strong>
                        ₹{" "}
                        {bid.auction_ID?.highest_bid_amount ??
                          bid.auction_ID?.item_ID?.start_price}
                      </strong>
                    </div>

                    <div className="my-bid-action">
                      {bid.auction_ID?._id && (
                        <Link
                          to={`/auctions/${bid.auction_ID._id}`}
                          className="my-bid-view-button"
                        >
                          View Auction
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default MyBids;
