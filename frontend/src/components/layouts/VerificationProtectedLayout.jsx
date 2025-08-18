import { useAppContext } from "#contexts/AppContext";
import { Navigate, Outlet } from "react-router";

export default function VerificationProtectedLayout() {
    const { user } = useAppContext();
    if (!user.isVerified) {
        // The 'replace' prevents the bad URL from being added to the browser history.
        return <Navigate to='/profile/me' replace />
    }
    return (
        <Outlet />
    );
}
