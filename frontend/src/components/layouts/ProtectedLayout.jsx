import { Outlet, redirect, useLoaderData } from 'react-router';
import { getUserDetails } from '#services/profileServices';

export default function ProtectedLayout() {
    const user = useLoaderData();
    // This just renders the child route (e.g., ProjectComponent)
    return <Outlet context={user} />;
}
