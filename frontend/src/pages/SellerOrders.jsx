import { useEffect, useState } from "react";

import { apiRequest } from "../services/api.js";

import Navbar from "../components/Navbar.jsx";

import "./SellerOrders.css";

function SellerOrders() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [confirmingOrder, setConfirmingOrder] = useState(null);

  const [taxValues, setTaxValues] = useState({});

  const [currentTime, setCurrentTime] = useState(new Date());

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

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleTaxChange = (orderId, value) => {
    setTaxValues((previous) => ({
      ...previous,

      [orderId]: value,
    }));
  };

  const handleConfirmOrder = async (order) => {
    const tax = Number(taxValues[order._id] || 0);

    if (!Number.isFinite(tax) || tax < 0) {
      setError("Tax must be a valid number greater than or equal to 0");

      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to confirm this order?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setConfirmingOrder(order._id);

      setError("");

      await apiRequest(`/orders/${order._id}/confirm`, {
        method: "POST",

        body: JSON.stringify({
          tax,
        }),
      });

      setOrders((previousOrders) =>
        previousOrders.map((previousOrder) =>
          previousOrder._id === order._id
            ? {
                ...previousOrder,

                status: "confirmed",

                confirmation_deadline: null,
              }
            : previousOrder,
        ),
      );

      setTaxValues((previous) => {
        const updated = {
          ...previous,
        };

        delete updated[order._id];

        return updated;
      });
    } catch (error) {
      console.error("Failed to confirm order:", error);

      setError(error.message || "Failed to confirm order");

      /*
            Refresh orders in case the backend
            expired the order while this page
            was open.
            */

      await fetchOrders();
    } finally {
      setConfirmingOrder(null);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      setConfirmingOrder(orderId);

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
      setConfirmingOrder(null);
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

  const getTimeRemaining = (deadline) => {
    if (!deadline) {
      return null;
    }

    const deadlineTime = new Date(deadline).getTime();

    const remaining = deadlineTime - currentTime.getTime();

    if (remaining <= 0) {
      return {
        expired: true,

        text: "Confirmation expired",
      };
    }

    const totalSeconds = Math.floor(remaining / 1000);

    const days = Math.floor(totalSeconds / (24 * 60 * 60));

    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));

    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);

    const seconds = totalSeconds % 60;

    if (days > 0) {
      return {
        expired: false,

        text: `${days}d ${hours}h ${minutes}m ${seconds}s`,
      };
    }

    return {
      expired: false,

      text: `${hours}h ${minutes}m ${seconds}s`,
    };
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
            {orders.map((order) => {
              const countdown = getTimeRemaining(order.confirmation_deadline);

              const isPending = order.status === "pending";

              const isExpired = countdown?.expired;

              return (
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
                    <span className="seller-order-info-label">
                      Total Amount
                    </span>

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

                  {isPending && order.confirmation_deadline && (
                    <div
                      className={`seller-order-deadline ${
                        isExpired ? "expired" : ""
                      }`}
                    >
                      <span>Seller confirmation deadline</span>

                      <strong>{countdown?.text}</strong>
                    </div>
                  )}

                  {isPending && order.confirmation_deadline && !isExpired && (
                    <div className="seller-order-confirmation">
                      <label htmlFor={`tax-${order._id}`}>Tax</label>

                      <div className="seller-order-tax-row">
                        <input
                          id={`tax-${order._id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={taxValues[order._id] || ""}
                          onChange={(event) =>
                            handleTaxChange(order._id, event.target.value)
                          }
                          placeholder="0"
                          disabled={confirmingOrder === order._id}
                        />

                        <button
                          type="button"
                          className="seller-order-confirm-button"
                          onClick={() => handleConfirmOrder(order)}
                          disabled={confirmingOrder === order._id}
                        >
                          {confirmingOrder === order._id
                            ? "Confirming..."
                            : "Confirm Order"}
                        </button>
                      </div>

                      <small>
                        Confirming the order completes the buyer's payment,
                        creates the bill, and marks the item as sold.
                      </small>
                    </div>
                  )}

                  {isPending && isExpired && (
                    <div className="seller-order-expired">
                      Seller confirmation period has expired.
                    </div>
                  )}

                  {!isPending && order.status !== "cancelled" && (
                    <div className="seller-order-actions">
                      <label htmlFor={`status-${order._id}`}>
                        Update Status
                      </label>

                      <select
                        id={`status-${order._id}`}
                        value={order.status}
                        onChange={(event) =>
                          handleStatusChange(order._id, event.target.value)
                        }
                        disabled={confirmingOrder === order._id}
                      >
                        <option value="confirmed">Confirmed</option>

                        <option value="shipped">Shipped</option>

                        <option value="delivered">Delivered</option>
                      </select>

                      {confirmingOrder === order._id && (
                        <span className="seller-order-updating">
                          Updating...
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default SellerOrders;
