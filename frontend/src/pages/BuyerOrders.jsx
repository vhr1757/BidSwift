import { useEffect, useState } from "react";

import { apiRequest } from "../services/api.js";

import Navbar from "../components/Navbar.jsx";

import "./BuyerOrders.css";

function BuyerOrders() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);

      setError("");

      const data = await apiRequest("/orders");

      console.log("Buyer orders received:", data);

      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (error) {
      console.error("Failed to fetch buyer orders:", error);

      setError(error.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "confirmed";

      case "shipped":
        return "shipped";

      case "delivered":
        return "delivered";

      case "cancelled":
        return "cancelled";

      case "pending":
      default:
        return "pending";
    }
  };

  if (loading) {
    return (
      <div className="buyer-orders-page">
        <Navbar />

        <main className="buyer-orders-container">
          <div className="buyer-orders-message">Loading orders...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="buyer-orders-page">
      <Navbar />

      <main className="buyer-orders-container">
        <div className="buyer-orders-header">
          <div>
            <p className="buyer-orders-label">Buyer</p>

            <h1>My Orders</h1>

            <p>View your auction orders and their current status.</p>
          </div>

          <div className="buyer-orders-count">
            <span>Total Orders</span>

            <strong>{orders.length}</strong>
          </div>
        </div>

        {error && <div className="buyer-orders-error">{error}</div>}

        {orders.length === 0 && !error && (
          <div className="buyer-orders-empty">
            <h2>No orders yet</h2>

            <p>Orders you win through auctions will appear here.</p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="buyer-orders-grid">
            {orders.map((order) => (
              <div className="buyer-order-card" key={order._id}>
                <div className="buyer-order-card-header">
                  <div>
                    <span className="buyer-order-label">Order</span>

                    <h2>#{order._id.slice(-8)}</h2>
                  </div>

                  <span
                    className={`buyer-order-status ${getStatusClass(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="buyer-order-item">
                  <span className="buyer-order-info-label">Item</span>

                  <strong>{order.item_ID?.name || "Item unavailable"}</strong>
                </div>

                <div className="buyer-order-info">
                  <span className="buyer-order-info-label">Seller</span>

                  <strong>
                    {order.item_ID?.seller_ID?.first_name || "Unknown"}{" "}
                    {order.item_ID?.seller_ID?.last_name || ""}
                  </strong>
                </div>

                <div className="buyer-order-info">
                  <span className="buyer-order-info-label">Order Date</span>

                  <strong>
                    {order.order_date
                      ? new Date(order.order_date).toLocaleDateString()
                      : "—"}
                  </strong>
                </div>

                <div className="buyer-order-info">
                  <span className="buyer-order-info-label">Total Amount</span>

                  <strong className="buyer-order-amount">
                    ₹{order.total_amount}
                  </strong>
                </div>

                <div className="buyer-order-info">
                  <span className="buyer-order-info-label">Payment Status</span>

                  <strong>
                    {order.status === "confirmed" ||
                    order.status === "shipped" ||
                    order.status === "delivered"
                      ? "Paid"
                      : order.status === "cancelled"
                        ? "Cancelled"
                        : "Pending"}
                  </strong>
                </div>

                <div className="buyer-order-info">
                  <span className="buyer-order-info-label">Order Status</span>

                  <span
                    className={`buyer-order-status ${getStatusClass(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default BuyerOrders;
