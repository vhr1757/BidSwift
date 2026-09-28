import { useState } from "react";
import { registerUser } from "../services/api.js";

import "./Register.css";

function Register() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("buyer");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        try {
            const data = await registerUser({
                first_name: firstName,
                last_name: lastName,
                email,
                password,
                role
            });

            console.log("Registration successful:", data);

            setMessage(
                "Registration successful!"
            );
        }
        catch (error) {
            console.error(
                "Registration failed:",
                error
            );

            setError(error.message);
        }
    };

    return (
        <div className="register-page">

    <div className="register-card">

        <h1 className="register-logo">
            BidSwift
        </h1>

        <h2 className="register-title">
            Create Account
        </h2>

        <form
            className="register-form"
            onSubmit={handleSubmit}
        >

            <div className="register-field">
                <label htmlFor="firstName">
                    First Name
                </label>

                <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(event) =>
                        setFirstName(event.target.value)
                    }
                    placeholder="Enter your first name"
                    required
                />
            </div>


            <div className="register-field">
                <label htmlFor="lastName">
                    Last Name
                </label>

                <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(event) =>
                        setLastName(event.target.value)
                    }
                    placeholder="Enter your last name"
                    required
                />
            </div>


            <div className="register-field">
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


            <div className="register-field">
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


            <div className="register-field">
                <label htmlFor="role">
                    Account Type
                </label>

                <select
                    id="role"
                    value={role}
                    onChange={(event) =>
                        setRole(event.target.value)
                    }
                >
                    <option value="buyer">
                        Buyer
                    </option>

                    <option value="seller">
                        Seller
                    </option>
                </select>
            </div>


            <button
                className="register-button"
                type="submit"
            >
                Register
            </button>

        </form>


        {message && (
            <p className="register-message">
                {message}
            </p>
        )}


        {error && (
            <p className="register-error">
                {error}
            </p>
        )}

    </div>

</div>
    );
}

export default Register;