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

    return (
        <nav className="navbar">

            {/* Logo */}
            <div
                className="navbar-logo"
                onClick={() => navigate("/auctions")}
            >
                BidSwift
            </div>


            {/* Navigation Links */}
            <div className="navbar-links">

                <button
                    onClick={() => navigate("/auctions")}
                >
                    Auctions
                </button>

                <button
                    onClick={() => navigate("/my-bids")}
                >
                    My Bids
                </button>

                <button
                    onClick={() => navigate("/wallet")}
                >
                    Wallet
                </button>

                <button
                    onClick={() => navigate("/profile")}
                >
                    Profile
                </button>

            </div>


            {/* User Section */}
            <div className="navbar-user">

                {user && (
                    <span className="navbar-username">
                        Hi, {user.first_name}
                    </span>
                )}

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </nav>
    );
}

export default Navbar;

