import { db } from '../firebase';
import {
    collection,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';

const COLLECTION_NAME = 'abhangs';

export const abhangService = {
    // Get all Abhangs
    getAll: async () => {
        try {
            const q = query(collection(db, COLLECTION_NAME), orderBy('title'));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting abhangs:", error);
            throw error;
        }
    },

    // Get single Abhang by ID
    getById: async (id) => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                throw new Error("Abhang not found");
            }
        } catch (error) {
            console.error("Error getting abhang:", error);
            throw error;
        }
    },

    // Add new Abhang (Admin only)
    add: async (data) => {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...data,
                createdAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding abhang:", error);
            throw error;
        }
    },

    // Update Abhang (Admin only)
    update: async (id, data) => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error updating abhang:", error);
            throw error;
        }
    },

    // Delete Abhang (Admin only)
    delete: async (id) => {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
        } catch (error) {
            console.error("Error deleting abhang:", error);
            throw error;
        }
    }
};
