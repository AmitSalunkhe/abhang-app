import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaCog, FaShieldAlt, FaChevronRight } from 'react-icons/fa';

export default function Profile() {
    const { currentUser, userRole, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        fetchUserData();
    }, [currentUser]);

    const fetchUserData = async () => {
        if (currentUser) {
            try {
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <div className="p-4 pb-24 min-h-screen bg-paper">
            <header className="mb-8 text-center pt-6">
                <div className="relative inline-block">
                    <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-saffron overflow-hidden shadow-md border-4 border-white">
                        {userData?.photoURL ? (
                            <img
                                src={userData.photoURL}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <FaUserCircle className="text-7xl text-gray-200" />
                        )}
                    </div>
                    <div className="absolute bottom-4 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
                </div>

                <h1 className="text-2xl font-bold text-gray-800 font-mukta mb-1">
                    {userData?.displayName || currentUser?.email}
                </h1>
                <p className="text-sm text-gray-500">{currentUser?.email}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-3 ${userRole === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                    {userRole === 'admin' ? 'प्रशासक (Admin)' : 'वाचक (User)'}
                </span>
            </header>

            <div className="space-y-4 max-w-md mx-auto">
                {isAdmin && (
                    <Link
                        to="/admin"
                        className="flex items-center p-5 bg-gradient-to-r from-orange-50 to-white rounded-2xl shadow-sm border border-orange-100 text-orange-800 hover:shadow-md transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mr-4 shadow-sm group-hover:scale-110 transition-transform">
                            <FaShieldAlt className="text-saffron text-xl" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg font-mukta">प्रशासक डॅशबोर्ड</h3>
                            <p className="text-xs text-orange-600/80">अभंग जोडा, संपादित करा आणि व्यवस्थापित करा</p>
                        </div>
                        <FaChevronRight className="text-orange-300" />
                    </Link>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
                    <button className="w-full flex items-center p-5 hover:bg-gray-50 transition border-b border-gray-50 text-left group">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-4 group-hover:bg-white transition-colors">
                            <FaCog className="text-gray-400 text-lg" />
                        </div>
                        <span className="text-gray-700 font-medium flex-1">सेटिंग्ज</span>
                        <FaChevronRight className="text-gray-300 text-sm" />
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center p-5 hover:bg-red-50 transition text-left text-red-600 group"
                    >
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mr-4 group-hover:bg-white transition-colors">
                            <FaSignOutAlt className="text-red-500 text-lg" />
                        </div>
                        <span className="font-medium flex-1">बाहेर पडा (Logout)</span>
                    </button>
                </div>
            </div>

            <div className="mt-12 text-center text-gray-400 text-xs">
                <p className="font-medium mb-1">अभंगवाणी</p>
                <p>आवृत्ती 1.0.0</p>
            </div>
        </div>
    );
}
