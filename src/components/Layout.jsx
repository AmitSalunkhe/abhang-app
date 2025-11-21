import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BottomNav from './BottomNav';

export default function Layout() {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="min-h-screen bg-background pb-24 md:pb-0 md:pl-20">
            <main className="max-w-7xl mx-auto min-h-screen bg-background relative">
                <Outlet />
                <BottomNav />
            </main>
        </div>
    );
}
