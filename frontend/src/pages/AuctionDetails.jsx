
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { apiRequest } from "../services/api.js";
import "./AuctionDetails.css";
import Navbar from "../components/Navbar";

function AuctionDetails() {

    // Get auction ID from URL
    const { id } = useParams();


    // ============================================================
    // AUCTION STATE
    // ============================================================

    const [auction, setAuction] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ============================================================
    // BID STATE
    // ============================================================

    const [bidAmount, setBidAmount] = useState("");

    const [bidLoading, setBidLoading] = useState(false);

    const [bidMessage, setBidMessage] = useState("");

    const [bidError, setBidError] = useState("");


    // ============================================================
    // BID HISTORY STATE
    // ============================================================

    const [bids, setBids] = useState([]);

    const [bidsLoading, setBidsLoading] = useState(true);


    // ============================================================
    // FETCH AUCTION
    // ============================================================

    const fetchAuction = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await apiRequest(
                `/auctions/${id}`
            );

            console.log(
                "Auction received:",
                data
            );

            setAuction(data);

        }
        catch (error) {

            console.error(
                "Failed to fetch auction:",
                error
            );

            setError(
                error.message ||
                "Failed to load auction"
            );

        }
        finally {

            setLoading(false);

        }
    };


    // ============================================================
    // FETCH BID HISTORY
    // ============================================================

    const fetchBids = async () => {

        try {

            setBidsLoading(true);

            const data = await apiRequest(
                "/bids"
            );

            console.log(
                "All bids received:",
                data
            );


            // Keep only bids belonging to this auction
            const auctionBids = data
                .filter(
                    (bid) =>
                        String(
                            bid.auction_ID?._id
                        ) === String(id)
                )
                .sort(
                    (a, b) =>
                        new Date(b.createdAt) -
                        new Date(a.createdAt)
                );


            setBids(auctionBids);

        }
        catch (error) {

            console.error(
                "Failed to fetch bid history:",
                error
            );

        }
        finally {

            setBidsLoading(false);

        }
    };


    // ============================================================
    // FETCH DATA WHEN PAGE LOADS
    // ============================================================

    useEffect(() => {

        fetchAuction();
        fetchBids();

    }, [id]);


    // ============================================================
    // PLACE BID
    // ============================================================

    const handleBidSubmit = async (event) => {

        event.preventDefault();

        setBidMessage("");
        setBidError("");


        // Convert input string into number
        const amount = Number(bidAmount);


        // Frontend validation
        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            setBidError(
                "Please enter a valid bid amount"
            );

            return;
        }


        try {

            setBidLoading(true);


            // ====================================================
            // SEND BID TO BACKEND
            // ====================================================

            const data = await apiRequest(
                "/bids",
                {
                    method: "POST",

                    body: JSON.stringify({
                        auction_ID: id,
                        amount: amount
                    })
                }
            );


            console.log(
                "Bid placed successfully:",
                data
            );


            setBidMessage(
                data.message ||
                "Bid placed successfully"
            );


            // Clear input
            setBidAmount("");


            // ====================================================
            // REFRESH AUCTION + BID HISTORY
            // ====================================================

            await fetchAuction();

            await fetchBids();

        }
        catch (error) {

            console.error(
                "Failed to place bid:",
                error
            );

            setBidError(
                error.message ||
                "Failed to place bid"
            );

        }
        finally {

            setBidLoading(false);

        }
    };


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (
            <>
              <Navbar />
            <div>

                <h1>BidSwift</h1>

                <h2>Auction Details</h2>

                <p>
                    Loading auction...
                </p>

            </div>
            </>
        );
    }


    // ============================================================
    // AUCTION ERROR
    // ============================================================

    if (error) {

        return (
            <>
              <Navbar />
            <div>

                <h1>BidSwift</h1>

                <h2>Auction Details</h2>

                <p>
                    {error}
                </p>

            </div>
            </>
        );
    }


    // ============================================================
    // AUCTION NOT FOUND
    // ============================================================

    if (!auction) {

        return (
            <div>

                <h1>BidSwift</h1>

                <h2>Auction Details</h2>

                <p>
                    Auction not found.
                </p>

            </div>
        );
    }


    // ============================================================
    // CALCULATE CURRENT / MINIMUM BID
    // ============================================================

    const currentHighestBid =
        auction.highest_bid_amount ??
        auction.item_ID?.start_price;


    const minimumNextBid =
        auction.highest_bid_amount === null
            ? auction.item_ID?.start_price
            : auction.highest_bid_amount +
            auction.bid_increment;


    // ============================================================
    // AUCTION DETAILS + BIDDING
    // ============================================================

    return (
        <>
        <Navbar />
        <div className="auction-details-page">

            <div className="auction-details-container">

               
                <h2 className="auction-details-title">
                    Auction Details
                </h2>


                <div className="auction-details-card">

                    <h3 className="auction-item-name">
                        {auction.item_ID?.name ||
                            "Auction Item"}
                    </h3>


                    <div className="auction-detail-row">
                        <span className="auction-detail-label">
                            Starting Price
                        </span>

                        <span className="auction-detail-value">
                            {auction.item_ID?.start_price}
                        </span>
                    </div>


                    <div className="auction-detail-row">
                        <span className="auction-detail-label">
                            Current Highest Bid
                        </span>

                        <span className="auction-detail-value auction-current-bid">
                            {currentHighestBid}
                        </span>
                    </div>


                    <div className="auction-detail-row">
                        <span className="auction-detail-label">
                            Bid Increment
                        </span>

                        <span className="auction-detail-value">
                            {auction.bid_increment}
                        </span>
                    </div>


                    <div className="auction-detail-row">
                        <span className="auction-detail-label">
                            Minimum Next Bid
                        </span>

                        <span className="auction-detail-value auction-minimum-bid">
                            {minimumNextBid}
                        </span>
                    </div>


                    <div className="auction-detail-row">
                        <span className="auction-detail-label">
                            Status
                        </span>

                        <span className="auction-status">
                            {auction.status}
                        </span>
                    </div>


                    {/* ==================================================
                PLACE BID
            ================================================== */}

                    <div className="bid-section">

                        <h3 className="bid-section-title">
                            Place Your Bid
                        </h3>


                        <form
                            className="bid-form"
                            onSubmit={handleBidSubmit}
                        >

                            <div className="bid-field">

                                <label htmlFor="bidAmount">
                                    Bid Amount
                                </label>

                                <input
                                    type="number"
                                    id="bidAmount"
                                    value={bidAmount}
                                    onChange={(event) =>
                                        setBidAmount(
                                            event.target.value
                                        )
                                    }
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
                                {bidLoading
                                    ? "Placing Bid..."
                                    : "Place Bid"
                                }
                            </button>

                        </form>


                        {bidMessage && (
                            <p className="bid-success">
                                {bidMessage}
                            </p>
                        )}


                        {bidError && (
                            <p className="bid-error">
                                {bidError}
                            </p>
                        )}

                    </div>


                    {/* ==================================================
                BID HISTORY
            ================================================== */}

                    <div className="bid-history">

                        <h3 className="bid-history-title">
                            Bid History
                        </h3>


                        {bidsLoading ? (

                            <p className="bid-history-empty">
                                Loading bid history...
                            </p>

                        ) : bids.length === 0 ? (

                            <p className="bid-history-empty">
                                No bids have been placed yet.
                            </p>

                        ) : (

                            <div className="bid-history-list">

                                {bids.map((bid) => (

                                    <div
                                        className="bid-history-item"
                                        key={bid._id}
                                    >

                                        <p className="bid-history-amount">
                                            ₹ {bid.amount}
                                        </p>


                                        <p className="bid-history-bidder">

                                            <strong>
                                                Bidder:
                                            </strong>{" "}

                                            {bid.bidder_ID?.first_name}{" "}
                                            {bid.bidder_ID?.last_name}

                                        </p>


                                        <p className="bid-history-time">

                                            <strong>
                                                Time:
                                            </strong>{" "}

                                            {new Date(
                                                bid.createdAt
                                            ).toLocaleString()}

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
