import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { FaArrowLeft, FaUserShield, FaUser, FaUserCircle } from 'react-icons/fa';

export default function UserManagement() {
    const { isAdmin, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            navigate('/');
            return;
        }
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin, authLoading, navigate]);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const usersData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersData);
        } catch (error) {
            console.error("Error fetching users:", error);
            alert("Error loading users. Please check Firestore security rules.");
        } finally {
            setLoading(false);
        }
    };

    const toggleRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'general' : 'admin';
        const roleText = newRole === 'admin' ? 'प्रशासक (Admin)' : 'सामान्य (General)';

        if (window.confirm(`भूमिका बदलायची आहे का?\nChange role to ${roleText}?`)) {
            try {
                await updateDoc(doc(db, "users", userId), {
                    role: newRole
                });
                setUsers(users.map(user =>
                    user.id === userId ? { ...user, role: newRole } : user
                ));
            } catch (error) {
                console.error("Error updating role:", error);
                alert("भूमिका बदलता आली नाही / Failed to update role");
            }
        }
    };

    if (authLoading || loading) return <div className="p-4 text-center">लोड होत आहे...</div>;

    return (
        <div className="min-h-screen bg-paper p-4 pb-24">
            <header className="flex items-center mb-6">
                <button onClick={() => navigate('/admin')} className="mr-4 text-gray-600">
                    <FaArrowLeft />
                </button>
                <h1 className="text-2xl font-bold text-gray-800 font-mukta">वापरकर्ता व्यवस्थापन</h1>
            </header>

            {users.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500">कोणतेही वापरकर्ते सापडले नाहीत</p>
                    <p className="text-sm text-gray-400 mt-2">No users found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {users.map((user) => (
                        <div key={user.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                {/* User Info */}
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${user.role === 'admin' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {user.photoURL ? (
                                            <img
                                                src={user.photoURL}
                                                alt={user.displayName || user.email}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : user.role === 'admin' ? (
                                            <FaUserShield />
                                        ) : (
                                            <FaUser />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-gray-900 truncate">
                                            {user.displayName || user.email}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                    </div>
                                </div>

                                {/* Role Badge and Action Button */}
                                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${user.role === 'admin'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {user.role === 'admin' ? 'प्रशासक' : 'सामान्य'}
                                    </span>
                                    <button
                                        onClick={() => toggleRole(user.id, user.role)}
                                        className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${user.role === 'admin'
                                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                : 'bg-green-600 text-white hover:bg-green-700'
                                            }`}
                                    >
                                        {user.role === 'admin' ? 'सामान्य करा' : 'प्रशासक करा'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
