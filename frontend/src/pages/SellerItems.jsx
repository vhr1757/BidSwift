import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../services/api.js";

import Navbar from "../components/Navbar";

import "./SellerItems.css";

function SellerItems() {
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [deleteLoading, setDeleteLoading] = useState(null);

  const storedUser = localStorage.getItem("user");

  let user = null;

  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      user = null;
    }
  }

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);

        setError("");

        const data = await apiRequest("/items");

        const allItems = Array.isArray(data) ? data : data.items || [];

        const sellerItems = allItems.filter(
          (item) => String(item.seller_ID) === String(user?.id),
        );

        setItems(sellerItems);
      } catch (error) {
        console.error("Failed to fetch seller items:", error);

        setError(error.message || "Failed to load your items");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [user?._id]);

  const handleDelete = async (itemId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this item?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(itemId);

      await apiRequest(`/items/${itemId}`, {
        method: "DELETE",
      });

      setItems((previousItems) =>
        previousItems.filter((item) => item._id !== itemId),
      );
    } catch (error) {
      console.error("Failed to delete item:", error);

      setError(error.message || "Failed to delete item");
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="seller-items-page">
      <Navbar />

      <main className="seller-items-container">
        <div className="seller-items-header">
          <div>
            <p className="seller-items-label">Seller</p>

            <h1 className="seller-items-title">My Items</h1>

            <p className="seller-items-subtitle">
              Manage the items you have listed on BidSwift.
            </p>
          </div>

          <Link to="/seller/items/create" className="seller-add-item-button">
            + Add New Item
          </Link>
        </div>

        {error && <div className="seller-items-error">{error}</div>}

        {loading && (
          <div className="seller-items-message">
            <p>Loading your items...</p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="seller-items-empty">
            <h2>No items yet</h2>

            <p>You haven't added any items yet.</p>

            <Link to="/seller/items/create" className="seller-empty-button">
              Add Your First Item
            </Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="seller-items-grid">
            {items.map((item) => (
              <div className="seller-item-card" key={item._id}>

                <div className="seller-item-image">
                  {item.images && item.images.length > 0 ? (
                    <img src={item.images[0]} alt={item.name} />
                  ) : (
                    <div className="seller-item-image-placeholder">
                      No Image
                    </div>
                  )}
                </div>

                <div className="seller-item-content">
                  <div className="seller-item-top">
                    <h2 className="seller-item-title">{item.name}</h2>

                    <span className={`seller-item-status ${item.status}`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="seller-item-category">{item.category}</p>

                  <p className="seller-item-description">{item.description}</p>

                  <div className="seller-item-info">
                    <span>Starting Price</span>

                    <strong>₹{item.start_price}</strong>
                  </div>

                  <div className="seller-item-actions">
                    <Link
                      to={`/seller/items/${item._id}/edit`}
                      className="seller-item-edit-button"
                    >
                      Edit
                    </Link>

                    <button
                      className="seller-item-delete-button"
                      onClick={() => handleDelete(item._id)}
                      disabled={deleteLoading === item._id}
                    >
                      {deleteLoading === item._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default SellerItems;
