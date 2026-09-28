// // const API_BASE_URL = "http://localhost:3000/api";

// // const registerUser = async (userData) => {
// //     const response = await fetch(
// //         `${API_BASE_URL}/auth/register`,
// //         {
// //             method: "POST",

// //             headers: {
// //                 "Content-Type": "application/json"
// //             },

// //             body: JSON.stringify(userData)
// //         }
// //     );

// //     const data = await response.json();

// //     if (!response.ok) {
// //         throw new Error(
// //             data.message || "Registration failed"
// //         );
// //     }

// //     return data;
// // };

// // const loginUser = async (userData) => {
// //     const response = await fetch(
// //         `${API_BASE_URL}/auth/login`,
// //         {
// //             method: "POST",

// //             headers: {
// //                 "Content-Type" : "application/json"
// //             },
// //             body: JSON.stringify(userData)
// //         }
// //     );

// //     const data = await response.json();
    
// //     if (!response.ok) {
// //         throw new Error(
// //             data.message || "Login failed"
// //         );
// //     }

// //     return data;
// // };

// // export { registerUser, loginUser };

// const API_BASE_URL = "http://localhost:3000/api";


// // ============================================================
// // COMMON API REQUEST FUNCTION
// // ============================================================

// const apiRequest = async (
//     endpoint,
//     options = {}
// ) => {
//     const token = localStorage.getItem(
//         "accessToken"
//     );

//     const headers = {
//         "Content-Type": "application/json",
//         ...options.headers
//     };

//     // Add JWT only when it exists
//     if (token) {
//         headers.Authorization =
//             `Bearer ${token}`;
//     }

//     const response = await fetch(
//         `${API_BASE_URL}${endpoint}`,
//         {
//             ...options,
//             headers
//         }
//     );

//     const data = await response.json();

//     if (!response.ok) {
//         throw new Error(
//             data.message ||
//             "Something went wrong"
//         );
//     }

//     return data;
// };


// // ============================================================
// // AUTHENTICATION
// // ============================================================

// const registerUser = async (userData) => {
//     return apiRequest(
//         "/auth/register",
//         {
//             method: "POST",
//             body: JSON.stringify(userData)
//         }
//     );
// };


// const loginUser = async (userData) => {
//     return apiRequest(
//         "/auth/login",
//         {
//             method: "POST",
//             body: JSON.stringify(userData)
//         }
//     );
// };


// // ============================================================
// // EXPORTS
// // ============================================================

// export {
//     apiRequest,
//     registerUser,
//     loginUser
// };

const API_BASE_URL = "http://localhost:3000/api";


// ============================================================
// COMMON API REQUEST FUNCTION
// ============================================================

const apiRequest = async (
    endpoint,
    options = {}
) => {

    const token = localStorage.getItem(
        "accessToken"
    );


    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };


    // Add JWT when available
    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }


    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers
        }
    );


    const data = await response.json();


    // ========================================================
    // INVALID / EXPIRED TOKEN
    // ========================================================

    if (
        response.status === 401 &&
        token
    ) {

        localStorage.removeItem(
            "accessToken"
        );

        localStorage.removeItem(
            "user"
        );

        window.location.href = "/login";

        return;
    }


    // ========================================================
    // OTHER API ERRORS
    // ========================================================

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Something went wrong"
        );

    }


    return data;
};


// ============================================================
// REGISTER
// ============================================================

const registerUser = async (userData) => {

    return apiRequest(
        "/auth/register",
        {
            method: "POST",

            body: JSON.stringify(
                userData
            )
        }
    );
};


// ============================================================
// LOGIN
// ============================================================

const loginUser = async (userData) => {

    return apiRequest(
        "/auth/login",
        {
            method: "POST",

            body: JSON.stringify(
                userData
            )
        }
    );
};


// ============================================================
// EXPORTS
// ============================================================

export {
    apiRequest,
    registerUser,
    loginUser
};
