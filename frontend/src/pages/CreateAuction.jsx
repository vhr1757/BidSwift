import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";
import { apiRequest } from "../services/api.js";

import "./CreateAuction.css";

function CreateAuction() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);

  const [formData, setFormData] = useState({
    item_ID: "",
    start_time: "",
    end_time: "",
    bid_increment: "1",
  });

  const [loadingItems, setLoadingItems] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await apiRequest("/items");

        const allItems = Array.isArray(data) ? data : data.items || [];

        setItems(allItems);
      } catch (error) {
        console.error(error);

        setError(error.message || "Failed to load items");
      } finally {
        setLoadingItems(false);
      }
    };

    fetchItems();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.item_ID) {
      setError("Please select an item");

      return;
    }

    if (!formData.start_time) {
      setError("Please select a start time");

      return;
    }

    if (!formData.end_time) {
      setError("Please select an end time");

      return;
    }

    if (new Date(formData.start_time) >= new Date(formData.end_time)) {
      setError("End time must be after start time");

      return;
    }

    const bidIncrement = Number(formData.bid_increment);

    if (!Number.isFinite(bidIncrement) || bidIncrement <= 0) {
      setError("Bid increment must be greater than 0");

      return;
    }

    try {
      setSubmitting(true);

      await apiRequest("/auctions", {
        method: "POST",
        body: JSON.stringify({
          item_ID: formData.item_ID,

          start_time: new Date(formData.start_time).toISOString(),

          end_time: new Date(formData.end_time).toISOString(),

          bid_increment: bidIncrement,
        }),
      });

      navigate("/auctioneer/auctions");
    } catch (error) {
      console.error(error);

      setError(error.message || "Failed to create auction");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="create-auction-page">
        <div className="create-auction-container">
          <div className="create-auction-header">
            <div>
              <h1>Create Auction</h1>

              <p>Schedule an auction for one of your available items.</p>
            </div>
          </div>

          <form className="create-auction-form" onSubmit={handleSubmit}>
            {error && <div className="create-auction-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="item_ID">Item</label>

              {loadingItems ? (
                <p className="form-loading">Loading items...</p>
              ) : (
                <select
                  id="item_ID"
                  name="item_ID"
                  value={formData.item_ID}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select an item</option>

                  {items
                    .filter((item) => item.status === "available")
                    .map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="start_time">Start Time</label>

              <input
                id="start_time"
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="end_time">End Time</label>

              <input
                id="end_time"
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bid_increment">Bid Increment</label>

              <input
                id="bid_increment"
                type="number"
                name="bid_increment"
                min="0.01"
                step="0.01"
                value={formData.bid_increment}
                onChange={handleChange}
                required
              />

              <small>Minimum amount that each new bid must increase.</small>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/auctioneer/auctions")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create Auction"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

export default CreateAuction;
