import { useEffect, useState } from "react";

import { apiRequest } from "../services/api.js";

import Navbar from "../components/Navbar.jsx";

import "./BuyerBills.css";

function BuyerBills() {
  const [bills, setBills] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchBills = async () => {
    try {
      setLoading(true);

      setError("");

      const data = await apiRequest("/bills");

      console.log("Buyer bills received:", data);

      setBills(Array.isArray(data) ? data : data.bills || []);
    } catch (error) {
      console.error("Failed to fetch buyer bills:", error);

      setError(error.message || "Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case "paid":
        return "paid";

      case "failed":
        return "failed";

      case "refunded":
        return "refunded";

      case "pending":
      default:
        return "pending";
    }
  };

  if (loading) {
    return (
      <div className="buyer-bills-page">
        <Navbar />

        <main className="buyer-bills-container">
          <div className="buyer-bills-message">Loading bills...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="buyer-bills-page">
      <Navbar />

      <main className="buyer-bills-container">
        <div className="buyer-bills-header">
          <div>
            <p className="buyer-bills-label">Buyer</p>

            <h1>My Bills</h1>

            <p>View bills generated for your completed orders.</p>
          </div>

          <div className="buyer-bills-count">
            <span>Total Bills</span>

            <strong>{bills.length}</strong>
          </div>
        </div>

        {error && <div className="buyer-bills-error">{error}</div>}

        {bills.length === 0 && !error && (
          <div className="buyer-bills-empty">
            <h2>No bills yet</h2>

            <p>Bills generated for your confirmed orders will appear here.</p>
          </div>
        )}

        {bills.length > 0 && (
          <div className="buyer-bills-grid">
            {bills.map((bill) => (
              <div className="buyer-bill-card" key={bill._id}>
                <div className="buyer-bill-card-header">
                  <div>
                    <span className="buyer-bill-label">Bill</span>

                    <h2>#{bill._id.slice(-8)}</h2>
                  </div>

                  <span
                    className={`buyer-bill-payment-status ${getPaymentStatusClass(
                      bill.payment_status,
                    )}`}
                  >
                    {bill.payment_status}
                  </span>
                </div>

                <div className="buyer-bill-info">
                  <span className="buyer-bill-info-label">Order</span>

                  <strong>
                    #{bill.order_ID?._id ? bill.order_ID._id.slice(-8) : "—"}
                  </strong>
                </div>

                <div className="buyer-bill-info">
                  <span className="buyer-bill-info-label">Item</span>

                  <strong>
                    {bill.order_ID?.item_ID?.name || "Item unavailable"}
                  </strong>
                </div>

                <div className="buyer-bill-info">
                  <span className="buyer-bill-info-label">Order Amount</span>

                  <strong>₹{bill.total_amount}</strong>
                </div>

                <div className="buyer-bill-info">
                  <span className="buyer-bill-info-label">Tax</span>

                  <strong>₹{bill.tax}</strong>
                </div>

                <div className="buyer-bill-final">
                  <span>Final Amount</span>

                  <strong>₹{bill.final_amount}</strong>
                </div>

                <div className="buyer-bill-generated">
                  Generated on{" "}
                  {bill.generated_at
                    ? new Date(bill.generated_at).toLocaleString()
                    : "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default BuyerBills;
