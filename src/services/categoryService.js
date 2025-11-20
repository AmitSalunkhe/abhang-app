import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION_NAME = 'categories';

export const categoryService = {
    // Get all categories
    getAll: async () => {
        try {
            const q = query(collection(db, COLLECTION_NAME), orderBy('name', 'asc'));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting categories:', error);
            throw error;
        }
    },

    // Get category by ID
    getById: async (id) => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting category:', error);
            throw error;
        }
    },

    // Add new category
    add: async (categoryData) => {
        try {
            // Ensure slug is generated if not provided
            if (!categoryData.slug && categoryData.name) {
                categoryData.slug = categoryData.name.toLowerCase().replace(/ /g, '-');
            }

            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...categoryData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error adding category:', error);
            throw error;
        }
    },

    // Update category
    update: async (id, categoryData) => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(docRef, {
                ...categoryData,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    },

    // Delete category
    delete: async (id) => {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    }
};
