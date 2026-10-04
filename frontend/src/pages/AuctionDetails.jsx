import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { apiRequest } from "../services/api.js";

import "./AuctionDetails.css";

import Navbar from "../components/Navbar";

import AuctionTimer from "../components/AuctionTimer";

import socket from "../services/socket.js";

function AuctionDetails() {
  // Get auction ID from URL

  const { id } = useParams();

  const [auction, setAuction] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [bidAmount, setBidAmount] = useState("");

  const [bidLoading, setBidLoading] = useState(false);

  const [bidMessage, setBidMessage] = useState("");

  const [bidError, setBidError] = useState("");

  const [bids, setBids] = useState([]);

  const [bidsLoading, setBidsLoading] = useState(true);

  const [walletBalance, setWalletBalance] = useState(null);

  const [walletLoading, setWalletLoading] = useState(false);

  const storedUser = localStorage.getItem("user");

  let currentUser = null;

  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
    } catch (error) {
      console.error("Failed to parse stored user:", error);
    }
  }

  const fetchAuction = async () => {
    try {
      setLoading(true);

      setError("");

      const data = await apiRequest(`/auctions/${id}`);

      console.log("Auction received:", data);

      setAuction(data);
    } catch (error) {
      console.error("Failed to fetch auction:", error);

      setError(error.message || "Failed to load auction");
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      setBidsLoading(true);

      const data = await apiRequest("/bids");

      console.log("All bids received:", data);

      // Keep only bids belonging to this auction

      const auctionBids = data
        .filter((bid) => String(bid.auction_ID?._id) === String(id))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setBids(auctionBids);
    } catch (error) {
      console.error("Failed to fetch bid history:", error);
    } finally {
      setBidsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuction();

    fetchBids();
  }, [id]);

  useEffect(() => {
    if (currentUser?.role !== "buyer") {
      return;
    }

    const fetchWallet = async () => {
      try {
        setWalletLoading(true);

        const wallet = await apiRequest("/wallets/me");

        setWalletBalance(wallet.balance);
      } catch (error) {
        console.error("Failed to fetch wallet:", error);
      } finally {
        setWalletLoading(false);
      }
    };

    fetchWallet();
  }, [currentUser?.role]);

  useEffect(() => {
    if (!id) {
      return;
    }

    const joinAuctionRoom = () => {
      console.log("Joining auction room:", id);

      socket.emit("joinAuction", id);
    };

    const leaveAuctionRoom = () => {
      console.log("Leaving auction room:", id);

      socket.emit("leaveAuction", id);
    };

    // If socket is already connected,
    // join immediately.

    if (socket.connected) {
      joinAuctionRoom();
    }

    // If connection happens later,
    // join after connection.

    socket.on("connect", joinAuctionRoom);

    return () => {
      leaveAuctionRoom();

      socket.off("connect", joinAuctionRoom);
    };
  }, [id]);

  useEffect(() => {
    const handleBidUpdated = (data) => {
      console.log("Real-time bid update received:", data);

      // Ignore updates belonging
      // to another auction.

      if (String(data.auctionId) !== String(id)) {
        return;
      }

      setAuction((previousAuction) => {
        if (!previousAuction) {
          return previousAuction;
        }

        return {
          ...previousAuction,

          highest_bid_amount: data.highestBidAmount,

          highest_bidder_ID: data.bid?.bidder_ID?._id || data.bid?.bidder_ID,
        };
      });

      if (data.bid) {
        setBids((previousBids) => {
          // Prevent duplicate bid entries.

          const alreadyExists = previousBids.some(
            (bid) => String(bid._id) === String(data.bid._id),
          );

          if (alreadyExists) {
            return previousBids;
          }

          return [data.bid, ...previousBids];
        });
      }

      if (data.endTime) {
        setAuction((previousAuction) => ({
          ...previousAuction,
          end_time: data.endTime,
        }));
      }
    };

    socket.on("bidUpdated", handleBidUpdated);

    return () => {
      socket.off("bidUpdated", handleBidUpdated);
    };
  }, [id]);

  useEffect(() => {
    const handleAuctionStatusUpdated = (data) => {
      console.log("Auction status update received:", data);

      // Ignore other auctions.

      if (String(data.auctionId) !== String(id)) {
        return;
      }

      setAuction((previousAuction) => {
        if (!previousAuction) {
          return previousAuction;
        }

        return {
          ...previousAuction,

          status: data.status,
        };
      });
    };

    socket.on("auctionStatusUpdated", handleAuctionStatusUpdated);

    return () => {
      socket.off("auctionStatusUpdated", handleAuctionStatusUpdated);
    };
  }, [id]);

  useEffect(() => {
    const handleAuctionUpdated = (data) => {
      console.log("Auction update received:", data);

      // Ignore other auctions.

      if (String(data.auctionId) !== String(id)) {
        return;
      }

      setAuction((previousAuction) => {
        if (!previousAuction) {
          return previousAuction;
        }

        return {
          ...previousAuction,

          start_time: data.startTime ?? previousAuction.start_time,

          end_time: data.endTime ?? previousAuction.end_time,

          status: data.status ?? previousAuction.status,

          bid_increment: data.bidIncrement ?? previousAuction.bid_increment,
        };
      });
    };

    socket.on("auctionUpdated", handleAuctionUpdated);

    return () => {
      socket.off("auctionUpdated", handleAuctionUpdated);
    };
  }, [id]);

  const handleBidSubmit = async (event) => {
    event.preventDefault();

    setBidMessage("");

    setBidError("");

    const amount = Number(bidAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setBidError("Please enter a valid bid amount");

      return;
    }

    if (currentUser?.role !== "buyer") {
      setBidError("Only buyers can place bids");

      return;
    }

    if (auction?.status !== "active") {
      setBidError("This auction is no longer active");

      return;
    }

    try {
      setBidLoading(true);

      const data = await apiRequest("/bids", {
        method: "POST",

        body: JSON.stringify({
          auction_ID: id,

          amount: amount,
        }),
      });

      console.log("Bid placed successfully:", data);

      setBidMessage(data.message || "Bid placed successfully");

      setBidAmount("");
    } catch (error) {
      console.error("Failed to place bid:", error);

      setBidError(error.message || "Failed to place bid");
    } finally {
      setBidLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <div>
          <h1>BidSwift</h1>

          <h2>Auction Details</h2>

          <p>Loading auction...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />

        <div>
          <h1>BidSwift</h1>

          <h2>Auction Details</h2>

          <p>{error}</p>
        </div>
      </>
    );
  }

  if (!auction) {
    return (
      <div>
        <h1>BidSwift</h1>

        <h2>Auction Details</h2>

        <p>Auction not found.</p>
      </div>
    );
  }

  const currentHighestBid =
    auction.highest_bid_amount ?? auction.item_ID?.start_price;

  const minimumNextBid =
    auction.highest_bid_amount === null
      ? auction.item_ID?.start_price
      : auction.highest_bid_amount + auction.bid_increment;

  return (
    <>
      <Navbar />

      <div className="auction-details-page">
        <div className="auction-details-container">
          <h2 className="auction-details-title">Auction Details</h2>

          <div className="auction-details-card">
            <AuctionTimer
              auctionId={id}
              status={auction.status}
              startTime={auction.start_time}
              endTime={auction.end_time}
            />

            <h3 className="auction-item-name">
              {auction.item_ID?.name || "Auction Item"}
            </h3>

            <div className="auction-detail-row">
              <span className="auction-detail-label">Starting Price</span>

              <span className="auction-detail-value">
                {auction.item_ID?.start_price}
              </span>
            </div>

            <div className="auction-detail-row">
              <span className="auction-detail-label">Current Highest Bid</span>

              <span className="auction-detail-value auction-current-bid">
                {currentHighestBid}
              </span>
            </div>

            <div className="auction-detail-row">
              <span className="auction-detail-label">Bid Increment</span>

              <span className="auction-detail-value">
                {auction.bid_increment}
              </span>
            </div>

            <div className="auction-detail-row">
              <span className="auction-detail-label">Minimum Next Bid</span>

              <span className="auction-detail-value auction-minimum-bid">
                {minimumNextBid}
              </span>
            </div>

            {currentUser?.role === "buyer" && (
              <div className="auction-detail-row">
                <span className="auction-detail-label">
                  Your Current Balance
                </span>

                <span className="auction-detail-value auction-wallet-balance">
                  {walletLoading
                    ? "Loading..."
                    : walletBalance !== null
                      ? walletBalance
                      : "Unavailable"}
                </span>
              </div>
            )}

            <div className="auction-detail-row">
              <span className="auction-detail-label">Status</span>

              <span className="auction-status">{auction.status}</span>
            </div>

            <div className="bid-section">
              {auction.status === "active" && currentUser?.role === "buyer" ? (
                <>
                  <h3 className="bid-section-title">Place Your Bid</h3>

                  <form className="bid-form" onSubmit={handleBidSubmit}>
                    <div className="bid-field">
                      <label htmlFor="bidAmount">Bid Amount</label>

                      <input
                        type="number"
                        id="bidAmount"
                        value={bidAmount}
                        onChange={(event) => setBidAmount(event.target.value)}
                        placeholder={`Minimum ${minimumNextBid}`}
                        min={minimumNextBid}
                        step="0.01"
                        required
                      />
                    </div>

                    <button
                      className="bid-button"
                      type="submit"
                      disabled={bidLoading}
                    >
                      {bidLoading ? "Placing Bid..." : "Place Bid"}
                    </button>
                  </form>

                  {bidMessage && <p className="bid-success">{bidMessage}</p>}

                  {bidError && <p className="bid-error">{bidError}</p>}
                </>
              ) : auction.status === "scheduled" ? (
                <div className="auction-not-active">
                  <p>This auction has not started yet.</p>
                </div>
              ) : auction.status === "completed" ? (
                <div className="auction-not-active">
                  <p>This auction has ended.</p>
                </div>
              ) : auction.status === "cancelled" ? (
                <div className="auction-not-active">
                  <p>This auction has been cancelled.</p>
                </div>
              ) : null}
            </div>

            <div className="bid-history">
              <h3 className="bid-history-title">Bid History</h3>

              {bidsLoading ? (
                <p className="bid-history-empty">Loading bid history...</p>
              ) : bids.length === 0 ? (
                <p className="bid-history-empty">
                  No bids have been placed yet.
                </p>
              ) : (
                <div className="bid-history-list">
                  {bids.map((bid) => (
                    <div className="bid-history-item" key={bid._id}>
                      <p className="bid-history-amount">₹ {bid.amount}</p>

                      <p className="bid-history-bidder">
                        <strong>Bidder:</strong> {bid.bidder_ID?.first_name}{" "}
                        {bid.bidder_ID?.last_name}
                      </p>

                      <p className="bid-history-time">
                        <strong>Time:</strong>{" "}
                        {new Date(bid.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AuctionDetails;
