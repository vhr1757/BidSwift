import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import { apiRequest } from "../services/api.js";

import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [wallet, setWallet] = useState(null);

  const [loading, setLoading] = useState(true);

  const [walletLoading, setWalletLoading] = useState(false);

  const [error, setError] = useState("");

  const [walletError, setWalletError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");

      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);
    } catch (error) {
      console.error("Failed to read user information:", error);

      localStorage.removeItem("user");

      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!user || user.role !== "buyer") {
      return;
    }

    const fetchWallet = async () => {
      try {
        setWalletLoading(true);

        setWalletError("");

        const data = await apiRequest("/wallets/me");

        setWallet(data);
      } catch (error) {
        console.error("Failed to fetch wallet:", error);

        setWalletError(error.message || "Failed to load wallet information");
      } finally {
        setWalletLoading(false);
      }
    };

    fetchWallet();
  }, [user]);

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="profile-page">
          <div className="profile-container">
            <p className="profile-loading">Loading profile...</p>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return null;
  }

  const firstName = user.first_name || "";

  const lastName = user.last_name || "";

  const fullName = `${firstName} ${lastName}`.trim();

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const role = user.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "User";

  const balance = wallet?.balance ?? 0;

  const frozenAmount = wallet?.frozen_amount ?? 0;

  const availableBalance = balance - frozenAmount;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatTransactionType = (type) => {
    if (!type) {
      return "Transaction";
    }

    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const transactions =
    wallet?.transaction_history
      ?.slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5) || [];

  return (
    <>
      <Navbar />

      <main className="profile-page">
        <div className="profile-container">

          <section className="profile-hero card">
            <div className="profile-avatar">{initials || "U"}</div>

            <div className="profile-hero-info">
              <h2>{fullName || "BidSwift User"}</h2>

              <p>{user.email}</p>

              <span className="profile-role">{role}</span>
            </div>
          </section>

          <section className="profile-section">
            <div className="section-heading">
              <div>
                <h2>Account Information</h2>

                <p>Your registered BidSwift account details.</p>
              </div>
            </div>

            <div className="account-grid">
              <div className="account-item">
                <span>First Name</span>

                <strong>{firstName || "—"}</strong>
              </div>

              <div className="account-item">
                <span>Last Name</span>

                <strong>{lastName || "—"}</strong>
              </div>

              <div className="account-item">
                <span>Email Address</span>

                <strong>{user.email || "—"}</strong>
              </div>

              <div className="account-item">
                <span>Account Type</span>

                <strong>{role}</strong>
              </div>
            </div>
          </section>

          {user.role === "buyer" && (
            <section className="profile-section">
              <div className="section-heading">
                <div>
                  <h2>Wallet Overview</h2>

                  <p>Your current wallet and bidding funds.</p>
                </div>

                <button
                  className="secondary-button"
                  onClick={() => navigate("/wallet")}
                >
                  Open Wallet
                </button>
              </div>

              {walletLoading && (
                <div className="profile-message">Loading wallet...</div>
              )}

              {walletError && (
                <div className="profile-error">{walletError}</div>
              )}

              {!walletLoading && !walletError && wallet && (
                <div className="profile-wallet-grid">
                  <div className="profile-wallet-card">
                    <span>Total Balance</span>

                    <strong>{formatCurrency(balance)}</strong>
                  </div>

                  <div className="profile-wallet-card available">
                    <span>Available Balance</span>

                    <strong>{formatCurrency(availableBalance)}</strong>
                  </div>

                  <div className="profile-wallet-card frozen">
                    <span>Frozen for Bids</span>

                    <strong>{formatCurrency(frozenAmount)}</strong>
                  </div>
                </div>
              )}
            </section>
          )}

          {user.role === "buyer" &&
            wallet &&
            !walletLoading &&
            !walletError && (
              <section className="profile-section">
                <div className="section-heading">
                  <div>
                    <h2>Recent Transactions</h2>

                    <p>Your latest wallet activity.</p>
                  </div>
                </div>

                {transactions.length === 0 ? (
                  <div className="empty-state">No wallet transactions yet.</div>
                ) : (
                  <div className="transaction-list">
                    {transactions.map((transaction, index) => (
                      <div
                        className="transaction-row"
                        key={
                          transaction._id || `${transaction.createdAt}-${index}`
                        }
                      >
                        <div className="transaction-info">
                          <span className="transaction-type">
                            {formatTransactionType(transaction.type)}
                          </span>

                          <span className="transaction-date">
                            {formatDate(transaction.createdAt)}
                          </span>
                        </div>

                        <strong
                          className={
                            transaction.type === "deposit" ||
                            transaction.type === "unfreeze"
                              ? "transaction-positive"
                              : "transaction-negative"
                          }
                        >
                          {transaction.type === "deposit" ||
                          transaction.type === "unfreeze"
                            ? "+"
                            : "-"}
                          {formatCurrency(transaction.amount)}
                        </strong>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
        </div>
      </main>
    </>
  );
}

export default Profile;
