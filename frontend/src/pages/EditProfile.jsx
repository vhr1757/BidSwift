import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";

import { apiRequest } from "../services/api.js";

import "./EditProfile.css";

function EditProfile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);

      setFormData({
        first_name: parsedUser.first_name || "",

        last_name: parsedUser.last_name || "",

        email: parsedUser.email || "",
      });
    } catch (error) {
      console.error("Failed to read user information:", error);

      localStorage.removeItem("user");

      navigate("/login", {
        replace: true,
      });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");

    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    setMessage("");

    const firstName = formData.first_name.trim();

    const lastName = formData.last_name.trim();

    const email = formData.email.trim().toLowerCase();

    if (!firstName) {
      setError("First name is required");

      return;
    }

    if (!lastName) {
      setError("Last name is required");

      return;
    }

    if (!email) {
      setError("Email address is required");

      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");

      return;
    }

    try {
      setSaving(true);

      const data = await apiRequest("/auth/profile", {
        method: "PUT",

        body: JSON.stringify({
          first_name: firstName,

          last_name: lastName,

          email: email,
        }),
      });

      const updatedUser = data.user;

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setUser(updatedUser);

      setFormData({
        first_name: updatedUser.first_name,

        last_name: updatedUser.last_name,

        email: updatedUser.email,
      });

      setMessage("Profile updated successfully");

      setTimeout(() => {
        navigate("/profile");
      }, 800);
    } catch (error) {
      console.error("Failed to update profile:", error);

      setError(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="edit-profile-page">
          <div className="edit-profile-container">
            <p className="edit-profile-loading">Loading profile...</p>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return null;
  }

  const role = user.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "User";

  return (
    <>
      <Navbar />

      <main className="edit-profile-page">
        <div className="edit-profile-container">
          <div className="edit-profile-header">
            <div>
              <h1>Edit Profile</h1>

              <p>Update your BidSwift account information.</p>
            </div>
          </div>

          <section className="edit-profile-card">
            <div className="edit-profile-role">
              <span>Account Type</span>

              <strong>{role}</strong>
            </div>

            {error && <div className="edit-profile-error">{error}</div>}

            {message && <div className="edit-profile-success">{message}</div>}

            <form className="edit-profile-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="first_name">First Name</label>

                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={saving}
                  autoComplete="given-name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>

                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={saving}
                  autoComplete="family-name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={saving}
                  autoComplete="email"
                />
              </div>

              <div className="edit-profile-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => navigate("/profile")}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button type="submit" className="save-button" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}

export default EditProfile;
