import { useNavigate } from "react-router-dom";

import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("accessToken");

    localStorage.removeItem("user");

    navigate("/login");
  };

  const role = user?.role;

  const handleAuctionsNavigation = () => {
    if (role === "admin") {
      navigate("/admin/auctions");
    } else if (role === "auctioneer") {
      navigate("/auctioneer/auctions");
    } else {
      navigate("/auctions");
    }
  };

  return (
    <nav className="navbar">
      {/* Logo */}

      <div
        className="navbar-logo"
        onClick={() => {
          if (!user) {
            navigate("/");
          } else if (role === "buyer") {
            navigate("/auctions");
          } else if (role === "seller") {
            navigate("/seller");
          } else if (role === "auctioneer") {
            navigate("/auctioneer");
          } else if (role === "admin") {
            navigate("/admin");
          }
        }}
      >
        BidSwift
      </div>

      {/* Navigation Links */}

      <div className="navbar-links">
        {/* Common public links */}

        <button onClick={() => navigate("/")}>Home</button>

        <button onClick={handleAuctionsNavigation}>Auctions</button>

        <button onClick={() => navigate("/about")}>About</button>

        <button onClick={() => navigate("/contact")}>Contact</button>

        {/* Buyer */}

        {role === "buyer" && (
          <>
            <button onClick={() => navigate("/my-bids")}>My Bids</button>

            <button onClick={() => navigate("/wallet")}>Wallet</button>

            <button type="button" onClick={() => navigate("/my-orders")}>
              My Orders
            </button>

            <button type="button" onClick={() => navigate("/my-bills")}>
              My Bills
            </button>

            <button onClick={() => navigate("/profile")}>Profile</button>
          </>
        )}

        {/* Seller */}

        {role === "seller" && (
          <>
            <button onClick={() => navigate("/seller")}>Dashboard</button>

            <button onClick={() => navigate("/seller/items")}>My Items</button>

            <button onClick={() => navigate("/seller/items/create")}>
              Add Item
            </button>

            <button onClick={() => navigate("/seller/orders")}>Orders</button>

            <button onClick={() => navigate("/profile")}>Profile</button>
          </>
        )}

        {/* Auctioneer */}

        {role === "auctioneer" && (
          <>
            <button onClick={() => navigate("/auctioneer")}>Dashboard</button>

            <button onClick={() => navigate("/auctioneer/auctions")}>
              My Auctions
            </button>

            <button onClick={() => navigate("/auctioneer/auctions/create")}>
              Create Auction
            </button>

            <button onClick={() => navigate("/profile")}>Profile</button>
          </>
        )}

        {/* Admin */}

        {role === "admin" && (
          <>
            <button onClick={() => navigate("/admin")}>Dashboard</button>

            <button onClick={() => navigate("/admin/users")}>Users</button>

            <button onClick={() => navigate("/admin/items")}>Items</button>

            <button onClick={() => navigate("/admin/orders")}>Orders</button>

            <button onClick={() => navigate("/admin/bills")}>Bills</button>

            <button onClick={() => navigate("/profile")}>Profile</button>
          </>
        )}
      </div>

      {/* User / Authentication */}

      <div className="navbar-user">
        {user ? (
          <>
            <span className="navbar-username">Hi, {user.first_name}</span>

            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button className="login-button" onClick={() => navigate("/login")}>
              Login
            </button>

            <button
              className="register-button"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
