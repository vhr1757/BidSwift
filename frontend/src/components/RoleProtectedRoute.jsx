import { Navigate } from "react-router-dom";

function RoleProtectedRoute({
    children,
    allowedRoles
}) {
    const token = localStorage.getItem(
        "accessToken"
    );

    const storedUser = localStorage.getItem(
        "user"
    );

    if (!token || !storedUser) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    let user;

    try {
        user = JSON.parse(storedUser);
    }
    catch (error) {
        localStorage.removeItem(
            "accessToken"
        );

        localStorage.removeItem(
            "user"
        );

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    if (
        !allowedRoles.includes(
            user.role
        )
    ) {
        return (
            <Navigate
                to="/auctions"
                replace
            />
        );
    }

    return children;
}

export default RoleProtectedRoute;