import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Home from './pages/Home';
import AbhangDetail from './pages/AbhangDetail';
import Sants from './pages/Sants';
import SantDetail from './pages/SantDetail';
import Categories from './pages/Categories';
import CategoryDetail from './pages/CategoryDetail';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminDashboard from './pages/admin/AdminDashboard';
import AbhangForm from './pages/admin/AbhangForm';
import UserManagement from './pages/admin/UserManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import SantManagement from './pages/admin/SantManagement';
import SplashScreen from './components/SplashScreen';

function ProtectedRoute({ children }) {
    const { currentUser, loading } = useAuth();

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    return children;
}

function AdminRoute({ children }) {
    const { currentUser, userRole, loading } = useAuth();

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    if (!currentUser || userRole !== 'admin') {
        return <Navigate to="/" />;
    }

    return children;
}

export default function App() {
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    if (showSplash) {
        return <SplashScreen />;
    }

    return (
        <AuthProvider>
            <Toaster position="top-center" />
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Navigate to="/home" replace />} />
                        <Route path="home" element={<Home />} />
                        <Route path="abhang/:id" element={<AbhangDetail />} />
                        <Route path="sants" element={<Sants />} />
                        <Route path="sant/:slug" element={<SantDetail />} />
                        <Route path="categories" element={<Categories />} />
                        <Route path="category/:slug" element={<CategoryDetail />} />
                        <Route path="favorites" element={<Favorites />} />
                        <Route path="profile" element={<Profile />} />
                    </Route>

                    <Route path="/admin" element={
                        <AdminRoute>
                            <Layout />
                        </AdminRoute>
                    }>
                        <Route index element={<AdminDashboard />} />
                        <Route path="add" element={<AbhangForm />} />
                        <Route path="edit/:id" element={<AbhangForm />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="categories" element={<CategoryManagement />} />
                        <Route path="sants" element={<SantManagement />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}
