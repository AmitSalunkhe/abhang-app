import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { FaArrowLeft, FaChevronRight } from 'react-icons/fa';
import { santService } from '../services/santService';

export default function CategoryDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [abhangs, setAbhangs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sants, setSants] = useState([]);
    const [selectedSant, setSelectedSant] = useState('all');

    useEffect(() => {
        // Fetch category details
        const fetchCategory = async () => {
            try {
                const categorySnapshot = await getDocs(collection(db, 'categories'));
                const categories = categorySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                const currentCategory = categories.find(cat => cat.slug === slug);
                setCategory(currentCategory);
            } catch (error) {
                console.error("Error fetching category:", error);
            }
        };

        // Fetch sants for filter
        const fetchSants = async () => {
            try {
                const santList = await santService.getAll();
                setSants(santList);
            } catch (error) {
                console.error("Error fetching sants:", error);
            }
        };

        fetchCategory();
        fetchSants();
    }, [slug]);

    useEffect(() => {
        if (!category) return;

        // Realtime listener for abhangs in this category
        // Query by both slug and name to handle legacy data
        const q = query(
            collection(db, 'abhangs'),
            where('category', 'in', [slug, category.name])
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const abhangsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAbhangs(abhangsList);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching category abhangs:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [slug, category]);

    const filteredAbhangs = abhangs.filter(abhang => {
        if (selectedSant === 'all') return true;
        return abhang.author === selectedSant;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron"></div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="p-4 pb-24">
                <div className="text-center py-10">
                    <p className="text-gray-500">श्रेणी सापडली नाही</p>
                    <button onClick={() => navigate('/categories')} className="mt-4 text-saffron">
                        परत जा
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 pb-24 min-h-screen bg-paper">
            <header className="mb-6">
                <button
                    onClick={() => navigate('/categories')}
                    className="mb-4 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-saffron transition-colors"
                >
                    <FaArrowLeft />
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-saffron font-mukta mb-1">{category.name}</h1>
                        <p className="text-gray-500 text-sm">{abhangs.length} अभंग उपलब्ध</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-saffron text-xl">
                        <span className="font-bold">{category.name.charAt(0)}</span>
                    </div>
                </div>

                {/* Sant Filter */}
                <div className="mt-6">
                    <select
                        value={selectedSant}
                        onChange={(e) => setSelectedSant(e.target.value)}
                        className="w-full p-3 border-none rounded-xl bg-white shadow-sm text-gray-700 focus:ring-2 focus:ring-saffron/50 outline-none"
                    >
                        <option value="all">सर्व संत</option>
                        {sants.map(sant => (
                            <option key={sant.id} value={sant.name}>{sant.name}</option>
                        ))}
                    </select>
                </div>
            </header>

            {filteredAbhangs.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-50">
                    <p className="text-gray-500 font-medium">या संतांचे अभंग या श्रेणीमध्ये नाहीत</p>
                    <p className="text-sm text-gray-400 mt-2">No abhangs found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredAbhangs.map((abhang) => (
                        <Link
                            key={abhang.id}
                            to={`/abhang/${abhang.id}`}
                            className="block group"
                        >
                            <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-orange-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110"></div>

                                <div className="flex justify-between items-start relative z-10">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <h3 className="font-bold text-lg text-gray-800 font-mukta truncate group-hover:text-saffron transition-colors">
                                            {abhang.title}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-saffron">
                                                {abhang.author}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-saffron group-hover:text-white transition-all">
                                        <FaChevronRight className="text-sm" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
