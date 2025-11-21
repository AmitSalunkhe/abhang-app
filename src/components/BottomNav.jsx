import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaHome, FaLayerGroup, FaHeart, FaUserCircle, FaPray } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function BottomNav() {
    const { currentUser } = useAuth();
    const [photoURL, setPhotoURL] = useState(null);
    const location = useLocation();

    useEffect(() => {
        fetchUserPhoto();
    }, [currentUser]);

    const fetchUserPhoto = async () => {
        if (currentUser) {
            try {
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    setPhotoURL(userDoc.data().photoURL);
                }
            } catch (error) {
                console.error("Error fetching user photo:", error);
            }
        }
    };

    const navItems = [
        { path: '/home', icon: FaHome, label: 'Home' },
        { path: '/sants', icon: FaPray, label: 'Sants' },
        { path: '/categories', icon: FaLayerGroup, label: 'Topics' },
        { path: '/favorites', icon: FaHeart, label: 'Saved' },
        { path: '/profile', icon: null, label: 'Profile', isProfile: true },
    ];

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <div className="glass-card rounded-2xl px-6 py-3 pointer-events-auto shadow-floating mx-4">
                <div className="flex items-center gap-8">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                relative flex flex-col items-center justify-center transition-all duration-300
                                ${isActive ? 'text-primary -translate-y-1' : 'text-text-muted hover:text-text-secondary'}
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    {item.isProfile ? (
                                        <div className={`w-8 h-8 rounded-full overflow-hidden ring-2 transition-all ${isActive ? 'ring-primary' : 'ring-transparent'}`}>
                                            {photoURL ? (
                                                <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <FaUserCircle className="w-full h-full" />
                                            )}
                                        </div>
                                    ) : (
                                        <item.icon className="text-xl" />
                                    )}

                                    {isActive && (
                                        <span className="absolute -bottom-4 w-1 h-1 rounded-full bg-primary"></span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    );
}
