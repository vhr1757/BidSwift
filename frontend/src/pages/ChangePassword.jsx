import { useState } from "react";

import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";

import { apiRequest } from "../services/api.js";

import "./ChangePassword.css";

function ChangePassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  /*
   * ============================================================
   * HANDLE INPUT CHANGE
   * ============================================================
   */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  /*
   * ============================================================
   * SUBMIT PASSWORD CHANGE
   * ============================================================
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const currentPassword = formData.currentPassword;

    const newPassword = formData.newPassword;

    const confirmPassword = formData.confirmPassword;

    /*
     * ========================================================
     * VALIDATION
     * ========================================================
     */

    if (!currentPassword) {
      setError("Current password is required");

      return;
    }

    if (!newPassword) {
      setError("New password is required");

      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your new password");

      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");

      return;
    }

    if (newPassword === currentPassword) {
      setError("New password must be different from your current password");

      return;
    }

    /*
     * Keep the frontend validation aligned with
     * the password requirements used during registration.
     */

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");

      return;
    }

    try {
      setSaving(true);

      /*
       * ====================================================
       * CHANGE PASSWORD
       * ====================================================
       */

      const data = await apiRequest("/auth/password", {
        method: "PUT",

        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      setMessage(data.message || "Password changed successfully");

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      /*
       * Return to profile after the
       * user has seen the success message.
       */

      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    } catch (error) {
      console.error("Failed to change password:", error);

      setError(error.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="change-password-page">
        <div className="change-password-container">
          <div className="change-password-header">
            <h1>Change Password</h1>

            <p>Update your BidSwift account password.</p>
          </div>

          <section className="change-password-card">
            {error && <div className="change-password-error">{error}</div>}

            {message && (
              <div className="change-password-success">{message}</div>
            )}

            <form className="change-password-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>

                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  disabled={saving}
                  autoComplete="current-password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>

                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  disabled={saving}
                  autoComplete="new-password"
                />

                <small>Use at least 6 characters.</small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={saving}
                  autoComplete="new-password"
                />
              </div>

              <div className="change-password-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => navigate("/profile")}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button type="submit" className="save-button" disabled={saving}>
                  {saving ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}

export default ChangePassword;
