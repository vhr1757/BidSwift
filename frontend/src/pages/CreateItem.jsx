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
  });

  const [selectedImages, setSelectedImages] = useState([]);

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

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    if (selectedImages.length + files.length > 5) {
      setError("You can upload a maximum of 5 images");
      event.target.value = "";
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    const invalidFile = files.find((file) => !allowedTypes.includes(file.type));

    if (invalidFile) {
      setError("Only JPG, PNG and WebP images are allowed");
      event.target.value = "";
      return;
    }

    const oversizedFile = files.find((file) => file.size > 5 * 1024 * 1024);

    if (oversizedFile) {
      setError("Each image must be smaller than 5 MB");
      event.target.value = "";
      return;
    }

    setError("");

    setSelectedImages((previousImages) => [...previousImages, ...files]);

    event.target.value = "";
  };

  const removeImage = (indexToRemove) => {
    setSelectedImages((previousImages) =>
      previousImages.filter((_, index) => index !== indexToRemove),
    );
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

    if (selectedImages.length === 0) {
      setError("Please select at least one image");
      return;
    }

    try {
      setLoading(true);

      const requestData = new FormData();

      requestData.append("name", name);

      requestData.append("description", description);

      requestData.append("category", category);

      requestData.append("start_price", startPrice);

      selectedImages.forEach((image) => {
        requestData.append("images", image);
      });

      const data = await apiRequest("/items", {
        method: "POST",
        body: requestData,
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
              <label htmlFor="images">Item Images</label>

              <input
                id="images"
                name="images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageChange}
                disabled={loading || selectedImages.length >= 5}
              />

              <span className="create-item-hint">
                Select up to 5 images. JPG, PNG and WebP only. Maximum 5 MB per
                image.
              </span>

              {selectedImages.length > 0 && (
                <div className="create-item-image-preview-grid">
                  {selectedImages.map((image, index) => (
                    <div
                      className="create-item-image-preview"
                      key={`${image.name}-${index}`}
                    >
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                      />

                      <button
                        type="button"
                        className="create-item-image-remove"
                        onClick={() => removeImage(index)}
                        disabled={loading}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
