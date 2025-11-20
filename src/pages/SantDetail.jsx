import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { FaChevronRight, FaPray, FaArrowLeft } from 'react-icons/fa';
import { categoryService } from '../services/categoryService';

export default function SantDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [santName, setSantName] = useState('');
    const [abhangs, setAbhangs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const [sant, setSant] = useState(null);

    useEffect(() => {
        // Fetch categories for filter
        const fetchCategories = async () => {
            try {
                const cats = await categoryService.getAll();
                setCategories(cats);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        // 1. Find sant by slug
        const qSant = query(collection(db, 'sants'), where('slug', '==', slug));

        const unsubscribeSant = onSnapshot(qSant, (snapshot) => {
            if (!snapshot.empty) {
                const santData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
                setSant(santData);
                setSantName(santData.name);
            } else {
                setLoading(false);
            }
        }, (error) => {
            console.error("Error fetching sant:", error);
            setLoading(false);
        });

        return () => unsubscribeSant();
    }, [slug]);

    useEffect(() => {
        if (!sant) return;

        // 2. Fetch abhangs by this author
        const qAbhangs = query(collection(db, 'abhangs'), where('author', '==', sant.name));

        const unsubscribeAbhangs = onSnapshot(qAbhangs, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAbhangs(list);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching abhangs:", error);
            setLoading(false);
        });

        return () => unsubscribeAbhangs();
    }, [sant]);

    const filteredAbhangs = abhangs.filter(abhang => {
        if (selectedCategory === 'all') return true;
        return abhang.category === selectedCategory;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron"></div>
            </div>
        );
    }

    return (
        <div className="pb-24 p-4 min-h-screen bg-paper">
            <header className="mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-4 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-saffron transition-colors"
                >
                    <FaArrowLeft />
                </button>

                <div className="flex items-center gap-4 mb-2">
                    <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-saffron text-2xl shadow-inner">
                        <FaPray />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-saffron font-mukta">{santName}</h1>
                        <p className="text-gray-500">{abhangs.length} अभंग उपलब्ध</p>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="mt-6">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-3 border-none rounded-xl bg-white shadow-sm text-gray-700 focus:ring-2 focus:ring-saffron/50 outline-none"
                    >
                        <option value="all">सर्व श्रेणी</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.slug}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </header>

            <div className="space-y-4">
                {filteredAbhangs.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-gray-50">
                        <p className="text-gray-500">या श्रेणीत कोणतेही अभंग नाहीत</p>
                    </div>
                ) : (
                    filteredAbhangs.map((abhang) => (
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
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                {abhang.category || 'General'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-saffron group-hover:text-white transition-all">
                                        <FaChevronRight className="text-sm" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
