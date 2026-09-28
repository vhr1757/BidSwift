import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../services/api.js";

import Navbar from "../components/Navbar";

import "./SellerDashboard.css";

function SellerDashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        setError(error.message || "Failed to load items");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const totalItems = items.length;

  const availableItems = items.filter(
    (item) => item.status === "available",
  ).length;

  const auctionedItems = items.filter(
    (item) => item.status === "auctioned",
  ).length;

  const soldItems = items.filter((item) => item.status === "sold").length;

  return (
    <div className="seller-dashboard">
      <Navbar />

      <main className="seller-dashboard-content">
        <section className="seller-welcome">
          <div>
            <p className="seller-dashboard-label">Seller Dashboard</p>

            <h1>Welcome, {user?.first_name || "Seller"}!</h1>

            <p>Manage your items and keep track of your auction activity.</p>
          </div>
        </section>

        {error && <div className="seller-dashboard-error">{error}</div>}

        <section className="seller-stat-grid">
          <div className="seller-stat-card">
            <span className="seller-stat-label">Total Items</span>

            <strong>{loading ? "—" : totalItems}</strong>
          </div>

          <div className="seller-stat-card">
            <span className="seller-stat-label">Available</span>

            <strong>{loading ? "—" : availableItems}</strong>
          </div>

          <div className="seller-stat-card">
            <span className="seller-stat-label">Auctioned</span>

            <strong>{loading ? "—" : auctionedItems}</strong>
          </div>

          <div className="seller-stat-card">
            <span className="seller-stat-label">Sold</span>

            <strong>{loading ? "—" : soldItems}</strong>
          </div>
        </section>

        <section className="seller-dashboard-grid">
          <div className="seller-dashboard-card">
            <h2>Quick Actions</h2>

            <div className="seller-action-list">
              <Link to="/seller/items/create" className="seller-action-button">
                Add New Item
              </Link>

              <Link
                to="/seller/items"
                className="seller-action-button secondary"
              >
                Manage My Items
              </Link>

              <Link
                to="/seller/orders"
                className="seller-action-button secondary"
              >
                View Orders
              </Link>
            </div>
          </div>

          <div className="seller-dashboard-card">
            <h2>Seller Information</h2>

            <div className="seller-information">
              <div>
                <span>Name</span>

                <strong>
                  {user?.first_name} {user?.last_name}
                </strong>
              </div>

              <div>
                <span>Email</span>

                <strong>{user?.email || "—"}</strong>
              </div>

              <div>
                <span>Role</span>

                <strong>Seller</strong>
              </div>

              <div>
                <span>Seller Rating</span>

                <strong>{user?.seller_rating ?? "Not available"}</strong>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SellerDashboard;
