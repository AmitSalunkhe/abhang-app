import { collection, addDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export const favoritesService = {
    // Add a favorite
    async addFavorite(userId, abhangId) {
        try {
            await addDoc(collection(db, 'favorites'), {
                userId,
                abhangId,
                createdAt: new Date()
            });
        } catch (error) {
            console.error('Error adding favorite:', error);
            throw error;
        }
    },

    // Remove a favorite
    async removeFavorite(userId, abhangId) {
        try {
            const q = query(
                collection(db, 'favorites'),
                where('userId', '==', userId),
                where('abhangId', '==', abhangId)
            );
            const querySnapshot = await getDocs(q);

            querySnapshot.forEach(async (document) => {
                await deleteDoc(doc(db, 'favorites', document.id));
            });
        } catch (error) {
            console.error('Error removing favorite:', error);
            throw error;
        }
    },

    // Get all favorites for a user
    async getUserFavorites(userId) {
        try {
            const q = query(
                collection(db, 'favorites'),
                where('userId', '==', userId)
            );
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting favorites:', error);
            throw error;
        }
    },

    // Check if an abhang is favorited
    async isFavorite(userId, abhangId) {
        try {
            const q = query(
                collection(db, 'favorites'),
                where('userId', '==', userId),
                where('abhangId', '==', abhangId)
            );
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            console.error('Error checking favorite:', error);
            return false;
        }
    }
};
