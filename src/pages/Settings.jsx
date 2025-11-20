import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { appSettingsService } from '../services/appSettingsService';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaSave, FaUser, FaTextHeight, FaInfoCircle } from 'react-icons/fa';

export default function Settings() {
    const navigate = useNavigate();
    const { currentUser, userRole } = useAuth();
    const [loading, setLoading] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [fontSize, setFontSize] = useState('medium');
    const [appSettings, setAppSettings] = useState(null);
    const [editingAppInfo, setEditingAppInfo] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setDisplayName(currentUser.displayName || '');
        }
        loadAppSettings();
    }, [currentUser]);

    const loadAppSettings = async () => {
        try {
            const settings = await appSettingsService.getAppSettings();
            setAppSettings(settings);
        } catch (error) {
            console.error('Error loading app settings:', error);
        }
    };

    const handleSaveUserSettings = async () => {
        if (!displayName.trim()) {
            toast.error('कृपया नाव प्रविष्ट करा');
            return;
        }

        setLoading(true);
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                displayName: displayName.trim(),
                fontSize: fontSize
            });
            toast.success('सेटिंग्ज जतन झाल्या!');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('सेटिंग्ज जतन करताना त्रुटी');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAppSettings = async () => {
        if (userRole !== 'admin') {
            toast.error('फक्त अॅडमिनसाठी');
            return;
        }

        setLoading(true);
        try {
            await appSettingsService.updateAppSettings(appSettings);
            toast.success('अॅप माहिती अपडेट झाली!');
            setEditingAppInfo(false);
        } catch (error) {
            console.error('Error saving app settings:', error);
            toast.error('अॅप माहिती अपडेट करताना त्रुटी');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-paper pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow"
                        >
                            <FaArrowLeft className="text-orange-600" />
                        </button>
                        <h1 className="text-2xl font-mukta font-bold text-gray-800">सेटिंग्ज</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 py-6 space-y-6">
                {/* User Settings */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                            <FaUser className="text-orange-600" />
                        </div>
                        <h2 className="text-lg font-mukta font-semibold text-gray-800">वैयक्तिक माहिती</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                नाव
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="तुमचे नाव प्रविष्ट करा"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaTextHeight className="inline mr-2" />
                                फॉन्ट आकार
                            </label>
                            <select
                                value={fontSize}
                                onChange={(e) => setFontSize(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="small">लहान</option>
                                <option value="medium">मध्यम</option>
                                <option value="large">मोठा</option>
                            </select>
                        </div>

                        <button
                            onClick={handleSaveUserSettings}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-xl font-medium hover:shadow-md transition-shadow disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <FaSave />
                            {loading ? 'जतन होत आहे...' : 'जतन करा'}
                        </button>
                    </div>
                </div>

                {/* Admin: Edit App Info */}
                {userRole === 'admin' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                    <FaInfoCircle className="text-blue-600" />
                                </div>
                                <h2 className="text-lg font-mukta font-semibold text-gray-800">अॅप माहिती (अॅडमिन)</h2>
                            </div>
                            {!editingAppInfo && (
                                <button
                                    onClick={() => setEditingAppInfo(true)}
                                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                                >
                                    संपादित करा
                                </button>
                            )}
                        </div>

                        {appSettings && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        आवृत्ती
                                    </label>
                                    <input
                                        type="text"
                                        value={appSettings.version || ''}
                                        onChange={(e) => setAppSettings({ ...appSettings, version: e.target.value })}
                                        disabled={!editingAppInfo}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        संस्थेचे नाव
                                    </label>
                                    <input
                                        type="text"
                                        value={appSettings.organizationName || ''}
                                        onChange={(e) => setAppSettings({ ...appSettings, organizationName: e.target.value })}
                                        disabled={!editingAppInfo}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        संपर्क
                                    </label>
                                    <input
                                        type="text"
                                        value={appSettings.contact || ''}
                                        onChange={(e) => setAppSettings({ ...appSettings, contact: e.target.value })}
                                        disabled={!editingAppInfo}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        वर्णन
                                    </label>
                                    <textarea
                                        value={appSettings.description || ''}
                                        onChange={(e) => setAppSettings({ ...appSettings, description: e.target.value })}
                                        disabled={!editingAppInfo}
                                        rows="3"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                    />
                                </div>

                                {editingAppInfo && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleSaveAppSettings}
                                            disabled={loading}
                                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-medium hover:shadow-md transition-shadow disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <FaSave />
                                            {loading ? 'जतन होत आहे...' : 'जतन करा'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingAppInfo(false);
                                                loadAppSettings();
                                            }}
                                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            रद्द करा
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
