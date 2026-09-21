const API_BASE_URL = "http://localhost:3000/api";

const registerUser = async (userData) => {
    const response = await fetch(
        `${API_BASE_URL}/auth/register`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(userData)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Registration failed"
        );
    }

    return data;
};

export { registerUser };