import { useState } from "react";

import { registerUser } from "../services/api.js";

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
        <div>
            <h1>BidSwift</h1>

            <h2>Create Account</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="firstName">
                        First Name
                    </label>

                    <br />

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

                <br />

                <div>
                    <label htmlFor="lastName">
                        Last Name
                    </label>

                    <br />

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

                <br />

                <div>
                    <label htmlFor="email">
                        Email
                    </label>

                    <br />

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

                <br />

                <div>
                    <label htmlFor="password">
                        Password
                    </label>

                    <br />

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

                <br />

                <div>
                    <label htmlFor="role">
                        Account Type
                    </label>

                    <br />

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

                <br />

                <button type="submit">
                    Register
                </button>
            </form>

            {message && (
                <p>{message}</p>
            )}

            {error && (
                <p>{error}</p>
            )}
        </div>
    );
}

export default Register;