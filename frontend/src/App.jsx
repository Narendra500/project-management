import NavBar from "#components/NavBar";
import { Outlet, useLoaderData } from "react-router";
import { getUserDetails } from "#services/profileServices";
import { useState, useMemo } from "react";
import AppContext from "./contexts/AppContext";

export async function loader() {
    const response = await getUserDetails();
    return response.data;
}

function App() {
    const initialUserData = useLoaderData();
    const [user, setUser] = useState(initialUserData);
    // memoize the context to avoid unnecessary rerenders of child components in case other state variables unrelated to user change.
    const contextValue = useMemo(() => ({
        user,
        setUser
    }), [user]);

    return (
        // specify that App is the provider of the AppContext
        // this context is now available to all components rendered within App
        <AppContext.Provider value={contextValue}>
            <div className="h-screen flex flex-col bg-gray-900 text-white">
                <NavBar />
                {/* This main element will grow to fill the remaining space */}
                <main className="grow overflow-auto">
                    <Outlet />
                </main>
            </div>
        </AppContext.Provider>
    );
}

export default App;
