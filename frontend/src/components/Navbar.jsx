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

  return (
    <nav className="navbar">
      <div
        className="navbar-logo"
        onClick={() => {
          if (role === "buyer") {
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

      <div className="navbar-links">
        {role === "buyer" && (
          <>
            <button onClick={() => navigate("/auctions")}>Auctions</button>

            <button onClick={() => navigate("/my-bids")}>My Bids</button>

            <button onClick={() => navigate("/wallet")}>Wallet</button>

            <button onClick={() => navigate("/profile")}>Profile</button>
          </>
        )}

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

        {role === "admin" && (
          <>
            <button onClick={() => navigate("/admin")}>Dashboard</button>

            <button onClick={() => navigate("/admin/users")}>Users</button>

            <button onClick={() => navigate("/admin/auctions")}>
              Auctions
            </button>

            <button onClick={() => navigate("/admin/items")}>Items</button>

            <button onClick={() => navigate("/admin/orders")}>Orders</button>

            <button onClick={() => navigate("/admin/bills")}>Bills</button>

            <button onClick={() => navigate("/profile")}>Profile</button>
          </>
        )}
      </div>

      <div className="navbar-user">
        {user && <span className="navbar-username">Hi, {user.first_name}</span>}

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
