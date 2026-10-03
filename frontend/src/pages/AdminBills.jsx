import { useEffect, useState } from "react";

import Navbar from "../components/Navbar.jsx";

import { apiRequest } from "../services/api.js";

import "./AdminBills.css";

function AdminBills() {
  const [bills, setBills] = useState([]);

  const [orders, setOrders] = useState([]);

  const [selectedStatus, setSelectedStatus] = useState("all");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    order_ID: "",
    tax: "",
  });

  const fetchBills = async () => {
    try {
      setLoading(true);

      setError("");

      const data = await apiRequest("/bills");

      const allBills = Array.isArray(data) ? data : data.bills || [];

      setBills(allBills);
    } catch (error) {
      console.error("Failed to fetch bills:", error);

      setError(error.message || "Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await apiRequest("/orders");

      const allOrders = Array.isArray(data) ? data : data.orders || [];

      setOrders(allOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  useEffect(() => {
    fetchBills();

    fetchOrders();
  }, []);

  const handleCreateBill = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.order_ID) {
      setError("Please select an order");

      return;
    }

    const tax = Number(formData.tax);

    if (!Number.isFinite(tax) || tax < 0) {
      setError("Tax must be a valid number");

      return;
    }

    try {
      setActionLoading(true);

      await apiRequest("/bills", {
        method: "POST",

        body: JSON.stringify({
          order_ID: formData.order_ID,

          tax,
        }),
      });

      setShowCreateForm(false);

      setFormData({
        order_ID: "",
        tax: "",
      });

      await fetchBills();
    } catch (error) {
      console.error("Failed to create bill:", error);

      setError(error.message || "Failed to create bill");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePaymentStatusChange = async (billId, paymentStatus) => {
    try {
      setActionLoading(true);

      setError("");

      await apiRequest(`/bills/${billId}/payment`, {
        method: "PUT",

        body: JSON.stringify({
          payment_status: paymentStatus,
        }),
      });

      setBills((previous) =>
        previous.map((bill) =>
          bill._id === billId
            ? {
                ...bill,
                payment_status: paymentStatus,
              }
            : bill,
        ),
      );
    } catch (error) {
      console.error("Failed to update payment status:", error);

      setError(error.message || "Failed to update payment status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBill = async (bill) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this bill?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      setError("");

      await apiRequest(`/bills/${bill._id}`, {
        method: "DELETE",
      });

      setBills((previous) =>
        previous.filter((currentBill) => currentBill._id !== bill._id),
      );
    } catch (error) {
      console.error("Failed to delete bill:", error);

      setError(error.message || "Failed to delete bill");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusCount = (status) => {
    return bills.filter((bill) => bill.payment_status === status).length;
  };

  const filteredBills =
    selectedStatus === "all"
      ? bills
      : bills.filter((bill) => bill.payment_status === selectedStatus);

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

  const getOrderItemName = (order) => {
    if (!order) {
      return "—";
    }

    return order.item_ID?.name || "Order";
  };

  const getBuyerName = (order) => {
    if (!order?.buyer_ID) {
      return "—";
    }

    const buyer = order.buyer_ID;

    return `${buyer.first_name || ""} ${buyer.last_name || ""}`.trim() || "—";
  };

  const handleOpenCreateForm = () => {
    setError("");

    setFormData({
      order_ID: "",
      tax: "",
    });

    setShowCreateForm(true);
  };

  const handleCloseCreateForm = () => {
    setShowCreateForm(false);

    setFormData({
      order_ID: "",
      tax: "",
    });

    setError("");
  };

  return (
    <div className="admin-bills-page">
      <Navbar />

      <main className="admin-bills-content">
        <div className="admin-bills-header">
          <div>
            <p className="admin-page-label">Administration</p>

            <h1>Manage Bills</h1>

            <p>View and manage billing and payment information.</p>
          </div>

          <div className="admin-bills-header-actions">
            <button
              className="admin-refresh-button"
              onClick={fetchBills}
              disabled={loading || actionLoading}
            >
              Refresh
            </button>

            <button
              className="admin-create-button"
              onClick={handleOpenCreateForm}
              disabled={actionLoading}
            >
              Create Bill
            </button>
          </div>
        </div>

        {error && <div className="admin-bills-error">{error}</div>}

        <div className="admin-bill-summary">
          <button
            className={
              selectedStatus === "all"
                ? "admin-bill-summary-card active"
                : "admin-bill-summary-card"
            }
            onClick={() => setSelectedStatus("all")}
          >
            <span>Total</span>

            <strong>{bills.length}</strong>
          </button>

          <button
            className={
              selectedStatus === "pending"
                ? "admin-bill-summary-card active"
                : "admin-bill-summary-card"
            }
            onClick={() => setSelectedStatus("pending")}
          >
            <span>Pending</span>

            <strong>{getStatusCount("pending")}</strong>
          </button>

          <button
            className={
              selectedStatus === "paid"
                ? "admin-bill-summary-card active"
                : "admin-bill-summary-card"
            }
            onClick={() => setSelectedStatus("paid")}
          >
            <span>Paid</span>

            <strong>{getStatusCount("paid")}</strong>
          </button>

          <button
            className={
              selectedStatus === "failed"
                ? "admin-bill-summary-card active"
                : "admin-bill-summary-card"
            }
            onClick={() => setSelectedStatus("failed")}
          >
            <span>Failed</span>

            <strong>{getStatusCount("failed")}</strong>
          </button>

          <button
            className={
              selectedStatus === "refunded"
                ? "admin-bill-summary-card active"
                : "admin-bill-summary-card"
            }
            onClick={() => setSelectedStatus("refunded")}
          >
            <span>Refunded</span>

            <strong>{getStatusCount("refunded")}</strong>
          </button>
        </div>

        <section className="admin-bills-card">
          <div className="admin-bills-card-header">
            <div>
              <h2>
                {selectedStatus === "all"
                  ? "All Bills"
                  : `${selectedStatus.charAt(0).toUpperCase()}${selectedStatus.slice(1)} Bills`}
              </h2>

              <span>
                {filteredBills.length} bill
                {filteredBills.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="admin-bills-loading">Loading bills...</div>
          ) : filteredBills.length === 0 ? (
            <div className="admin-bills-empty">No bills found.</div>
          ) : (
            <div className="admin-bills-table-wrapper">
              <table className="admin-bills-table">
                <thead>
                  <tr>
                    <th>Bill ID</th>

                    <th>Order</th>

                    <th>Buyer</th>

                    <th>Total</th>

                    <th>Tax</th>

                    <th>Final Amount</th>

                    <th>Payment Status</th>

                    <th>Generated</th>

                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBills.map((bill) => {
                    const order = bill.order_ID;

                    return (
                      <tr key={bill._id}>
                        <td>
                          <span className="admin-bill-id">{bill._id}</span>
                        </td>

                        <td>
                          <div className="admin-bill-order">
                            <strong>{getOrderItemName(order)}</strong>

                            <span>{order?._id || "—"}</span>
                          </div>
                        </td>

                        <td>
                          <div className="admin-bill-buyer">
                            <strong>{getBuyerName(order)}</strong>

                            {order?.buyer_ID?.email && (
                              <span>{order.buyer_ID.email}</span>
                            )}
                          </div>
                        </td>

                        <td>{bill.total_amount}</td>

                        <td>{bill.tax}</td>

                        <td>
                          <strong>{bill.final_amount}</strong>
                        </td>

                        <td>
                          <select
                            className={`admin-bill-status-select admin-bill-status-${bill.payment_status}`}
                            value={bill.payment_status}
                            onChange={(event) =>
                              handlePaymentStatusChange(
                                bill._id,
                                event.target.value,
                              )
                            }
                            disabled={actionLoading}
                          >
                            <option value="pending">Pending</option>

                            <option value="paid">Paid</option>

                            <option value="failed">Failed</option>

                            <option value="refunded">Refunded</option>
                          </select>
                        </td>

                        <td>{formatDate(bill.generated_at)}</td>

                        <td>
                          <button
                            className="admin-delete-button"
                            onClick={() => handleDeleteBill(bill)}
                            disabled={actionLoading}
                          >
                            Delete
                          </button>
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

      {showCreateForm && (
        <div className="admin-bill-overlay">
          <div className="admin-bill-form-card">
            <div className="admin-bill-form-header">
              <div>
                <h2>Create Bill</h2>

                <p>Generate a bill for an order.</p>
              </div>

              <button
                type="button"
                className="admin-form-close"
                onClick={handleCloseCreateForm}
              >
                ×
              </button>
            </div>

            <form className="admin-bill-form" onSubmit={handleCreateBill}>
              <div className="admin-form-group">
                <label>Order</label>

                <select
                  value={formData.order_ID}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      order_ID: event.target.value,
                    }))
                  }
                  disabled={actionLoading}
                >
                  <option value="">Select an order</option>

                  {orders.map((order) => (
                    <option key={order._id} value={order._id}>
                      {getOrderItemName(order)}
                      {" — "}
                      {order.total_amount}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label>Tax</label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.tax}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      tax: event.target.value,
                    }))
                  }
                  placeholder="Enter tax amount"
                  disabled={actionLoading}
                />
              </div>

              <div className="admin-bill-form-actions">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={handleCloseCreateForm}
                  disabled={actionLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Creating..." : "Create Bill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBills;
