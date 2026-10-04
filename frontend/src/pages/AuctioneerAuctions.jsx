import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../services/api.js";

import Navbar from "../components/Navbar";
import AuctionSearch from "../components/AuctionSearch";

import "./AuctioneerAuctions.css";

function AuctioneerAuctions() {
  const [auctions, setAuctions] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [currentImages, setCurrentImages] = useState({});

  const initialLoad = useRef(true);

  const storedUser = localStorage.getItem("user");

  let user = null;

  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      user = null;
    }
  }

  const fetchAuctions = async (
    searchValue = search,
    categoryValue = category,
    showLoading = false,
  ) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      const params = new URLSearchParams();

      if (searchValue.trim()) {
        params.append("search", searchValue.trim());
      }

      if (categoryValue) {
        params.append("category", categoryValue);
      }

      const queryString = params.toString();

      const endpoint = queryString ? `/auctions?${queryString}` : "/auctions";

      const data = await apiRequest(endpoint);

      console.log("Auctioneer auctions received:", data);

      const allAuctions = Array.isArray(data) ? data : data.auctions || [];

      const allCategories = Array.isArray(data) ? [] : data.categories || [];

      const myAuctions = allAuctions.filter((auction) => {
        const auctioneerId =
          auction.auctioneer_ID?._id || auction.auctioneer_ID;

        return String(auctioneerId) === String(user?.id);
      });

      setAuctions(myAuctions);

      setCategories([...allCategories].sort());

      setCurrentImages({});
    } catch (error) {
      console.error("Failed to fetch auctioneer auctions:", error);

      setError(error.message || "Failed to load auctions");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  /*
   * Initial auction loading.
   */
  useEffect(() => {
    fetchAuctions("", "", true);
  }, []);

  /*
   * Debounce search and category changes.
   */
  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetchAuctions(search, category, false);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [search, category]);

  const handleSearchChange = (value) => {
    setSearch(value);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
  };

  const handleClear = () => {
    setSearch("");
    setCategory("");

    fetchAuctions("", "", false);
  };

  const showPreviousImage = (event, auctionId, imageCount) => {
    event.preventDefault();
    event.stopPropagation();

    setCurrentImages((previous) => {
      const currentIndex = previous[auctionId] || 0;

      return {
        ...previous,

        [auctionId]: currentIndex === 0 ? imageCount - 1 : currentIndex - 1,
      };
    });
  };

  const showNextImage = (event, auctionId, imageCount) => {
    event.preventDefault();
    event.stopPropagation();

    setCurrentImages((previous) => {
      const currentIndex = previous[auctionId] || 0;

      return {
        ...previous,

        [auctionId]: currentIndex === imageCount - 1 ? 0 : currentIndex + 1,
      };
    });
  };

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

        <AuctionSearch
          search={search}
          category={category}
          categories={categories}
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onClear={handleClear}
        />

        {auctions.length === 0 && !error && (
          <div className="auctioneer-auctions-empty">
            <h2>No auctions found</h2>

            <p>No auctions match your current search or filter.</p>

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
            {auctions.map((auction) => {
              const images = auction.item_ID?.images || [];

              const currentImageIndex = currentImages[auction._id] || 0;

              return (
                <div className="auctioneer-auction-card" key={auction._id}>
                  <div className="auctioneer-auction-image">
                    {images.length > 0 ? (
                      <>
                        <img
                          src={images[currentImageIndex]}
                          alt={auction.item_ID?.name || "Auction Item"}
                        />

                        {images.length > 1 && (
                          <>
                            <button
                              type="button"
                              className="auctioneer-image-nav-button auctioneer-image-nav-left"
                              onClick={(event) =>
                                showPreviousImage(
                                  event,
                                  auction._id,
                                  images.length,
                                )
                              }
                            >
                              &#10094;
                            </button>

                            <button
                              type="button"
                              className="auctioneer-image-nav-button auctioneer-image-nav-right"
                              onClick={(event) =>
                                showNextImage(event, auction._id, images.length)
                              }
                            >
                              &#10095;
                            </button>

                            <div className="auctioneer-image-counter">
                              {currentImageIndex + 1}
                              {" / "}
                              {images.length}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="auctioneer-image-placeholder">
                        No Image Available
                      </div>
                    )}
                  </div>

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
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default AuctioneerAuctions;
