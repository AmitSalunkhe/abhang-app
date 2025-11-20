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
        { path: '/home', icon: FaHome, label: 'मुख्य' },
        { path: '/sants', icon: FaPray, label: 'संत' },
        { path: '/categories', icon: FaLayerGroup, label: 'विभाग' },
        { path: '/favorites', icon: FaHeart, label: 'आवडते' },
        { path: '/profile', icon: null, label: 'प्रोफाइल', isProfile: true },
    ];



    return (
        <div className="fixed bottom-6 left-4 right-4 z-50">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 px-2 py-3 flex justify-around items-center">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center w-full space-y-1 transition-all duration-200 ${isActive ? 'text-saffron transform -translate-y-1' : 'text-gray-400 hover:text-gray-600'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {item.isProfile ? (
                                    <div className={`w-7 h-7 rounded-full overflow-hidden flex items-center justify-center transition-all ${isActive ? 'ring-2 ring-saffron ring-offset-2' : 'bg-gray-100'}`}>
                                        {photoURL ? (
                                            <img
                                                src={photoURL}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <FaUserCircle className="text-xl" />
                                        )}
                                    </div>
                                ) : (
                                    <item.icon className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`} />
                                )}
                                <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </div>
    );
}
