import { Navigate, Outlet, useLoaderData } from "react-router";
import { useMemo, useState } from "react";
import AppContext from "#contexts/AppContext";
import { getUserDetails } from "#services/profileServices";
import NavBar from "#components/NavBar";

export async function loader() {
    const response = await getUserDetails();
    if (response.success) return response.data;
    return null // not logged in or expired cookie
}

function App() {
    const initialUserData = useLoaderData();
    const [user, setUser] = useState(initialUserData);

    // memoize the context to avoid unnecessary rerenders of child components in case other state variables unrelated to user change.
    const contextValue = useMemo(() => ({
        user,
        setUser
    }), [user]);

    if (!user) {
        return <Navigate to="/auth/login" replace />
    }

    return (
        <AppContext.Provider value={contextValue}>
            <div className='h-screen flex flex-col bg-gray-900 text-white'>
                <NavBar />
                <main className="grow overflow-auto">
                    <Outlet />
                </main>
            </div>
        </AppContext.Provider >
    );
}

export default App;
