import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest } from "../services/api.js";

import Navbar from "../components/Navbar";

import "./CreateItem.css";

function CreateItem() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    start_price: "",
    images: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

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
      setLoading(true);

      const data = await apiRequest("/items", {
        method: "POST",

        body: JSON.stringify({
          name,
          description,
          category,
          start_price: startPrice,
          images,
        }),
      });

      console.log("Item created successfully:", data);

      setSuccess("Item created successfully!");

      setTimeout(() => {
        navigate("/seller/items");
      }, 700);
    } catch (error) {
      console.error("Failed to create item:", error);

      setError(error.message || "Failed to create item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-item-page">
      <Navbar />

      <main className="create-item-container">
        <div className="create-item-header">
          <p className="create-item-label">Seller</p>

          <h1>Add New Item</h1>

          <p>Add an item that you want to list on BidSwift.</p>
        </div>

        <div className="create-item-card">
          {error && <div className="create-item-error">{error}</div>}

          {success && <div className="create-item-success">{success}</div>}

          <form className="create-item-form" onSubmit={handleSubmit}>
            <div className="create-item-field">
              <label htmlFor="name">Item Name</label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter item name"
                disabled={loading}
              />
            </div>

            <div className="create-item-field">
              <label htmlFor="category">Category</label>

              <input
                id="category"
                name="category"
                type="text"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Electronics"
                disabled={loading}
              />
            </div>

            <div className="create-item-field">
              <label htmlFor="start_price">Starting Price</label>

              <input
                id="start_price"
                name="start_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.start_price}
                onChange={handleChange}
                placeholder="Enter starting price"
                disabled={loading}
              />
            </div>

            <div className="create-item-field">
              <label htmlFor="description">Description</label>

              <textarea
                id="description"
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your item"
                disabled={loading}
              />
            </div>

            <div className="create-item-field">
              <label htmlFor="images">Image URLs</label>

              <input
                id="images"
                name="images"
                type="text"
                value={formData.images}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg, https://example.com/image2.jpg"
                disabled={loading}
              />

              <span className="create-item-hint">
                Enter multiple image URLs separated by commas.
              </span>
            </div>

            <div className="create-item-actions">
              <button
                type="button"
                className="create-item-cancel"
                onClick={() => navigate("/seller/items")}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="create-item-submit"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Item"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateItem;
