import { Outlet, Navigate } from 'react-router';
import NavBar from '#components/NavBar';
import { useAppContext } from '#contexts/AppContext';

export default function LoginProtectedLayout() {
    const user = useAppContext();
    return (
    );
}
