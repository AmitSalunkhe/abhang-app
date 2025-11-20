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
        <div className="min-h-screen bg-paper pb-20">
            <main className="max-w-md mx-auto min-h-screen bg-white shadow-xl overflow-hidden relative">
                <Outlet />
                <BottomNav />
            </main>
        </div>
    );
}
