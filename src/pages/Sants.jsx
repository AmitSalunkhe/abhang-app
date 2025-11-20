import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPray, FaChevronRight } from 'react-icons/fa';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import GlobalSearch from '../components/GlobalSearch';

export default function Sants() {
    const [sants, setSants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState({ original: '', marathi: '' });

    useEffect(() => {
        // Realtime listener for sants
        const unsubscribe = onSnapshot(collection(db, 'sants'), async (snapshot) => {
            const santList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Get count for each sant
            const santsWithCount = await Promise.all(
                santList.map(async (sant) => {
                    const q = query(collection(db, 'abhangs'), where('author', '==', sant.name));
                    const abhangSnapshot = await getDocs(q);
                    return {
                        ...sant,
                        count: abhangSnapshot.size
                    };
                })
            );

            setSants(santsWithCount);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching sants:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSearch = (original, marathi) => {
        setSearchQuery({ original: original.toLowerCase(), marathi: marathi.toLowerCase() });
    };

    const filteredSants = sants.filter(sant => {
        const { original, marathi } = searchQuery;
        if (!original) return true;

        const name = sant.name?.toLowerCase() || '';
        const slug = sant.slug?.toLowerCase() || '';

        return (
            name.includes(original) || name.includes(marathi) ||
            slug.includes(original) || slug.includes(marathi)
        );
    });

    return (
        <div className="p-4 pb-24 min-h-screen bg-paper">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-saffron font-mukta mb-2">संत मंडळी</h1>
                <p className="text-gray-500">संतांची यादी</p>
            </header>

            <div className="mb-6">
                <GlobalSearch
                    onSearch={handleSearch}
                    placeholder="संत शोधा..."
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saffron"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredSants.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-gray-50">
                            <p className="text-gray-500">कोणतेही संत सापडले नाहीत</p>
                        </div>
                    ) : (
                        filteredSants.map((sant) => (
                            <Link
                                key={sant.id}
                                to={`/sant/${sant.slug}`}
                                className="bg-white p-5 rounded-2xl shadow-sm border border-transparent hover:border-orange-100 flex items-center justify-between hover:shadow-md transition duration-200 group"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-saffron text-xl group-hover:scale-110 transition-transform">
                                        <FaPray />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800 font-mukta group-hover:text-saffron transition-colors">{sant.name}</h3>
                                        <p className="text-xs text-gray-500">{sant.count} अभंग</p>
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
