import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { apiRequest } from "../services/api.js";

import Navbar from "../components/Navbar.jsx";

import "./EditItem.css";

function EditItem() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    start_price: "",
    images: "",
  });

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError("");

        const item = await apiRequest(`/items/${id}`);

        setFormData({
          name: item.name || "",

          description: item.description || "",

          category: item.category || "",

          start_price: item.start_price ?? "",

          images: Array.isArray(item.images) ? item.images.join(", ") : "",
        });
      } catch (error) {
        console.error("Failed to fetch item:", error);

        setError(error.message || "Failed to load item");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = formData.name.trim();

    const description = formData.description.trim();

    const category = formData.category.trim();

    const startPrice = Number(formData.start_price);

    if (!name) {
      setError("Please enter an item name");

      return;
    }

    if (!description) {
      setError("Please enter a description");

      return;
    }

    if (!category) {
      setError("Please enter a category");

      return;
    }

    if (!Number.isFinite(startPrice) || startPrice < 0) {
      setError("Please enter a valid starting price");

      return;
    }

    const images = formData.images
      .split(",")
      .map((image) => image.trim())
      .filter((image) => image.length > 0);

    try {
      setSaving(true);

      const data = await apiRequest(`/items/${id}`, {
        method: "PUT",

        body: JSON.stringify({
          name,
          description,
          category,
          start_price: startPrice,
          images,
        }),
      });

      console.log("Item updated successfully:", data);

      setSuccess("Item updated successfully!");

      setTimeout(() => {
        navigate("/seller/items");
      }, 700);
    } catch (error) {
      console.error("Failed to update item:", error);

      setError(error.message || "Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-item-page">
        <Navbar />

        <main className="edit-item-container">
          <div className="edit-item-message">Loading item...</div>
        </main>
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="edit-item-page">
        <Navbar />

        <main className="edit-item-container">
          <div className="edit-item-error-page">
            <h2>Unable to load item</h2>

            <p>{error}</p>

            <button
              type="button"
              onClick={() => navigate("/seller/items")}
              className="edit-item-back-button"
            >
              Back to My Items
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="edit-item-page">
      <Navbar />

      <main className="edit-item-container">
        <div className="edit-item-header">
          <p className="edit-item-label">Seller</p>

          <h1>Edit Item</h1>

          <p>Update the details of your listed item.</p>
        </div>

        <div className="edit-item-card">
          {error && <div className="edit-item-error">{error}</div>}

          {success && <div className="edit-item-success">{success}</div>}

          <form className="edit-item-form" onSubmit={handleSubmit}>
            <div className="edit-item-field">
              <label htmlFor="name">Item Name</label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div className="edit-item-field">
              <label htmlFor="category">Category</label>

              <input
                id="category"
                name="category"
                type="text"
                value={formData.category}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div className="edit-item-field">
              <label htmlFor="start_price">Starting Price</label>

              <input
                id="start_price"
                name="start_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.start_price}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div className="edit-item-field">
              <label htmlFor="description">Description</label>

              <textarea
                id="description"
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div className="edit-item-field">
              <label htmlFor="images">Image URLs</label>

              <input
                id="images"
                name="images"
                type="text"
                value={formData.images}
                onChange={handleChange}
                disabled={saving}
              />

              <span className="edit-item-hint">
                Enter multiple image URLs separated by commas.
              </span>
            </div>

            <div className="edit-item-actions">
              <button
                type="button"
                className="edit-item-cancel"
                onClick={() => navigate("/seller/items")}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="edit-item-submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default EditItem;
