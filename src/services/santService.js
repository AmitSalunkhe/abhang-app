import { db } from '../firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc, query, orderBy, getDoc } from 'firebase/firestore';

const COLLECTION_NAME = 'sants';

export const santService = {
    // Get all sants
    getAll: async () => {
        const q = query(collection(db, COLLECTION_NAME), orderBy('name'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Get sant by ID
    getById: async (id) => {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            throw new Error("Sant not found");
        }
    },

    // Add a new sant
    add: async (santData) => {
        try {
            if (!santData.name) throw new Error("Sant name is required");

            // Ensure slug is generated if not provided
            if (!santData.slug) {
                santData.slug = santData.name.trim().toLowerCase().replace(/\s+/g, '-');
            }

            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...santData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding sant:", error);
            throw error;
        }
    },

    // Update a sant
    update: async (id, santData) => {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            ...santData,
            updatedAt: new Date()
        });
    },

    // Delete a sant
    delete: async (id) => {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
    }
};
