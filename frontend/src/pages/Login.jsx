import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api.js";

import "./Login.css";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    // ============================================================
    // LOGIN
    // ============================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setLoading(true);

        try {

            const data = await loginUser({
                email,
                password
            });

            console.log(
                "Login successful:",
                data
            );


            // ====================================================
            // SAVE JWT
            // ====================================================

            localStorage.setItem(
                "accessToken",
                data.token
            );


            // ====================================================
            // SAVE USER INFORMATION
            // ====================================================

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );


            // ====================================================
            // REDIRECT
            // ====================================================

            navigate("/auctions");

        }
        catch (error) {

            console.error(
                "Login error:",
                error
            );

            setError(
                error.message ||
                "Invalid email or password"
            );

        }
        finally {

            setLoading(false);

        }
    };


    return (
        <div className="login-page">

    <div className="login-card">

        <h1 className="login-logo">
            BidSwift
        </h1>

        <h2 className="login-title">
            Login
        </h2>

        <form
            className="login-form"
            onSubmit={handleSubmit}
        >

            <div className="login-field">

                <label htmlFor="email">
                    Email
                </label>

                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(event) =>
                        setEmail(event.target.value)
                    }
                    placeholder="Enter your email"
                    required
                />

            </div>


            <div className="login-field">

                <label htmlFor="password">
                    Password
                </label>

                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(event) =>
                        setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    required
                />

            </div>


            <button
                className="login-button"
                type="submit"
                disabled={loading}
            >
                {loading
                    ? "Logging in..."
                    : "Login"
                }
            </button>

        </form>


        {error && (
            <p className="login-error">
                {error}
            </p>
        )}


        <p className="login-register">

            Don't have an account?{" "}

            <Link to="/register">
                Register
            </Link>

        </p>

    </div>

</div>
    );
}


// ============================================================
// DEFAULT EXPORT
// ============================================================

export default Login;