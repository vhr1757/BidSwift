import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";

import { apiRequest } from "../services/api.js";

import "./AdminUsers.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);

  const [selectedRole, setSelectedRole] = useState("all");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "buyer",
  });

  const storedUser = localStorage.getItem("user");

  let currentUser = null;

  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
    } catch (error) {
      currentUser = null;
    }
  }

  const roleConfig = {
    buyer: {
      label: "Buyer",
      endpoint: "/buyers",
    },

    seller: {
      label: "Seller",
      endpoint: "/sellers",
    },

    auctioneer: {
      label: "Auctioneer",
      endpoint: "/auctioneers",
    },

    admin: {
      label: "Admin",
      endpoint: "/admins",
    },
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);

      setError("");

      const [buyersData, sellersData, auctioneersData, adminsData] =
        await Promise.all([
          apiRequest("/buyers"),

          apiRequest("/sellers"),

          apiRequest("/auctioneers"),

          apiRequest("/admins"),
        ]);

      const buyers = Array.isArray(buyersData)
        ? buyersData
        : buyersData.users || buyersData.buyers || [];

      const sellers = Array.isArray(sellersData)
        ? sellersData
        : sellersData.users || sellersData.sellers || [];

      const auctioneers = Array.isArray(auctioneersData)
        ? auctioneersData
        : auctioneersData.users || auctioneersData.auctioneers || [];

      const admins = Array.isArray(adminsData)
        ? adminsData
        : adminsData.users || adminsData.admins || [];

      const combinedUsers = [
        ...buyers.map((user) => ({
          ...user,
          role: "buyer",
        })),

        ...sellers.map((user) => ({
          ...user,
          role: "seller",
        })),

        ...auctioneers.map((user) => ({
          ...user,
          role: "auctioneer",
        })),

        ...admins.map((user) => ({
          ...user,
          role: "admin",
        })),
      ];

      setUsers(combinedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);

      setError(error.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleOpenCreate = () => {
    setEditingUser(null);

    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: "buyer",
    });

    setError("");

    setShowCreateForm(true);
  };

  const handleOpenEdit = (user) => {
    setShowCreateForm(false);

    setEditingUser(user);

    setFormData({
      first_name: user.first_name || "",

      last_name: user.last_name || "",

      email: user.email || "",

      password: "",

      role: user.role,
    });

    setError("");
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);

    setEditingUser(null);

    setError("");
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();

    setError("");

    if (
      !formData.first_name.trim() ||
      !formData.last_name.trim() ||
      !formData.email.trim() ||
      !formData.password
    ) {
      setError("Please fill in all fields");

      return;
    }

    try {
      setActionLoading(true);

      const endpoint = roleConfig[formData.role].endpoint;

      await apiRequest(endpoint, {
        method: "POST",

        body: JSON.stringify({
          first_name: formData.first_name.trim(),

          last_name: formData.last_name.trim(),

          email: formData.email.trim(),

          password: formData.password,
        }),
      });

      setShowCreateForm(false);

      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "buyer",
      });

      await fetchUsers();
    } catch (error) {
      console.error("Failed to create user:", error);

      setError(error.message || "Failed to create user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async (event) => {
    event.preventDefault();

    setError("");

    if (
      !formData.first_name.trim() ||
      !formData.last_name.trim() ||
      !formData.email.trim()
    ) {
      setError("First name, last name and email are required");

      return;
    }

    try {
      setActionLoading(true);

      const endpoint = roleConfig[editingUser.role].endpoint;

      const updateData = {
        first_name: formData.first_name.trim(),

        last_name: formData.last_name.trim(),

        email: formData.email.trim(),
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const data = await apiRequest(`${endpoint}/${editingUser._id}`, {
        method: "PUT",

        body: JSON.stringify(updateData),
      });

      if (currentUser?.id === editingUser._id) {
        const updatedUser = data.user || data;

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...currentUser,

            first_name: updatedUser.first_name,

            last_name: updatedUser.last_name,

            email: updatedUser.email,

            role: currentUser.role,

            id: currentUser.id,
          }),
        );
      }

      setEditingUser(null);

      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "buyer",
      });

      await fetchUsers();
    } catch (error) {
      console.error("Failed to update user:", error);

      setError(error.message || "Failed to update user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (currentUser?.id === user._id) {
      alert("You cannot delete your own account while logged in.");

      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.first_name} ${user.last_name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      setError("");

      const endpoint = roleConfig[user.role].endpoint;

      await apiRequest(`${endpoint}/${user._id}`, {
        method: "DELETE",
      });

      setUsers((previous) => previous.filter((item) => item._id !== user._id));
    } catch (error) {
      console.error("Failed to delete user:", error);

      setError(error.message || "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers =
    selectedRole === "all"
      ? users
      : users.filter((user) => user.role === selectedRole);

  const getRoleCount = (role) => {
    return users.filter((user) => user.role === role).length;
  };

  const renderForm = () => {
    const editing = Boolean(editingUser);

    return (
      <div className="admin-user-form-overlay">
        <div className="admin-user-form-card">
          <div className="admin-user-form-header">
            <div>
              <h2>{editing ? "Edit User" : "Create User"}</h2>

              <p>
                {editing
                  ? "Update the user's account information."
                  : "Create a new BidSwift user account."}
              </p>
            </div>

            <button
              type="button"
              className="admin-form-close"
              onClick={handleCloseForm}
            >
              ×
            </button>
          </div>

          {error && <div className="admin-users-error">{error}</div>}

          <form
            onSubmit={editing ? handleUpdateUser : handleCreateUser}
            className="admin-user-form"
          >
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>First Name</label>

                <input
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={actionLoading}
                />
              </div>

              <div className="admin-form-group">
                <label>Last Name</label>

                <input
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={actionLoading}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Email</label>

              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={actionLoading}
              />
            </div>

            {!editing && (
              <div className="admin-form-group">
                <label>Role</label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={actionLoading}
                >
                  <option value="buyer">Buyer</option>

                  <option value="seller">Seller</option>

                  <option value="auctioneer">Auctioneer</option>

                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            <div className="admin-form-group">
              <label>{editing ? "New Password (optional)" : "Password"}</label>

              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                disabled={actionLoading}
                placeholder={
                  editing ? "Leave empty to keep current password" : ""
                }
              />
            </div>

            <div className="admin-form-actions">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={handleCloseForm}
                disabled={actionLoading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-primary-button"
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Saving..."
                  : editing
                    ? "Save Changes"
                    : "Create User"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-users-page">
      <Navbar />

      <main className="admin-users-content">
        <div className="admin-users-header">
          <div>
            <p className="admin-page-label">Administration</p>

            <h1>Manage Users</h1>

            <p>View, create, update and manage BidSwift user accounts.</p>
          </div>

          <button className="admin-primary-button" onClick={handleOpenCreate}>
            + Create User
          </button>
        </div>

        {error && !showCreateForm && !editingUser && (
          <div className="admin-users-error">{error}</div>
        )}

        <div className="admin-user-summary">
          <button
            className={
              selectedRole === "all"
                ? "admin-summary-card active"
                : "admin-summary-card"
            }
            onClick={() => setSelectedRole("all")}
          >
            <span>Total Users</span>

            <strong>{users.length}</strong>
          </button>

          <button
            className={
              selectedRole === "buyer"
                ? "admin-summary-card active"
                : "admin-summary-card"
            }
            onClick={() => setSelectedRole("buyer")}
          >
            <span>Buyers</span>

            <strong>{getRoleCount("buyer")}</strong>
          </button>

          <button
            className={
              selectedRole === "seller"
                ? "admin-summary-card active"
                : "admin-summary-card"
            }
            onClick={() => setSelectedRole("seller")}
          >
            <span>Sellers</span>

            <strong>{getRoleCount("seller")}</strong>
          </button>

          <button
            className={
              selectedRole === "auctioneer"
                ? "admin-summary-card active"
                : "admin-summary-card"
            }
            onClick={() => setSelectedRole("auctioneer")}
          >
            <span>Auctioneers</span>

            <strong>{getRoleCount("auctioneer")}</strong>
          </button>

          <button
            className={
              selectedRole === "admin"
                ? "admin-summary-card active"
                : "admin-summary-card"
            }
            onClick={() => setSelectedRole("admin")}
          >
            <span>Admins</span>

            <strong>{getRoleCount("admin")}</strong>
          </button>
        </div>

        <section className="admin-users-card">
          <div className="admin-users-card-header">
            <div>
              <h2>
                {selectedRole === "all"
                  ? "All Users"
                  : `${roleConfig[selectedRole].label}s`}
              </h2>

              <span>
                {filteredUsers.length} user
                {filteredUsers.length !== 1 ? "s" : ""}
              </span>
            </div>

            <button
              className="admin-refresh-button"
              onClick={fetchUsers}
              disabled={loading || actionLoading}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="admin-users-loading">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="admin-users-empty">No users found.</div>
          ) : (
            <div className="admin-users-table-wrapper">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>Name</th>

                    <th>Email</th>

                    <th>Role</th>

                    <th>User ID</th>

                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="admin-user-name">
                          <div className="admin-user-avatar">
                            {(user.first_name?.[0] || "") +
                              (user.last_name?.[0] || "")}
                          </div>

                          <div>
                            <strong>
                              {user.first_name} {user.last_name}
                            </strong>
                          </div>
                        </div>
                      </td>

                      <td>{user.email}</td>

                      <td>
                        <span
                          className={`admin-role-badge admin-role-${user.role}`}
                        >
                          {roleConfig[user.role].label}
                        </span>
                      </td>

                      <td>
                        <span className="admin-user-id">{user._id}</span>
                      </td>

                      <td>
                        <div className="admin-table-actions">
                          <button
                            className="admin-edit-button"
                            onClick={() => handleOpenEdit(user)}
                            disabled={actionLoading}
                          >
                            Edit
                          </button>

                          <button
                            className="admin-delete-button"
                            onClick={() => handleDeleteUser(user)}
                            disabled={
                              actionLoading || currentUser?.id === user._id
                            }
                            title={
                              currentUser?.id === user._id
                                ? "You cannot delete your own account"
                                : "Delete user"
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {(showCreateForm || editingUser) && renderForm()}
    </div>
  );
}

export default AdminUsers;
