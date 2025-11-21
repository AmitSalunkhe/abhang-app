import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { FaUserShield, FaUser, FaSearch } from 'react-icons/fa';
import PageHeader from '../../components/PageHeader';
import { ListSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ErrorBoundary from '../../components/ErrorBoundary';
import toast from 'react-hot-toast';

function UserManagementContent() {
    const { isAdmin, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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
            toast.error("वापरकर्ते लोड करताना त्रुटी आली");
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
                toast.success(`भूमिका ${newRole === 'admin' ? 'प्रशासक' : 'सामान्य'} केली`);
            } catch (error) {
                console.error("Error updating role:", error);
                toast.error("भूमिका बदलता आली नाही");
            }
        }
    };

    const filteredUsers = users.filter(user => {
        const search = searchTerm.toLowerCase();
        return (
            (user.displayName?.toLowerCase() || '').includes(search) ||
            (user.email?.toLowerCase() || '').includes(search)
        );
    });

    if (authLoading) return <ListSkeleton count={5} />;

    return (
        <div className="min-h-screen bg-background p-6 pb-24">
            <PageHeader
                title="User Management"
                subtitle="Manage users and roles"
                showBack={true}
            />

            <div className="max-w-4xl mx-auto -mt-4">
                {/* Search Bar */}
                <div className="mb-8 animate-slide-up">
                    <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaSearch className="text-text-muted" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search users (name or email)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-12 pr-4 py-4 border-none rounded-2xl bg-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-base transition duration-200 ease-in-out shadow-soft hover:shadow-card"
                        />
                    </div>
                </div>

                {loading ? (
                    <ListSkeleton count={5} />
                ) : filteredUsers.length === 0 ? (
                    <EmptyState
                        icon="👥"
                        title="No users found"
                        description={searchTerm ? "Try a different search term" : "No users yet"}
                    />
                ) : (
                    <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        {filteredUsers.map((user, index) => (
                            <div
                                key={user.id}
                                className="bg-white rounded-2xl p-4 shadow-card border border-gray-50 hover:shadow-soft transition-all duration-300 stagger-item"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                    {/* User Info */}
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm ${user.role === 'admin'
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-gray-100 text-text-muted'
                                            }`}>
                                            {user.photoURL ? (
                                                <img
                                                    src={user.photoURL}
                                                    alt={user.displayName || user.email}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : user.role === 'admin' ? (
                                                <FaUserShield className="text-xl" />
                                            ) : (
                                                <FaUser className="text-xl" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-text-primary truncate font-mukta text-lg">
                                                {user.displayName || 'Unknown User'}
                                            </p>
                                            <p className="text-sm text-text-muted truncate">{user.email}</p>
                                        </div>
                                    </div>

                                    {/* Role Badge and Action Button */}
                                    <div className="flex items-center gap-3 flex-shrink-0 ml-16 sm:ml-0">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-lg whitespace-nowrap shadow-sm ${user.role === 'admin'
                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                            : 'bg-gray-100 text-text-muted border border-gray-200'
                                            }`}>
                                            {user.role === 'admin' ? 'Admin' : 'General'}
                                        </span>
                                        <button
                                            onClick={() => toggleRole(user.id, user.role)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap shadow-sm hover:shadow-md hover:-translate-y-0.5 ${user.role === 'admin'
                                                ? 'bg-white text-text-secondary border border-gray-200 hover:bg-gray-50'
                                                : 'bg-primary text-white'
                                                }`}
                                        >
                                            {user.role === 'admin' ? 'Make General' : 'Make Admin'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function UserManagement() {
    return (
        <ErrorBoundary>
            <UserManagementContent />
        </ErrorBoundary>
    );
}
