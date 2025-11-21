import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { appSettingsService } from '../services/appSettingsService';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaSave, FaUser, FaTextHeight, FaInfoCircle, FaImage, FaPalette, FaGlobe, FaFacebook, FaInstagram, FaYoutube, FaWhatsapp, FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function Settings() {
    const navigate = useNavigate();
    const { currentUser, userRole } = useAuth();
    const [loading, setLoading] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [fontSize, setFontSize] = useState('medium');
    const [appSettings, setAppSettings] = useState(null);
    const [editingAppInfo, setEditingAppInfo] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setDisplayName(currentUser.displayName || '');
        }

        // Subscribe to app settings
        const unsubscribe = appSettingsService.subscribeToAppSettings((settings) => {
            setAppSettings(settings);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleSaveUserSettings = async () => {
        if (!displayName.trim()) {
            toast.error('Please enter your name');
            return;
        }

        setLoading(true);
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                displayName: displayName.trim(),
                fontSize: fontSize
            });
            toast.success('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Error saving settings');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e, imageType) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size must be less than 2MB');
            return;
        }

        setUploadingImage(true);
        try {
            const imagePath = imageType === 'logo' ? 'app-logo.png' : 'favicon.png';
            const downloadURL = await appSettingsService.uploadImage(file, imagePath);

            const fieldName = imageType === 'logo' ? 'appLogoURL' : 'faviconURL';
            setAppSettings({ ...appSettings, [fieldName]: downloadURL });

            toast.success('Image uploaded successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Error uploading image');
        } finally {
            setUploadingImage(false);
        }
    };

    const [expandedSection, setExpandedSection] = useState('appInfo'); // appInfo, organization, branding, social, legal

    const toggleSection = (section) => {
        if (expandedSection === section) {
            setExpandedSection(null);
        } else {
            setExpandedSection(section);
        }
    };

    const handleSaveAppSettings = async () => {
        if (userRole !== 'admin') {
            toast.error('Admin access only');
            return;
        }

        setLoading(true);
        try {
            await appSettingsService.updateAppSettings(appSettings);
            toast.success('App info updated successfully!');
            setEditingAppInfo(false);
        } catch (error) {
            console.error('Error saving app settings:', error);
            let errorMessage = 'Error updating app info';
            if (error.code === 'permission-denied') {
                errorMessage = 'Permission Denied';
            }
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const SectionHeader = ({ title, icon: Icon, sectionId, color }) => (
        <button
            onClick={() => toggleSection(sectionId)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl mb-4"
        >
            <div className="flex items-center gap-3">
                <Icon className={`text-${color}-500 text-lg`} />
                <span className="font-semibold text-gray-700 font-outfit">{title}</span>
            </div>
            {expandedSection === sectionId ? (
                <FaChevronUp className="text-gray-400" />
            ) : (
                <FaChevronDown className="text-gray-400" />
            )}
        </button>
    );

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                <div className="max-w-md mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                                <FaArrowLeft className="text-text-secondary" />
                            </button>
                            <h1 className="text-2xl font-mukta font-bold text-text-primary">Settings</h1>
                        </div>
                        {/* Debug Info */}
                        <div className="text-xs text-text-muted text-right font-outfit">
                            <p>{currentUser?.email}</p>
                            <p>{currentUser?.uid?.slice(0, 6)}...</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 py-6 space-y-6">
                {/* User Settings */}
                <div className="bg-white rounded-3xl shadow-card border border-gray-50 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <FaUser className="text-primary" />
                        </div>
                        <h2 className="text-lg font-mukta font-semibold text-text-primary">Personal Information</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2 font-outfit">Name</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-outfit"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2 font-outfit">
                                <FaTextHeight className="inline mr-2" />
                                Font Size
                            </label>
                            <select
                                value={fontSize}
                                onChange={(e) => setFontSize(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-outfit"
                            >
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                            </select>
                        </div>

                        <button
                            onClick={handleSaveUserSettings}
                            disabled={loading}
                            className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-outfit"
                        >
                            <FaSave />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {/* Admin: Edit App Info */}
                {userRole === 'admin' && appSettings && (
                    <div className="bg-white rounded-3xl shadow-card border border-gray-50 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                                    <FaInfoCircle className="text-secondary" />
                                </div>
                                <h2 className="text-lg font-mukta font-semibold text-text-primary">App Info (Admin)</h2>
                            </div>
                            {!editingAppInfo && (
                                <button
                                    onClick={() => setEditingAppInfo(true)}
                                    className="text-sm text-primary hover:text-primary-dark font-medium font-outfit"
                                >
                                    Edit
                                </button>
                            )}
                        </div>

                        <div className="space-y-2">
                            {/* App Information Section */}
                            <div>
                                <SectionHeader title="App Information" icon={FaInfoCircle} sectionId="appInfo" color="blue" />
                                {expandedSection === 'appInfo' && (
                                    <div className="space-y-4 p-4 border border-gray-100 rounded-xl mb-4 animate-fade-in">
                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2 font-outfit">App Name</label>
                                            <input
                                                type="text"
                                                value={appSettings.appName || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, appName: e.target.value })}
                                                disabled={!editingAppInfo}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-50 font-outfit"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2 font-outfit">Version</label>
                                            <input
                                                type="text"
                                                value={appSettings.version || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, version: e.target.value })}
                                                disabled={!editingAppInfo}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-50 font-outfit"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2 font-outfit">Description</label>
                                            <textarea
                                                value={appSettings.description || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, description: e.target.value })}
                                                disabled={!editingAppInfo}
                                                rows="2"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-50 font-outfit"
                                            />
                                        </div>

                                        {/* App Logo */}
                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2 font-outfit">
                                                <FaImage className="inline mr-2" />
                                                App Logo
                                            </label>
                                            {appSettings.appLogoURL && (
                                                <img src={appSettings.appLogoURL} alt="App Logo" className="w-20 h-20 object-cover rounded-lg mb-2 shadow-sm" />
                                            )}
                                            {editingAppInfo && (
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, 'logo')}
                                                    disabled={uploadingImage}
                                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 font-outfit"
                                                />
                                            )}
                                        </div>

                                        {/* Favicon */}
                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2 font-outfit">
                                                <FaImage className="inline mr-2" />
                                                Favicon
                                            </label>
                                            {appSettings.faviconURL && (
                                                <img src={appSettings.faviconURL} alt="Favicon" className="w-10 h-10 object-cover rounded-lg mb-2 shadow-sm" />
                                            )}
                                            {editingAppInfo && (
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, 'favicon')}
                                                    disabled={uploadingImage}
                                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 font-outfit"
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Organization Details */}
                            <div>
                                <SectionHeader title="Organization Info" icon={FaInfoCircle} sectionId="organization" color="blue" />
                                {expandedSection === 'organization' && (
                                    <div className="space-y-4 p-4 border border-gray-100 rounded-xl mb-4 animate-fade-in">
                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2 font-outfit">Organization Name</label>
                                            <input
                                                type="text"
                                                value={appSettings.organizationName || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, organizationName: e.target.value })}
                                                disabled={!editingAppInfo}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-50 font-outfit"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2 font-outfit">Contact Email</label>
                                            <input
                                                type="email"
                                                value={appSettings.contactEmail || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, contactEmail: e.target.value })}
                                                disabled={!editingAppInfo}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-50 font-outfit"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2 font-outfit">Contact Phone</label>
                                            <input
                                                type="tel"
                                                value={appSettings.contactPhone || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, contactPhone: e.target.value })}
                                                disabled={!editingAppInfo}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-50 font-outfit"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2 font-outfit">
                                                <FaGlobe className="inline mr-2" />
                                                Website
                                            </label>
                                            <input
                                                type="url"
                                                value={appSettings.website || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, website: e.target.value })}
                                                disabled={!editingAppInfo}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-50 font-outfit"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2 font-outfit">Address</label>
                                            <textarea
                                                value={appSettings.address || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, address: e.target.value })}
                                                disabled={!editingAppInfo}
                                                rows="2"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-50 font-outfit"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Branding */}
                            <div>
                                <SectionHeader title="Branding" icon={FaPalette} sectionId="branding" color="purple" />
                                {expandedSection === 'branding' && (
                                    <div className="space-y-4 p-4 border border-gray-100 rounded-xl mb-4 animate-fade-in">
                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2 font-outfit">Primary Color</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={appSettings.primaryColor || '#f97316'}
                                                    onChange={(e) => setAppSettings({ ...appSettings, primaryColor: e.target.value })}
                                                    disabled={!editingAppInfo}
                                                    className="h-12 w-20 rounded-lg border border-gray-200 disabled:opacity-50 cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={appSettings.primaryColor || ''}
                                                    onChange={(e) => setAppSettings({ ...appSettings, primaryColor: e.target.value })}
                                                    disabled={!editingAppInfo}
                                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-50 font-outfit"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2 font-outfit">Secondary Color</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={appSettings.secondaryColor || '#f59e0b'}
                                                    onChange={(e) => setAppSettings({ ...appSettings, secondaryColor: e.target.value })}
                                                    disabled={!editingAppInfo}
                                                    className="h-12 w-20 rounded-lg border border-gray-200 disabled:opacity-50 cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={appSettings.secondaryColor || ''}
                                                    onChange={(e) => setAppSettings({ ...appSettings, secondaryColor: e.target.value })}
                                                    disabled={!editingAppInfo}
                                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-50 font-outfit"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Social Media */}
                            <div>
                                <SectionHeader title="Social Media" icon={FaGlobe} sectionId="social" color="green" />
                                {expandedSection === 'social' && (
                                    <div className="space-y-4 p-4 border border-gray-100 rounded-xl mb-4 animate-fade-in">
                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2 font-outfit">
                                                <FaFacebook className="inline mr-2 text-blue-600" />
                                                Facebook URL
                                            </label>
                                            <input
                                                type="url"
                                                value={appSettings.facebookURL || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, facebookURL: e.target.value })}
                                                disabled={!editingAppInfo}
                                                placeholder="https://facebook.com/..."
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-50 font-outfit"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2 font-outfit">
                                                <FaInstagram className="inline mr-2 text-pink-600" />
                                                Instagram URL
                                            </label>
                                            <input
                                                type="url"
                                                value={appSettings.instagramURL || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, instagramURL: e.target.value })}
                                                disabled={!editingAppInfo}
                                                placeholder="https://instagram.com/..."
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-50 font-outfit"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2 font-outfit">
                                                <FaYoutube className="inline mr-2 text-red-600" />
                                                YouTube URL
                                            </label>
                                            <input
                                                type="url"
                                                value={appSettings.youtubeURL || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, youtubeURL: e.target.value })}
                                                disabled={!editingAppInfo}
                                                placeholder="https://youtube.com/..."
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-50 font-outfit"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2 font-outfit">
                                                <FaWhatsapp className="inline mr-2 text-green-600" />
                                                WhatsApp Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={appSettings.whatsappNumber || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, whatsappNumber: e.target.value })}
                                                disabled={!editingAppInfo}
                                                placeholder="+91 XXXXXXXXXX"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-50 font-outfit"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Legal */}
                            <div>
                                <SectionHeader title="Legal" icon={FaInfoCircle} sectionId="legal" color="gray" />
                                {expandedSection === 'legal' && (
                                    <div className="space-y-4 p-4 border border-gray-100 rounded-xl mb-4 animate-fade-in">
                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2 font-outfit">Privacy Policy URL</label>
                                            <input
                                                type="url"
                                                value={appSettings.privacyPolicyURL || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, privacyPolicyURL: e.target.value })}
                                                disabled={!editingAppInfo}
                                                placeholder="https://..."
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-50 font-outfit"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2 font-outfit">Terms of Service URL</label>
                                            <input
                                                type="url"
                                                value={appSettings.termsOfServiceURL || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, termsOfServiceURL: e.target.value })}
                                                disabled={!editingAppInfo}
                                                placeholder="https://..."
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-50 font-outfit"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Save/Cancel Buttons */}
                            {editingAppInfo && (
                                <div className="flex gap-3 pt-4 sticky bottom-0 bg-white p-4 border-t border-gray-100 shadow-lg rounded-t-2xl">
                                    <button
                                        onClick={handleSaveAppSettings}
                                        disabled={loading || uploadingImage}
                                        className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-outfit"
                                    >
                                        <FaSave />
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingAppInfo(false);
                                        }}
                                        disabled={loading || uploadingImage}
                                        className="px-6 py-3 border border-gray-300 text-text-secondary rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 font-outfit"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

