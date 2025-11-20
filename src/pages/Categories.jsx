import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaLayerGroup, FaChevronRight } from 'react-icons/fa';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import GlobalSearch from '../components/GlobalSearch';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState({ original: '', marathi: '' });

    useEffect(() => {
        // Realtime listener for categories
        const unsubscribe = onSnapshot(collection(db, 'categories'), async (snapshot) => {
            try {
                const cats = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Get count for each category
                const categoriesWithCount = await Promise.all(
                    cats.map(async (cat) => {
                        try {
                            if (!cat.slug) return { ...cat, count: 0 };
                            // Query by both slug and name to handle legacy data
                            const q = query(
                                collection(db, 'abhangs'),
                                where('category', 'in', [cat.slug, cat.name])
                            );
                            const abhangSnapshot = await getDocs(q);
                            return {
                                ...cat,
                                count: abhangSnapshot.size
                            };
                        } catch (err) {
                            console.error(`Error fetching count for category ${cat.name}:`, err);
                            return { ...cat, count: 0 };
                        }
                    })
                );

                setCategories(categoriesWithCount);
            } catch (error) {
                console.error("Error processing categories data:", error);
            } finally {
                setLoading(false);
            }
        }, (error) => {
            console.error('Error fetching categories:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSearch = (original, marathi) => {
        setSearchQuery({ original: original.toLowerCase(), marathi: marathi.toLowerCase() });
    };

    const filteredCategories = categories.filter(category => {
        const { original, marathi } = searchQuery;
        if (!original) return true;

        const name = category.name?.toLowerCase() || '';
        const slug = category.slug?.toLowerCase() || '';

        return (
            name.includes(original) || name.includes(marathi) ||
            slug.includes(original) || slug.includes(marathi)
        );
    });

    return (
        <div className="p-4 pb-24 min-h-screen bg-paper">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-saffron font-mukta mb-2">विभाग</h1>
                <p className="text-gray-500">संतांच्या श्रेणी</p>
            </header>

            <div className="mb-6">
                <GlobalSearch
                    onSearch={handleSearch}
                    placeholder="श्रेणी शोधा..."
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saffron"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredCategories.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-gray-50">
                            <p className="text-gray-500">कोणतीही श्रेणी सापडली नाही</p>
                        </div>
                    ) : (
                        filteredCategories.map((category) => (
                            <Link
                                key={category.id}
                                to={`/category/${category.slug}`}
                                className="bg-white p-5 rounded-2xl shadow-sm border border-transparent hover:border-orange-100 flex items-center justify-between hover:shadow-md transition duration-200 group"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-saffron text-xl group-hover:scale-110 transition-transform">
                                        <FaLayerGroup />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800 font-mukta group-hover:text-saffron transition-colors">{category.name}</h3>
                                        <p className="text-xs text-gray-500">{category.count} अभंग</p>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-saffron group-hover:text-white transition-all">
                                    <FaChevronRight className="text-sm" />
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
