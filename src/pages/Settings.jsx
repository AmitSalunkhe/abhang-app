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

    const handleImageUpload = async (e, imageType) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('कृपया image file निवडा');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size 2MB पेक्षा कमी असावी');
            return;
        }

        setUploadingImage(true);
        try {
            const imagePath = imageType === 'logo' ? 'app-logo.png' : 'favicon.png';
            const downloadURL = await appSettingsService.uploadImage(file, imagePath);

            const fieldName = imageType === 'logo' ? 'appLogoURL' : 'faviconURL';
            setAppSettings({ ...appSettings, [fieldName]: downloadURL });

            toast.success('Image upload झाली!');
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Image upload करताना त्रुटी');
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
            toast.error('फक्त अॅडमिनसाठी');
            return;
        }

        setLoading(true);
        try {
            await appSettingsService.updateAppSettings(appSettings);
            toast.success('ॲप माहिती अपडेट झाली!');
            setEditingAppInfo(false);
        } catch (error) {
            console.error('Error saving app settings:', error);
            let errorMessage = 'ॲप माहिती अपडेट करताना त्रुटी';
            if (error.code === 'permission-denied') {
                errorMessage = 'तुम्हाला हे बदल करण्याचा अधिकार नाही (Permission Denied)';
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
                <span className="font-semibold text-gray-700">{title}</span>
            </div>
            {expandedSection === sectionId ? (
                <FaChevronUp className="text-gray-400" />
            ) : (
                <FaChevronDown className="text-gray-400" />
            )}
        </button>
    );

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
                            <label className="block text-sm font-medium text-gray-700 mb-2">नाव</label>
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
                {userRole === 'admin' && appSettings && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                    <FaInfoCircle className="text-blue-600" />
                                </div>
                                <h2 className="text-lg font-mukta font-semibold text-gray-800">ॲप माहिती (ॲडमिन)</h2>
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

                        <div className="space-y-2">
                            {/* App Information Section */}
                            <div>
                                <SectionHeader title="ॲप माहिती" icon={FaInfoCircle} sectionId="appInfo" color="blue" />
                                {expandedSection === 'appInfo' && (
                                    <div className="space-y-4 p-4 border border-gray-100 rounded-xl mb-4 animate-fadeIn">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">ॲप नाव</label>
                                            <input
                                                type="text"
                                                value={appSettings.appName || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, appName: e.target.value })}
                                                disabled={!editingAppInfo}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">आवृत्ती</label>
                                            <input
                                                type="text"
                                                value={appSettings.version || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, version: e.target.value })}
                                                disabled={!editingAppInfo}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">वर्णन</label>
                                            <textarea
                                                value={appSettings.description || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, description: e.target.value })}
                                                disabled={!editingAppInfo}
                                                rows="2"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>

                                        {/* App Logo */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <FaImage className="inline mr-2" />
                                                ॲप लोगो
                                            </label>
                                            {appSettings.appLogoURL && (
                                                <img src={appSettings.appLogoURL} alt="App Logo" className="w-20 h-20 object-cover rounded-lg mb-2" />
                                            )}
                                            {editingAppInfo && (
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, 'logo')}
                                                    disabled={uploadingImage}
                                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                                />
                                            )}
                                        </div>

                                        {/* Favicon */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <FaImage className="inline mr-2" />
                                                Favicon
                                            </label>
                                            {appSettings.faviconURL && (
                                                <img src={appSettings.faviconURL} alt="Favicon" className="w-10 h-10 object-cover rounded-lg mb-2" />
                                            )}
                                            {editingAppInfo && (
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, 'favicon')}
                                                    disabled={uploadingImage}
                                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Organization Details */}
                            <div>
                                <SectionHeader title="संस्था माहिती" icon={FaInfoCircle} sectionId="organization" color="blue" />
                                {expandedSection === 'organization' && (
                                    <div className="space-y-4 p-4 border border-gray-100 rounded-xl mb-4 animate-fadeIn">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">संस्थेचे नाव</label>
                                            <input
                                                type="text"
                                                value={appSettings.organizationName || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, organizationName: e.target.value })}
                                                disabled={!editingAppInfo}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">संपर्क ईमेल</label>
                                            <input
                                                type="email"
                                                value={appSettings.contactEmail || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, contactEmail: e.target.value })}
                                                disabled={!editingAppInfo}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">संपर्क फोन</label>
                                            <input
                                                type="tel"
                                                value={appSettings.contactPhone || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, contactPhone: e.target.value })}
                                                disabled={!editingAppInfo}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <FaGlobe className="inline mr-2" />
                                                वेबसाइट
                                            </label>
                                            <input
                                                type="url"
                                                value={appSettings.website || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, website: e.target.value })}
                                                disabled={!editingAppInfo}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">पत्ता</label>
                                            <textarea
                                                value={appSettings.address || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, address: e.target.value })}
                                                disabled={!editingAppInfo}
                                                rows="2"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Branding */}
                            <div>
                                <SectionHeader title="ब्रँडिंग" icon={FaPalette} sectionId="branding" color="purple" />
                                {expandedSection === 'branding' && (
                                    <div className="space-y-4 p-4 border border-gray-100 rounded-xl mb-4 animate-fadeIn">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">मुख्य रंग</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={appSettings.primaryColor || '#f97316'}
                                                    onChange={(e) => setAppSettings({ ...appSettings, primaryColor: e.target.value })}
                                                    disabled={!editingAppInfo}
                                                    className="h-12 w-20 rounded-lg border border-gray-200 disabled:opacity-50"
                                                />
                                                <input
                                                    type="text"
                                                    value={appSettings.primaryColor || ''}
                                                    onChange={(e) => setAppSettings({ ...appSettings, primaryColor: e.target.value })}
                                                    disabled={!editingAppInfo}
                                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">दुय्यम रंग</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={appSettings.secondaryColor || '#f59e0b'}
                                                    onChange={(e) => setAppSettings({ ...appSettings, secondaryColor: e.target.value })}
                                                    disabled={!editingAppInfo}
                                                    className="h-12 w-20 rounded-lg border border-gray-200 disabled:opacity-50"
                                                />
                                                <input
                                                    type="text"
                                                    value={appSettings.secondaryColor || ''}
                                                    onChange={(e) => setAppSettings({ ...appSettings, secondaryColor: e.target.value })}
                                                    disabled={!editingAppInfo}
                                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Social Media */}
                            <div>
                                <SectionHeader title="सोशल मीडिया" icon={FaGlobe} sectionId="social" color="green" />
                                {expandedSection === 'social' && (
                                    <div className="space-y-4 p-4 border border-gray-100 rounded-xl mb-4 animate-fadeIn">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <FaFacebook className="inline mr-2 text-blue-600" />
                                                Facebook URL
                                            </label>
                                            <input
                                                type="url"
                                                value={appSettings.facebookURL || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, facebookURL: e.target.value })}
                                                disabled={!editingAppInfo}
                                                placeholder="https://facebook.com/..."
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <FaInstagram className="inline mr-2 text-pink-600" />
                                                Instagram URL
                                            </label>
                                            <input
                                                type="url"
                                                value={appSettings.instagramURL || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, instagramURL: e.target.value })}
                                                disabled={!editingAppInfo}
                                                placeholder="https://instagram.com/..."
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <FaYoutube className="inline mr-2 text-red-600" />
                                                YouTube URL
                                            </label>
                                            <input
                                                type="url"
                                                value={appSettings.youtubeURL || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, youtubeURL: e.target.value })}
                                                disabled={!editingAppInfo}
                                                placeholder="https://youtube.com/..."
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <FaWhatsapp className="inline mr-2 text-green-600" />
                                                WhatsApp Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={appSettings.whatsappNumber || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, whatsappNumber: e.target.value })}
                                                disabled={!editingAppInfo}
                                                placeholder="+91 XXXXXXXXXX"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Legal */}
                            <div>
                                <SectionHeader title="कायदेशीर" icon={FaInfoCircle} sectionId="legal" color="gray" />
                                {expandedSection === 'legal' && (
                                    <div className="space-y-4 p-4 border border-gray-100 rounded-xl mb-4 animate-fadeIn">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">गोपनीयता धोरण URL</label>
                                            <input
                                                type="url"
                                                value={appSettings.privacyPolicyURL || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, privacyPolicyURL: e.target.value })}
                                                disabled={!editingAppInfo}
                                                placeholder="https://..."
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">सेवा अटी URL</label>
                                            <input
                                                type="url"
                                                value={appSettings.termsOfServiceURL || ''}
                                                onChange={(e) => setAppSettings({ ...appSettings, termsOfServiceURL: e.target.value })}
                                                disabled={!editingAppInfo}
                                                placeholder="https://..."
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
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
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-medium hover:shadow-md transition-shadow disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <FaSave />
                                        {loading ? 'जतन होत आहे...' : 'जतन करा'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingAppInfo(false);
                                        }}
                                        disabled={loading || uploadingImage}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        रद्द करा
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
