import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaCog, FaShieldAlt, FaChevronRight, FaInfoCircle, FaFacebook, FaInstagram, FaYoutube, FaWhatsapp, FaGlobe, FaMapMarkerAlt, FaPhone, FaEnvelope, FaFileContract, FaUserShield } from 'react-icons/fa';
import { appSettingsService } from '../services/appSettingsService';

export default function Profile() {
    const { currentUser, userRole, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [appSettings, setAppSettings] = useState(null);
    const [loadingSettings, setLoadingSettings] = useState(true);

    useEffect(() => {
        fetchUserData();

        // Subscribe to app settings
        const unsubscribe = appSettingsService.subscribeToAppSettings((settings) => {
            setAppSettings(settings);
            setLoadingSettings(false);
        });

        return () => unsubscribe();
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
        <div className="p-6 pb-24 min-h-screen bg-background">
            <header className="mb-8 text-center pt-6 animate-fade-in">
                <div className="relative inline-block group">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-saffron overflow-hidden shadow-card border-4 border-white group-hover:scale-105 transition-transform duration-300">
                        {userData?.photoURL ? (
                            <img
                                src={userData.photoURL}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <FaUserCircle className="text-8xl text-gray-200" />
                        )}
                    </div>
                    <div className="absolute bottom-4 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-sm"></div>
                </div>

                <h1 className="text-2xl font-bold text-text-primary font-mukta mb-1">
                    {userData?.displayName || currentUser?.email}
                </h1>
                <p className="text-sm text-text-muted font-outfit">{currentUser?.email}</p>
                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold mt-3 font-outfit ${userRole === 'admin' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-text-secondary'}`}>
                    {userRole === 'admin' ? 'Admin' : 'User'}
                </span>
            </header>

            <div className="space-y-4 max-w-md mx-auto animate-slide-up">
                {isAdmin && (
                    <Link
                        to="/admin"
                        className="flex items-center p-5 bg-white rounded-3xl shadow-card border border-gray-50 text-text-primary hover:shadow-soft transition-all group"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                            <FaShieldAlt className="text-primary text-xl" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg font-outfit">Admin Dashboard</h3>
                            <p className="text-xs text-text-muted font-outfit">Manage content and users</p>
                        </div>
                        <FaChevronRight className="text-gray-300 group-hover:text-primary transition-colors" />
                    </Link>
                )}

                <div className="bg-white rounded-3xl shadow-card border border-gray-50 overflow-hidden">
                    <Link
                        to="/settings"
                        className="w-full flex items-center p-5 hover:bg-gray-50 transition border-b border-gray-50 text-left group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mr-4 group-hover:bg-white transition-colors">
                            <FaCog className="text-text-secondary text-lg" />
                        </div>
                        <span className="text-text-primary font-bold flex-1 font-outfit">Settings</span>
                        <FaChevronRight className="text-gray-300 text-sm group-hover:text-text-primary transition-colors" />
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center p-5 hover:bg-red-50 transition text-left text-red-500 group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mr-4 group-hover:bg-white transition-colors">
                            <FaSignOutAlt className="text-red-500 text-lg" />
                        </div>
                        <span className="font-bold flex-1 font-outfit">Logout</span>
                    </button>
                </div>
            </div>

            {/* About App Section */}
            <div className="mt-8 max-w-md mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="bg-white rounded-3xl shadow-card border border-gray-50 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <FaInfoCircle className="text-blue-600" />
                        </div>
                        <h2 className="text-lg font-bold font-outfit text-text-primary">About App</h2>
                    </div>

                    {loadingSettings ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        </div>
                    ) : appSettings ? (
                        <div className="space-y-6 text-sm font-outfit">
                            {/* App Info */}
                            <div className="space-y-4">
                                <div>
                                    <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-1">App Name</p>
                                    <p className="text-text-primary font-bold text-lg font-mukta">{appSettings.appName || 'Abhangwani'}</p>
                                </div>
                                <div>
                                    <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-1">Version</p>
                                    <p className="text-text-secondary font-bold bg-gray-100 inline-block px-3 py-1 rounded-lg text-xs">{appSettings.version}</p>
                                </div>
                                {appSettings.description && (
                                    <div>
                                        <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-1">Description</p>
                                        <p className="text-text-secondary leading-relaxed font-mukta">{appSettings.description}</p>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-50 pt-4"></div>

                            {/* Organization Info */}
                            <div className="space-y-4">
                                <div>
                                    <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-1">Organization</p>
                                    <p className="text-text-primary font-bold font-mukta">{appSettings.organizationName}</p>
                                </div>

                                {(appSettings.contactPhone || appSettings.contactEmail || appSettings.website || appSettings.address) && (
                                    <div className="space-y-3 mt-3">
                                        {appSettings.contactPhone && (
                                            <div className="flex items-center gap-3 text-text-secondary hover:text-primary transition-colors group">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                    <FaPhone className="text-text-muted text-xs group-hover:text-primary" />
                                                </div>
                                                <a href={`tel:${appSettings.contactPhone}`} className="font-medium">{appSettings.contactPhone}</a>
                                            </div>
                                        )}
                                        {appSettings.contactEmail && (
                                            <div className="flex items-center gap-3 text-text-secondary hover:text-primary transition-colors group">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                    <FaEnvelope className="text-text-muted text-xs group-hover:text-primary" />
                                                </div>
                                                <a href={`mailto:${appSettings.contactEmail}`} className="font-medium">{appSettings.contactEmail}</a>
                                            </div>
                                        )}
                                        {appSettings.website && (
                                            <div className="flex items-center gap-3 text-text-secondary hover:text-primary transition-colors group">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                    <FaGlobe className="text-text-muted text-xs group-hover:text-primary" />
                                                </div>
                                                <a href={appSettings.website} target="_blank" rel="noopener noreferrer" className="font-medium truncate max-w-[200px]">{appSettings.website}</a>
                                            </div>
                                        )}
                                        {appSettings.address && (
                                            <div className="flex items-start gap-3 text-text-secondary">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mt-0.5">
                                                    <FaMapMarkerAlt className="text-text-muted text-xs" />
                                                </div>
                                                <p className="font-mukta font-medium">{appSettings.address}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Social Media */}
                            {(appSettings.facebookURL || appSettings.instagramURL || appSettings.youtubeURL || appSettings.whatsappNumber) && (
                                <>
                                    <div className="border-t border-gray-50 pt-4"></div>
                                    <div>
                                        <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-4">Social Media</p>
                                        <div className="flex gap-4">
                                            {appSettings.facebookURL && (
                                                <a href={appSettings.facebookURL} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all shadow-sm">
                                                    <FaFacebook className="text-xl" />
                                                </a>
                                            )}
                                            {appSettings.instagramURL && (
                                                <a href={appSettings.instagramURL} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600 hover:bg-pink-100 hover:scale-110 transition-all shadow-sm">
                                                    <FaInstagram className="text-xl" />
                                                </a>
                                            )}
                                            {appSettings.youtubeURL && (
                                                <a href={appSettings.youtubeURL} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 hover:bg-red-100 hover:scale-110 transition-all shadow-sm">
                                                    <FaYoutube className="text-xl" />
                                                </a>
                                            )}
                                            {appSettings.whatsappNumber && (
                                                <a href={`https://wa.me/${appSettings.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 hover:scale-110 transition-all shadow-sm">
                                                    <FaWhatsapp className="text-xl" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Legal */}
                            {(appSettings.privacyPolicyURL || appSettings.termsOfServiceURL) && (
                                <>
                                    <div className="border-t border-gray-50 pt-4"></div>
                                    <div className="flex flex-wrap gap-4 text-xs font-medium">
                                        {appSettings.privacyPolicyURL && (
                                            <a href={appSettings.privacyPolicyURL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-text-muted hover:text-primary transition-colors">
                                                <FaUserShield /> Privacy Policy
                                            </a>
                                        )}
                                        {appSettings.termsOfServiceURL && (
                                            <a href={appSettings.termsOfServiceURL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-text-muted hover:text-primary transition-colors">
                                                <FaFileContract /> Terms of Service
                                            </a>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-text-muted text-sm font-outfit">
                            No information available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
