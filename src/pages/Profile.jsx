import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaCog, FaShieldAlt, FaChevronRight, FaInfoCircle } from 'react-icons/fa';
import { appSettingsService } from '../services/appSettingsService';

export default function Profile() {
    const { currentUser, userRole, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loadingSettings, setLoadingSettings] = useState(true);

    useEffect(() => {
        fetchUserData();
        fetchAppSettings();
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

    const fetchAppSettings = async () => {
        try {
            const settings = await appSettingsService.getAppSettings();
            setAppSettings(settings);
        } catch (error) {
            console.error("Error fetching app settings:", error);
            // Set default empty settings or handle error
        } finally {
            setLoadingSettings(false);
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
                    <Link
                        to="/settings"
                        className="w-full flex items-center p-5 hover:bg-gray-50 transition border-b border-gray-50 text-left group"
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-4 group-hover:bg-white transition-colors">
                            <FaCog className="text-gray-400 text-lg" />
                        </div>
                        <span className="text-gray-700 font-medium flex-1">सेटिंग्ज</span>
                        <FaChevronRight className="text-gray-300 text-sm" />
                    </Link>

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

            {/* About App Section */}
            <div className="mt-8 max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <FaInfoCircle className="text-blue-600" />
                        </div>
                        <h2 className="text-lg font-mukta font-semibold text-gray-800">ॲप बद्दल</h2>
                    </div>

                    {loadingSettings ? (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                        </div>
                    ) : appSettings ? (
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-500 mb-1">ॲप नाव</p>
                                <p className="text-gray-800 font-medium font-mukta">{appSettings.appName || 'अभंगवाणी'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">आवृत्ती</p>
                                <p className="text-gray-800 font-medium">{appSettings.version}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">संस्था</p>
                                <p className="text-gray-800 font-medium font-mukta">{appSettings.organizationName}</p>
                            </div>
                            {appSettings.contact && (
                                <div>
                                    <p className="text-gray-500 mb-1">संपर्क</p>
                                    <p className="text-gray-800 font-medium">{appSettings.contact}</p>
                                </div>
                            )}
                            {appSettings.description && (
                                <div>
                                    <p className="text-gray-500 mb-1">वर्णन</p>
                                    <p className="text-gray-800 font-mukta">{appSettings.description}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">
                            माहिती उपलब्ध नाही
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
