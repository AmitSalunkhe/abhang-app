import { db, storage } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const APP_SETTINGS_DOC_ID = 'main';

export const appSettingsService = {
    // Subscribe to app settings (Realtime)
    subscribeToAppSettings(callback) {
        const docRef = doc(db, 'appSettings', APP_SETTINGS_DOC_ID);
        return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                callback({ id: docSnap.id, ...docSnap.data() });
            } else {
                // Return default settings if document doesn't exist
                callback({
                    id: APP_SETTINGS_DOC_ID,
                    appName: 'अभंगवाणी',
                    version: '1.0.0',
                    description: 'अभंगवाणी - संत वाणी संग्रह',
                    appLogoURL: '',
                    faviconURL: '',
                    organizationName: 'जननी माता भजन मंडळ मोरावळे',
                    contactEmail: '',
                    contactPhone: '',
                    website: '',
                    address: '',
                    primaryColor: '#f97316',
                    secondaryColor: '#f59e0b',
                    privacyPolicyURL: '',
                    termsOfServiceURL: '',
                    facebookURL: '',
                    instagramURL: '',
                    youtubeURL: '',
                    whatsappNumber: '',
                    lastUpdated: new Date().toISOString()
                });
            }
        }, (error) => {
            console.error('Error subscribing to app settings:', error);
            // Return default settings on error to prevent UI blocking
            callback({
                id: APP_SETTINGS_DOC_ID,
                appName: 'अभंगवाणी',
                version: '1.0.0',
                description: 'अभंगवाणी - संत वाणी संग्रह',
                appLogoURL: '',
                faviconURL: '',
                organizationName: 'जननी माता भजन मंडळ मोरावळे',
                contactEmail: '',
                contactPhone: '',
                website: '',
                address: '',
                primaryColor: '#f97316',
                secondaryColor: '#f59e0b',
                privacyPolicyURL: '',
                termsOfServiceURL: '',
                facebookURL: '',
                instagramURL: '',
                youtubeURL: '',
                whatsappNumber: '',
                lastUpdated: new Date().toISOString()
            });
        });
    },

    // Get app settings (One-time fetch)
    async getAppSettings() {
        try {
            const docRef = doc(db, 'appSettings', APP_SETTINGS_DOC_ID);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                // Return default settings if document doesn't exist
                return {
                    id: APP_SETTINGS_DOC_ID,
                    // App Information
                    appName: 'अभंगवाणी',
                    version: '1.0.0',
                    description: 'अभंगवाणी - संत वाणी संग्रह',
                    appLogoURL: '',
                    faviconURL: '',

                    // Organization Details
                    organizationName: 'जननी माता भजन मंडळ मोरावळे',
                    contactEmail: '',
                    contactPhone: '',
                    website: '',
                    address: '',

                    // Branding
                    primaryColor: '#f97316', // orange-500
                    secondaryColor: '#f59e0b', // amber-500

                    // Legal
                    privacyPolicyURL: '',
                    termsOfServiceURL: '',

                    // Social Media
                    facebookURL: '',
                    instagramURL: '',
                    youtubeURL: '',
                    whatsappNumber: '',

                    lastUpdated: new Date().toISOString()
                };
            }
        } catch (error) {
            console.error('Error fetching app settings:', error);
            throw error;
        }
    },

    // Update app settings (admin only)
    async updateAppSettings(settings) {
        try {
            const docRef = doc(db, 'appSettings', APP_SETTINGS_DOC_ID);
            const docSnap = await getDoc(docRef);

            const updatedSettings = {
                ...settings,
                lastUpdated: new Date().toISOString()
            };

            if (docSnap.exists()) {
                await updateDoc(docRef, updatedSettings);
            } else {
                await setDoc(docRef, updatedSettings);
            }

            return updatedSettings;
        } catch (error) {
            console.error('Error updating app settings:', error);
            throw error;
        }
    },

    // Upload image (logo, favicon, etc.)
    async uploadImage(file, imagePath) {
        try {
            const storageRef = ref(storage, `appSettings/${imagePath}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }
};
