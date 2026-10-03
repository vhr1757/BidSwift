import { useEffect, useState } from "react";

import Navbar from "../components/Navbar.jsx";

import { apiRequest } from "../services/api.js";

import "./AdminItems.css";

function AdminItems() {
  const [items, setItems] = useState([]);

  const [selectedStatus, setSelectedStatus] = useState("all");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    start_price: "",
    images: "",
    status: "available",
  });

  const fetchItems = async () => {
    try {
      setLoading(true);

      setError("");

      const data = await apiRequest("/items");

      const allItems = Array.isArray(data) ? data : data.items || [];

      setItems(allItems);
    } catch (error) {
      console.error("Failed to fetch items:", error);

      setError(error.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenEdit = (item) => {
    setEditingItem(item);

    setFormData({
      name: item.name || "",

      description: item.description || "",

      category: item.category || "",

      start_price: item.start_price ?? "",

      images: Array.isArray(item.images) ? item.images.join(", ") : "",

      status: item.status || "available",
    });

    setError("");
  };

  const handleCloseEdit = () => {
    setEditingItem(null);

    setFormData({
      name: "",
      description: "",
      category: "",
      start_price: "",
      images: "",
      status: "available",
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

  const handleUpdateItem = async (event) => {
    event.preventDefault();

    if (!editingItem) {
      return;
    }

    setError("");

    const startPrice = Number(formData.start_price);

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.category.trim()
    ) {
      setError("Please fill in all required fields");

      return;
    }

    if (!Number.isFinite(startPrice) || startPrice < 0) {
      setError("Starting price must be a valid number");

      return;
    }

    const images = formData.images
      .split(",")
      .map((image) => image.trim())
      .filter(Boolean);

    try {
      setActionLoading(true);

      await apiRequest(`/items/${editingItem._id}`, {
        method: "PUT",

        body: JSON.stringify({
          name: formData.name.trim(),

          description: formData.description.trim(),

          category: formData.category.trim(),

          start_price: startPrice,

          images,

          status: formData.status,
        }),
      });

      handleCloseEdit();

      await fetchItems();
    } catch (error) {
      console.error("Failed to update item:", error);

      setError(error.message || "Failed to update item");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      setError("");

      await apiRequest(`/items/${item._id}`, {
        method: "DELETE",
      });

      setItems((previous) =>
        previous.filter((currentItem) => currentItem._id !== item._id),
      );
    } catch (error) {
      console.error("Failed to delete item:", error);

      setError(error.message || "Failed to delete item");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredItems =
    selectedStatus === "all"
      ? items
      : items.filter((item) => item.status === selectedStatus);

  const getStatusCount = (status) => {
    return items.filter((item) => item.status === status).length;
  };

  const renderEditForm = () => {
    if (!editingItem) {
      return null;
    }

    return (
      <div className="admin-item-overlay">
        <div className="admin-item-form-card">
          <div className="admin-item-form-header">
            <div>
              <h2>Edit Item</h2>

              <p>{editingItem.name}</p>
            </div>

            <button
              type="button"
              className="admin-form-close"
              onClick={handleCloseEdit}
            >
              ×
            </button>
          </div>

          {error && <div className="admin-items-error">{error}</div>}

          <form className="admin-item-form" onSubmit={handleUpdateItem}>
            <div className="admin-form-group">
              <label>Name</label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={actionLoading}
              />
            </div>

            <div className="admin-form-group">
              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                disabled={actionLoading}
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Category</label>

                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={actionLoading}
                />
              </div>

              <div className="admin-form-group">
                <label>Starting Price</label>

                <input
                  type="number"
                  name="start_price"
                  min="0"
                  step="0.01"
                  value={formData.start_price}
                  onChange={handleChange}
                  disabled={actionLoading}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Images</label>

              <input
                type="text"
                name="images"
                value={formData.images}
                onChange={handleChange}
                placeholder="Enter image URLs separated by commas"
                disabled={actionLoading}
              />
            </div>

            <div className="admin-form-group">
              <label>Status</label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={actionLoading}
              >
                <option value="available">Available</option>

                <option value="auctioned">Auctioned</option>

                <option value="sold">Sold</option>
              </select>
            </div>

            <div className="admin-item-form-actions">
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
    <div className="admin-items-page">
      <Navbar />

      <main className="admin-items-content">
        <div className="admin-items-header">
          <div>
            <p className="admin-page-label">Administration</p>

            <h1>Manage Items</h1>

            <p>View and manage all items listed on BidSwift.</p>
          </div>

          <button
            className="admin-refresh-button"
            onClick={fetchItems}
            disabled={loading || actionLoading}
          >
            Refresh
          </button>
        </div>

        {error && !editingItem && (
          <div className="admin-items-error">{error}</div>
        )}

        <div className="admin-item-summary">
          <button
            className={
              selectedStatus === "all"
                ? "admin-item-summary-card active"
                : "admin-item-summary-card"
            }
            onClick={() => setSelectedStatus("all")}
          >
            <span>Total</span>

            <strong>{items.length}</strong>
          </button>

          <button
            className={
              selectedStatus === "available"
                ? "admin-item-summary-card active"
                : "admin-item-summary-card"
            }
            onClick={() => setSelectedStatus("available")}
          >
            <span>Available</span>

            <strong>{getStatusCount("available")}</strong>
          </button>

          <button
            className={
              selectedStatus === "auctioned"
                ? "admin-item-summary-card active"
                : "admin-item-summary-card"
            }
            onClick={() => setSelectedStatus("auctioned")}
          >
            <span>Auctioned</span>

            <strong>{getStatusCount("auctioned")}</strong>
          </button>

          <button
            className={
              selectedStatus === "sold"
                ? "admin-item-summary-card active"
                : "admin-item-summary-card"
            }
            onClick={() => setSelectedStatus("sold")}
          >
            <span>Sold</span>

            <strong>{getStatusCount("sold")}</strong>
          </button>
        </div>

        <section className="admin-items-card">
          <div className="admin-items-card-header">
            <div>
              <h2>
                {selectedStatus === "all"
                  ? "All Items"
                  : `${selectedStatus.charAt(0).toUpperCase()}${selectedStatus.slice(1)} Items`}
              </h2>

              <span>
                {filteredItems.length} item
                {filteredItems.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="admin-items-loading">Loading items...</div>
          ) : filteredItems.length === 0 ? (
            <div className="admin-items-empty">No items found.</div>
          ) : (
            <div className="admin-items-table-wrapper">
              <table className="admin-items-table">
                <thead>
                  <tr>
                    <th>Item</th>

                    <th>Category</th>

                    <th>Starting Price</th>

                    <th>Status</th>

                    <th>Seller ID</th>

                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="admin-item-name">
                          {item.images?.[0] && (
                            <img
                              src={item.images[0]}
                              alt={item.name}
                              className="admin-item-image"
                            />
                          )}

                          <div>
                            <strong>{item.name}</strong>

                            <span>{item.description}</span>
                          </div>
                        </div>
                      </td>

                      <td>{item.category || "—"}</td>

                      <td>{item.start_price}</td>

                      <td>
                        <span
                          className={`admin-item-status admin-item-status-${item.status}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td>
                        <span className="admin-item-id">
                          {item.seller_ID?._id || item.seller_ID || "—"}
                        </span>
                      </td>

                      <td>
                        <div className="admin-item-actions">
                          <button
                            className="admin-edit-button"
                            onClick={() => handleOpenEdit(item)}
                            disabled={actionLoading}
                          >
                            Edit
                          </button>

                          <button
                            className="admin-delete-button"
                            onClick={() => handleDeleteItem(item)}
                            disabled={actionLoading}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {editingItem && renderEditForm()}
    </div>
  );
}

export default AdminItems;
