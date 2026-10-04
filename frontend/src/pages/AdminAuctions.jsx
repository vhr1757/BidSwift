import { useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";
import AuctionSearch from "../components/AuctionSearch";

import { apiRequest } from "../services/api.js";

import "./AdminAuctions.css";

function AdminAuctions() {
  const [auctions, setAuctions] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const initialLoad = useRef(true);

  const [selectedStatus, setSelectedStatus] = useState("all");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  const [editingAuction, setEditingAuction] = useState(null);

  const [formData, setFormData] = useState({
    start_time: "",
    end_time: "",
    bid_increment: "",
    status: "scheduled",
  });

  const fetchAuctions = async (
    searchValue = search,
    categoryValue = category,
    showLoading = true,
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
  };

  const formatDateTimeLocal = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    const year = parsedDate.getFullYear();

    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");

    const day = String(parsedDate.getDate()).padStart(2, "0");

    const hours = String(parsedDate.getHours()).padStart(2, "0");

    const minutes = String(parsedDate.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleOpenEdit = (auction) => {
    setEditingAuction(auction);

    setFormData({
      start_time: formatDateTimeLocal(auction.start_time),

      end_time: formatDateTimeLocal(auction.end_time),

      bid_increment: auction.bid_increment ?? "",

      status: auction.status,
    });

    setError("");
  };

  const handleCloseEdit = () => {
    setEditingAuction(null);

    setFormData({
      start_time: "",
      end_time: "",
      bid_increment: "",
      status: "scheduled",
    });

    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]: value,
    }));
  };

  const handleUpdateAuction = async (event) => {
    event.preventDefault();

    if (!editingAuction) {
      return;
    }

    setError("");

    const startDate = new Date(formData.start_time);

    const endDate = new Date(formData.end_time);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setError("Please enter valid start and end times");

      return;
    }

    if (startDate >= endDate) {
      setError("End time must be after start time");

      return;
    }

    let bidIncrement = null;

    if (editingAuction.status === "scheduled") {
      bidIncrement = Number(formData.bid_increment);

      if (!Number.isFinite(bidIncrement) || bidIncrement <= 0) {
        setError("Bid increment must be greater than 0");

        return;
      }
    }

    try {
      setActionLoading(true);

      const updateData = {
        start_time: startDate.toISOString(),

        end_time: endDate.toISOString(),

        status: formData.status,
      };

      if (editingAuction.status === "scheduled") {
        updateData.bid_increment = bidIncrement;
      }

      await apiRequest(`/auctions/${editingAuction._id}`, {
        method: "PUT",

        body: JSON.stringify(updateData),
      });

      handleCloseEdit();

      await fetchAuctions();
    } catch (error) {
      console.error("Failed to update auction:", error);

      setError(error.message || "Failed to update auction");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAuction = async (auction) => {
    const itemName = auction.item_ID?.name || "this auction";

    const confirmed = window.confirm(
      `Are you sure you want to delete the auction for "${itemName}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      setError("");

      await apiRequest(`/auctions/${auction._id}`, {
        method: "DELETE",
      });

      setAuctions((previous) =>
        previous.filter((item) => item._id !== auction._id),
      );
    } catch (error) {
      console.error("Failed to delete auction:", error);

      setError(error.message || "Failed to delete auction");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteAuction = async (auction) => {
    const confirmed = window.confirm(
      "This will complete the auction and settle the winner if there is one. Continue?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      setError("");

      await apiRequest(`/auctions/${auction._id}/complete`, {
        method: "POST",
      });

      await fetchAuctions();
    } catch (error) {
      console.error("Failed to complete auction:", error);

      setError(error.message || "Failed to complete auction");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAuctions =
    selectedStatus === "all"
      ? auctions
      : auctions.filter((auction) => auction.status === selectedStatus);

  const getStatusCount = (status) => {
    return auctions.filter((auction) => auction.status === status).length;
  };

  const hasAuctionEnded = (auction) => {
    if (!auction.end_time) {
      return false;
    }

    return new Date(auction.end_time).getTime() <= Date.now();
  };

  const renderEditForm = () => {
    if (!editingAuction) {
      return null;
    }

    const isScheduled = editingAuction.status === "scheduled";

    const isCompleted = editingAuction.status === "completed";

    const isCancelled = editingAuction.status === "cancelled";

    return (
      <div className="admin-auction-overlay">
        <div className="admin-auction-form-card">
          <div className="admin-auction-form-header">
            <div>
              <h2>Edit Auction</h2>

              <p>{editingAuction.item_ID?.name || "Auction"}</p>
            </div>

            <button
              type="button"
              className="admin-form-close"
              onClick={handleCloseEdit}
            >
              ×
            </button>
          </div>

          {error && <div className="admin-auctions-error">{error}</div>}

          <form className="admin-auction-form" onSubmit={handleUpdateAuction}>
            <div className="admin-form-group">
              <label>Start Time</label>

              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                disabled={actionLoading || !isScheduled}
              />

              {!isScheduled && (
                <small>
                  Start time can only be changed for scheduled auctions.
                </small>
              )}
            </div>

            <div className="admin-form-group">
              <label>End Time</label>

              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                disabled={actionLoading || isCompleted || isCancelled}
              />

              {(isCompleted || isCancelled) && (
                <small>
                  End time cannot be changed after an auction is completed or
                  cancelled.
                </small>
              )}
            </div>

            <div className="admin-form-group">
              <label>Bid Increment</label>

              <input
                type="number"
                name="bid_increment"
                min="0.01"
                step="0.01"
                value={formData.bid_increment}
                onChange={handleChange}
                disabled={actionLoading || !isScheduled}
              />

              {!isScheduled && (
                <small>
                  Bid increment can only be changed for scheduled auctions.
                </small>
              )}
            </div>

            <div className="admin-form-group">
              <label>Status</label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={actionLoading}
              >
                <option value="scheduled">Scheduled</option>

                <option value="active">Active</option>

                <option value="completed">Completed</option>

                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="admin-auction-form-actions">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={handleCloseEdit}
                disabled={actionLoading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-primary-button"
                disabled={actionLoading}
              >
                {actionLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-auctions-page">
      <Navbar />

      <main className="admin-auctions-content">
        <div className="admin-auctions-header">
          <div>
            <p className="admin-page-label">Administration</p>

            <h1>Manage Auctions</h1>

            <p>View and manage all auctions on the BidSwift platform.</p>
          </div>

          <button
            className="admin-refresh-button"
            onClick={() => fetchAuctions()}
            disabled={loading || actionLoading}
          >
            Refresh
          </button>
        </div>

        {error && !editingAuction && (
          <div className="admin-auctions-error">{error}</div>
        )}

        <AuctionSearch
          search={search}
          category={category}
          categories={categories}
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onClear={handleClear}
        />

        <div className="admin-auction-summary">
          <button
            className={
              selectedStatus === "all"
                ? "admin-auction-summary-card active"
                : "admin-auction-summary-card"
            }
            onClick={() => setSelectedStatus("all")}
          >
            <span>Total</span>

            <strong>{auctions.length}</strong>
          </button>

          <button
            className={
              selectedStatus === "scheduled"
                ? "admin-auction-summary-card active"
                : "admin-auction-summary-card"
            }
            onClick={() => setSelectedStatus("scheduled")}
          >
            <span>Scheduled</span>

            <strong>{getStatusCount("scheduled")}</strong>
          </button>

          <button
            className={
              selectedStatus === "active"
                ? "admin-auction-summary-card active"
                : "admin-auction-summary-card"
            }
            onClick={() => setSelectedStatus("active")}
          >
            <span>Active</span>

            <strong>{getStatusCount("active")}</strong>
          </button>

          <button
            className={
              selectedStatus === "completed"
                ? "admin-auction-summary-card active"
                : "admin-auction-summary-card"
            }
            onClick={() => setSelectedStatus("completed")}
          >
            <span>Completed</span>

            <strong>{getStatusCount("completed")}</strong>
          </button>

          <button
            className={
              selectedStatus === "cancelled"
                ? "admin-auction-summary-card active"
                : "admin-auction-summary-card"
            }
            onClick={() => setSelectedStatus("cancelled")}
          >
            <span>Cancelled</span>

            <strong>{getStatusCount("cancelled")}</strong>
          </button>
        </div>

        <section className="admin-auctions-card">
          <div className="admin-auctions-card-header">
            <div>
              <h2>
                {selectedStatus === "all"
                  ? "All Auctions"
                  : `${selectedStatus.charAt(0).toUpperCase()}${selectedStatus.slice(1)} Auctions`}
              </h2>

              <span>
                {filteredAuctions.length} auction
                {filteredAuctions.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="admin-auctions-loading">Loading auctions...</div>
          ) : filteredAuctions.length === 0 ? (
            <div className="admin-auctions-empty">No auctions found.</div>
          ) : (
            <div className="admin-auctions-table-wrapper">
              <table className="admin-auctions-table">
                <thead>
                  <tr>
                    <th>Item</th>

                    <th>Auctioneer</th>

                    <th>Status</th>

                    <th>Highest Bid</th>

                    <th>Bid Increment</th>

                    <th>Start</th>

                    <th>End</th>

                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAuctions.map((auction) => {
                    const auctioneer = auction.auctioneer_ID;

                    const auctioneerName = auctioneer?.first_name
                      ? `${auctioneer.first_name} ${auctioneer.last_name || ""}`
                      : "—";

                    return (
                      <tr key={auction._id}>
                        <td>
                          <div className="admin-auction-item">
                            <strong>
                              {auction.item_ID?.name || "Unknown Item"}
                            </strong>

                            <span>{auction.item_ID?.category || "—"}</span>
                          </div>
                        </td>

                        <td>{auctioneerName}</td>

                        <td>
                          <span
                            className={`admin-auction-status admin-status-${auction.status}`}
                          >
                            {auction.status}
                          </span>
                        </td>

                        <td>
                          {auction.highest_bid_amount ??
                            auction.item_ID?.start_price ??
                            "—"}
                        </td>

                        <td>{auction.bid_increment}</td>

                        <td>
                          {auction.start_time
                            ? new Date(auction.start_time).toLocaleString()
                            : "—"}
                        </td>

                        <td>
                          {auction.end_time
                            ? new Date(auction.end_time).toLocaleString()
                            : "—"}
                        </td>

                        <td>
                          <div className="admin-auction-actions">
                            <Link
                              to={`/auctions/${auction._id}`}
                              className="admin-view-button"
                            >
                              View
                            </Link>

                            <button
                              className="admin-edit-button"
                              onClick={() => handleOpenEdit(auction)}
                              disabled={actionLoading}
                            >
                              Edit
                            </button>

                            {auction.status === "active" &&
                              hasAuctionEnded(auction) && (
                                <button
                                  className="admin-complete-button"
                                  onClick={() => handleCompleteAuction(auction)}
                                  disabled={actionLoading}
                                >
                                  Complete
                                </button>
                              )}

                            <button
                              className="admin-delete-button"
                              onClick={() => handleDeleteAuction(auction)}
                              disabled={actionLoading}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {editingAuction && renderEditForm()}
    </div>
  );
}

export default AdminAuctions;
