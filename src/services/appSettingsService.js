import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const APP_SETTINGS_DOC_ID = 'main';

export const appSettingsService = {
    // Get app settings
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
                    version: '1.0.0',
                    organizationName: 'जननी माता भजन मंडळ मोरावळे',
                    contact: '',
                    description: 'अभंगवाणी - संत वाणी संग्रह',
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
    }
};
