import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";

import { apiRequest } from "../services/api.js";

import "./EditAuction.css";

function formatDateTimeLocal(dateString) {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");

  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function EditAuction() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [auction, setAuction] = useState(null);

  const [formData, setFormData] = useState({
    start_time: "",
    end_time: "",
    bid_increment: "",
  });

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [cancelling, setCancelling] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        setLoading(true);

        setError("");

        const data = await apiRequest(`/auctions/${id}`);

        setAuction(data);

        setFormData({
          start_time: formatDateTimeLocal(data.start_time),

          end_time: formatDateTimeLocal(data.end_time),

          bid_increment: data.bid_increment,
        });
      } catch (error) {
        console.error("Failed to fetch auction:", error);

        setError(error.message || "Failed to load auction");
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [id]);

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
    setMessage("");

    if (!formData.end_time) {
      setError("Please select an end time");

      return;
    }

    const endDate = new Date(formData.end_time);

    if (Number.isNaN(endDate.getTime())) {
      setError("Please enter a valid end time");

      return;
    }

    if (auction.status === "scheduled") {
      if (!formData.start_time) {
        setError("Please select a start time");

        return;
      }

      const startDate = new Date(formData.start_time);

      if (Number.isNaN(startDate.getTime())) {
        setError("Please enter a valid start time");

        return;
      }

      if (startDate >= endDate) {
        setError("End time must be after start time");

        return;
      }

      const bidIncrement = Number(formData.bid_increment);

      if (!Number.isFinite(bidIncrement) || bidIncrement <= 0) {
        setError("Bid increment must be greater than 0");

        return;
      }

      try {
        setSaving(true);

        await apiRequest(`/auctions/${id}`, {
          method: "PUT",

          body: JSON.stringify({
            start_time: startDate.toISOString(),

            end_time: endDate.toISOString(),

            bid_increment: bidIncrement,
          }),
        });

        setMessage("Auction updated successfully");

        setTimeout(() => {
          navigate("/auctioneer/auctions");
        }, 700);
      } catch (error) {
        console.error("Failed to update auction:", error);

        setError(error.message || "Failed to update auction");
      } finally {
        setSaving(false);
      }

      return;
    }

    if (auction.status === "active") {
      if (endDate <= new Date()) {
        setError("End time must be in the future");

        return;
      }

      try {
        setSaving(true);

        await apiRequest(`/auctions/${id}`, {
          method: "PUT",

          body: JSON.stringify({
            end_time: endDate.toISOString(),
          }),
        });

        setMessage("Auction end time updated successfully");

        setAuction((previousAuction) => ({
          ...previousAuction,

          end_time: endDate.toISOString(),
        }));
      } catch (error) {
        console.error("Failed to update auction:", error);

        setError(error.message || "Failed to update auction");
      } finally {
        setSaving(false);
      }

      return;
    }

    setError("This auction can no longer be edited");
  };

  const handleCancelAuction = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this auction?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelling(true);

      setError("");

      setMessage("");

      await apiRequest(`/auctions/${id}`, {
        method: "PUT",

        body: JSON.stringify({
          status: "cancelled",
        }),
      });

      setAuction((previousAuction) => ({
        ...previousAuction,

        status: "cancelled",
      }));

      setMessage("Auction cancelled successfully");
    } catch (error) {
      console.error("Failed to cancel auction:", error);

      setError(error.message || "Failed to cancel auction");
    } finally {
      setCancelling(false);
    }
  };

  const handleDeleteAuction = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this auction?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      setError("");

      await apiRequest(`/auctions/${id}`, {
        method: "DELETE",
      });

      navigate("/auctioneer/auctions");
    } catch (error) {
      console.error("Failed to delete auction:", error);

      setError(error.message || "Failed to delete auction");

      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="edit-auction-page">
          <div className="edit-auction-container">
            <p>Loading auction...</p>
          </div>
        </main>
      </>
    );
  }

  if (error && !auction) {
    return (
      <>
        <Navbar />

        <main className="edit-auction-page">
          <div className="edit-auction-container">
            <div className="edit-auction-error">{error}</div>

            <button
              className="secondary-button"
              onClick={() => navigate("/auctioneer/auctions")}
            >
              Back to My Auctions
            </button>
          </div>
        </main>
      </>
    );
  }

  if (!auction) {
    return null;
  }

  const isScheduled = auction.status === "scheduled";

  const isActive = auction.status === "active";

  const isFinished =
    auction.status === "completed" || auction.status === "cancelled";

  return (
    <>
      <Navbar />

      <main className="edit-auction-page">
        <div className="edit-auction-container">
          <div className="edit-auction-header">
            <div>
              <h1>Manage Auction</h1>

              <p>{auction.item_ID?.name || "Auction"}</p>
            </div>

            <span className={`edit-auction-status status-${auction.status}`}>
              {auction.status}
            </span>
          </div>

          {error && <div className="edit-auction-error">{error}</div>}

          {message && <div className="edit-auction-success">{message}</div>}

          <div className="edit-auction-card">
            <div className="auction-info-section">
              <h2>Auction Information</h2>

              <div className="auction-info-row">
                <span>Item</span>

                <strong>{auction.item_ID?.name || "Unknown Item"}</strong>
              </div>

              <div className="auction-info-row">
                <span>Starting Price</span>

                <strong>{auction.item_ID?.start_price}</strong>
              </div>

              <div className="auction-info-row">
                <span>Current Highest Bid</span>

                <strong>
                  {auction.highest_bid_amount ?? auction.item_ID?.start_price}
                </strong>
              </div>
            </div>

            <form className="edit-auction-form" onSubmit={handleSubmit}>
              <h2>Auction Settings</h2>

              <div className="form-group">
                <label htmlFor="start_time">Start Time</label>

                <input
                  id="start_time"
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  disabled={!isScheduled}
                />

                {!isScheduled && (
                  <small>
                    Start time cannot be changed after the auction has started.
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="end_time">End Time</label>

                <input
                  id="end_time"
                  type="datetime-local"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  disabled={isFinished}
                />

                {isFinished && (
                  <small>
                    This auction has already ended and cannot be edited.
                  </small>
                )}
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
                  disabled={!isScheduled}
                />

                {!isScheduled && (
                  <small>
                    Bid increment can only be changed before the auction starts.
                  </small>
                )}
              </div>

              {!isFinished && (
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
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>

            {!isFinished && (
              <div className="danger-zone">
                <div>
                  <h2>Danger Zone</h2>

                  <p>Cancelling an auction prevents further bidding.</p>
                </div>

                <button
                  type="button"
                  className="danger-button"
                  onClick={handleCancelAuction}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling..." : "Cancel Auction"}
                </button>
              </div>
            )}

            {isScheduled && (
              <div className="delete-auction-section">
                <button
                  type="button"
                  className="delete-button"
                  onClick={handleDeleteAuction}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete Auction"}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default EditAuction;
