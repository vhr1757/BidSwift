import { useEffect, useState } from "react";

import { apiRequest } from "../services/api.js";

import Navbar from "../components/Navbar.jsx";

import "./SellerOrders.css";

function SellerOrders() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [updatingOrder, setUpdatingOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        setError("");

        const data = await apiRequest("/orders");

        console.log("Seller orders received:", data);

        setOrders(Array.isArray(data) ? data : data.orders || []);
      } catch (error) {
        console.error("Failed to fetch seller orders:", error);

        setError(error.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdatingOrder(orderId);

      setError("");

      const updatedOrder = await apiRequest(`/orders/${orderId}`, {
        method: "PUT",

        body: JSON.stringify({
          status,
        }),
      });

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId ? updatedOrder : order,
        ),
      );
    } catch (error) {
      console.error("Failed to update order:", error);

      setError(error.message || "Failed to update order");
    } finally {
      setUpdatingOrder(null);
    }
  };

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
      <div className="seller-orders-page">
        <Navbar />

        <main className="seller-orders-container">
          <div className="seller-orders-message">Loading orders...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="seller-orders-page">
      <Navbar />

      <main className="seller-orders-container">
        <div className="seller-orders-header">
          <div>
            <p className="seller-orders-label">Seller</p>

            <h1>My Orders</h1>

            <p>View and manage orders placed for your items.</p>
          </div>

          <div className="seller-orders-count">
            <span>Total Orders</span>

            <strong>{orders.length}</strong>
          </div>
        </div>

        {error && <div className="seller-orders-error">{error}</div>}

        {orders.length === 0 && !error && (
          <div className="seller-orders-empty">
            <h2>No orders yet</h2>

            <p>Orders for your items will appear here.</p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="seller-orders-grid">
            {orders.map((order) => (
              <div className="seller-order-card" key={order._id}>
                <div className="seller-order-card-header">
                  <div>
                    <span className="seller-order-label">Order</span>

                    <h2>#{order._id.slice(-8)}</h2>
                  </div>

                  <span
                    className={`seller-order-status ${getStatusClass(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="seller-order-item">
                  <span className="seller-order-info-label">Item</span>

                  <strong>{order.item_ID?.name || "Item unavailable"}</strong>
                </div>

                <div className="seller-order-info">
                  <span className="seller-order-info-label">Buyer</span>

                  <strong>
                    {order.buyer_ID?.first_name || "Unknown"}{" "}
                    {order.buyer_ID?.last_name || ""}
                  </strong>
                </div>

                <div className="seller-order-info">
                  <span className="seller-order-info-label">Buyer Email</span>

                  <strong>{order.buyer_ID?.email || "—"}</strong>
                </div>

                <div className="seller-order-info">
                  <span className="seller-order-info-label">Total Amount</span>

                  <strong className="seller-order-amount">
                    ₹{order.total_amount}
                  </strong>
                </div>

                <div className="seller-order-info">
                  <span className="seller-order-info-label">Order Date</span>

                  <strong>
                    {order.order_date
                      ? new Date(order.order_date).toLocaleDateString()
                      : "—"}
                  </strong>
                </div>

                <div className="seller-order-actions">
                  <label htmlFor={`status-${order._id}`}>Update Status</label>

                  <select
                    id={`status-${order._id}`}
                    value={order.status}
                    onChange={(event) =>
                      handleStatusChange(order._id, event.target.value)
                    }
                    disabled={updatingOrder === order._id}
                  >
                    <option value="pending">Pending</option>

                    <option value="confirmed">Confirmed</option>

                    <option value="shipped">Shipped</option>

                    <option value="delivered">Delivered</option>

                    <option value="cancelled">Cancelled</option>
                  </select>

                  {updatingOrder === order._id && (
                    <span className="seller-order-updating">Updating...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default SellerOrders;
