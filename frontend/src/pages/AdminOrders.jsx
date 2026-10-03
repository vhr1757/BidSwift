import { useEffect, useState } from "react";

import Navbar from "../components/Navbar.jsx";

import { apiRequest } from "../services/api.js";

import "./AdminOrders.css";

function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const [selectedStatus, setSelectedStatus] = useState("all");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      setError("");

      const data = await apiRequest("/orders");

      const allOrders = Array.isArray(data) ? data : data.orders || [];

      setOrders(allOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);

      setError(error.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      setActionLoading(true);

      setError("");

      await apiRequest(`/orders/${orderId}`, {
        method: "PUT",

        body: JSON.stringify({
          status,
        }),
      });

      setOrders((previous) =>
        previous.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status,
              }
            : order,
        ),
      );
    } catch (error) {
      console.error("Failed to update order:", error);

      setError(error.message || "Failed to update order");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOrders =
    selectedStatus === "all"
      ? orders
      : orders.filter((order) => order.status === selectedStatus);

  const getStatusCount = (status) => {
    return orders.filter((order) => order.status === status).length;
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleString();
  };

  const getBuyerName = (buyer) => {
    if (!buyer) {
      return "—";
    }

    if (buyer.first_name || buyer.last_name) {
      return `${buyer.first_name || ""} ${buyer.last_name || ""}`.trim();
    }

    return "—";
  };

  const getItemName = (item) => {
    if (!item) {
      return "—";
    }

    return item.name || "—";
  };

  return (
    <div className="admin-orders-page">
      <Navbar />

      <main className="admin-orders-content">
        <div className="admin-orders-header">
          <div>
            <p className="admin-page-label">Administration</p>

            <h1>Manage Orders</h1>

            <p>View and manage all orders on the BidSwift platform.</p>
          </div>

          <button
            className="admin-refresh-button"
            onClick={fetchOrders}
            disabled={loading || actionLoading}
          >
            Refresh
          </button>
        </div>

        {error && <div className="admin-orders-error">{error}</div>}

        <div className="admin-order-summary">
          <button
            className={
              selectedStatus === "all"
                ? "admin-order-summary-card active"
                : "admin-order-summary-card"
            }
            onClick={() => setSelectedStatus("all")}
          >
            <span>Total</span>

            <strong>{orders.length}</strong>
          </button>

          <button
            className={
              selectedStatus === "pending"
                ? "admin-order-summary-card active"
                : "admin-order-summary-card"
            }
            onClick={() => setSelectedStatus("pending")}
          >
            <span>Pending</span>

            <strong>{getStatusCount("pending")}</strong>
          </button>

          <button
            className={
              selectedStatus === "confirmed"
                ? "admin-order-summary-card active"
                : "admin-order-summary-card"
            }
            onClick={() => setSelectedStatus("confirmed")}
          >
            <span>Confirmed</span>

            <strong>{getStatusCount("confirmed")}</strong>
          </button>

          <button
            className={
              selectedStatus === "shipped"
                ? "admin-order-summary-card active"
                : "admin-order-summary-card"
            }
            onClick={() => setSelectedStatus("shipped")}
          >
            <span>Shipped</span>

            <strong>{getStatusCount("shipped")}</strong>
          </button>

          <button
            className={
              selectedStatus === "delivered"
                ? "admin-order-summary-card active"
                : "admin-order-summary-card"
            }
            onClick={() => setSelectedStatus("delivered")}
          >
            <span>Delivered</span>

            <strong>{getStatusCount("delivered")}</strong>
          </button>

          <button
            className={
              selectedStatus === "cancelled"
                ? "admin-order-summary-card active"
                : "admin-order-summary-card"
            }
            onClick={() => setSelectedStatus("cancelled")}
          >
            <span>Cancelled</span>

            <strong>{getStatusCount("cancelled")}</strong>
          </button>
        </div>

        <section className="admin-orders-card">
          <div className="admin-orders-card-header">
            <div>
              <h2>
                {selectedStatus === "all"
                  ? "All Orders"
                  : `${selectedStatus.charAt(0).toUpperCase()}${selectedStatus.slice(1)} Orders`}
              </h2>

              <span>
                {filteredOrders.length} order
                {filteredOrders.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="admin-orders-loading">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="admin-orders-empty">No orders found.</div>
          ) : (
            <div className="admin-orders-table-wrapper">
              <table className="admin-orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>

                    <th>Item</th>

                    <th>Buyer</th>

                    <th>Amount</th>

                    <th>Order Date</th>

                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => {
                    const buyer = order.buyer_ID;

                    const item = order.item_ID;

                    return (
                      <tr key={order._id}>
                        <td>
                          <span className="admin-order-id">{order._id}</span>
                        </td>

                        <td>
                          <div className="admin-order-item">
                            <strong>{getItemName(item)}</strong>

                            {item?.category && <span>{item.category}</span>}
                          </div>
                        </td>

                        <td>
                          <div className="admin-order-buyer">
                            <strong>{getBuyerName(buyer)}</strong>

                            {buyer?.email && <span>{buyer.email}</span>}
                          </div>
                        </td>

                        <td>{order.total_amount}</td>

                        <td>{formatDate(order.order_date)}</td>

                        <td>
                          <select
                            className={`admin-order-status-select admin-order-status-${order.status}`}
                            value={order.status}
                            onChange={(event) =>
                              handleStatusChange(order._id, event.target.value)
                            }
                            disabled={actionLoading}
                          >
                            <option value="pending">Pending</option>

                            <option value="confirmed">Confirmed</option>

                            <option value="shipped">Shipped</option>

                            <option value="delivered">Delivered</option>

                            <option value="cancelled">Cancelled</option>
                          </select>
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
    </div>
  );
}

export default AdminOrders;
