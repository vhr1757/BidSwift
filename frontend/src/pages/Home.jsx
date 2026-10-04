import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../services/api.js";

import Navbar from "../components/Navbar";
import AuctionSearch from "../components/AuctionSearch";

import "./Home.css";

function Home() {
  const [auctions, setAuctions] = useState([]);
  const [currentImages, setCurrentImages] = useState({});

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const initialLoad = useRef(true);

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

      const allAuctions = Array.isArray(data) ? data : data.auctions || [];

      const allCategories = Array.isArray(data) ? [] : data.categories || [];

      setAuctions(allAuctions);

      setCategories([...allCategories].sort());

      setCurrentImages({});
    } catch (error) {
      console.error("Failed to fetch auctions:", error);

      setError(error.message || "Failed to load auctions");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchAuctions("", "", true);
  }, []);

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

  const showPreviousImage = (auctionId, imageCount) => {
    setCurrentImages((previous) => {
      const currentIndex = previous[auctionId] || 0;

      return {
        ...previous,
        [auctionId]: currentIndex === 0 ? imageCount - 1 : currentIndex - 1,
      };
    });
  };

  const showNextImage = (auctionId, imageCount) => {
    setCurrentImages((previous) => {
      const currentIndex = previous[auctionId] || 0;

      return {
        ...previous,
        [auctionId]: currentIndex === imageCount - 1 ? 0 : currentIndex + 1,
      };
    });
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="home-container">
          <h1>BidSwift</h1>

          <p>Loading auctions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />

        <div className="home-page">
          <div className="home-container">
            <h1>BidSwift</h1>

            <p className="home-error">{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="home-page">
        <div className="home-container">
          <div className="home-header">
            <h1>Welcome to BidSwift</h1>

            <p>Discover exciting auctions and find your next item.</p>
          </div>

          <AuctionSearch
            search={search}
            category={category}
            categories={categories}
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            onClear={handleClear}
          />

          <section className="home-auctions-section">
            <h2>Available Auctions</h2>

            {auctions.length === 0 ? (
              <p className="home-empty">No auctions match your search.</p>
            ) : (
              <div className="home-auctions-grid">
                {auctions.map((auction) => {
                  const images = auction.item_ID?.images || [];

                  const currentImageIndex = currentImages[auction._id] || 0;

                  const currentImage = images[currentImageIndex];

                  const currentHighestBid =
                    auction.highest_bid_amount ?? auction.item_ID?.start_price;

                  return (
                    <div className="home-auction-card" key={auction._id}>
                      <div className="home-auction-image">
                        {currentImage ? (
                          <>
                            <img
                              src={currentImage}
                              alt={auction.item_ID?.name || "Auction item"}
                            />

                            {images.length > 1 && (
                              <>
                                <button
                                  type="button"
                                  className="home-image-button home-image-previous"
                                  onClick={() =>
                                    showPreviousImage(
                                      auction._id,
                                      images.length,
                                    )
                                  }
                                >
                                  ‹
                                </button>

                                <button
                                  type="button"
                                  className="home-image-button home-image-next"
                                  onClick={() =>
                                    showNextImage(auction._id, images.length)
                                  }
                                >
                                  ›
                                </button>

                                <span className="home-image-counter">
                                  {currentImageIndex + 1}
                                  {" / "}
                                  {images.length}
                                </span>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="home-no-image">No Image</div>
                        )}
                      </div>

                      <div className="home-auction-content">
                        <h3>{auction.item_ID?.name || "Unnamed Auction"}</h3>

                        <p className="home-auction-description">
                          {auction.item_ID?.description ||
                            "No description available."}
                        </p>

                        <div className="home-auction-detail">
                          <span>Starting Price</span>

                          <strong>
                            ₹
                            {auction.item_ID?.start_price?.toLocaleString(
                              "en-IN",
                            )}
                          </strong>
                        </div>

                        <div className="home-auction-detail">
                          <span>Current Bid</span>

                          <strong>
                            ₹{currentHighestBid?.toLocaleString("en-IN")}
                          </strong>
                        </div>

                        <div className="home-auction-detail">
                          <span>Status</span>

                          <span
                            className={`home-auction-status home-status-${auction.status}`}
                          >
                            {auction.status}
                          </span>
                        </div>

                        <Link
                          to={`/auctions/${auction._id}`}
                          className="home-view-auction"
                        >
                          View Auction
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export default Home;
