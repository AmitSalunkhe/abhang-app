import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import GlobalSearch from '../components/GlobalSearch';
import { categoryService } from '../services/categoryService';
import { santService } from '../services/santService';

export default function Home() {
    const [abhangs, setAbhangs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState({ original: '', marathi: '' });
    const [userName, setUserName] = useState('वापरकर्ता');
    const { currentUser } = useAuth();

    // Filter states
    const [categories, setCategories] = useState([]);
    const [sants, setSants] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSant, setSelectedSant] = useState('all');

    useEffect(() => {
        fetchUserName();
        fetchFilters();

        // Realtime listener for abhangs
        const q = query(collection(db, 'abhangs'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const abhangsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAbhangs(abhangsList);
            setLoading(false);
        }, (error) => {
            console.error("Failed to fetch abhangs", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const fetchUserName = async () => {
        if (currentUser) {
            try {
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUserName(userData.displayName || currentUser.email?.split('@')[0] || 'वापरकर्ता');
                }
            } catch (error) {
                console.error("Failed to fetch user name", error);
                setUserName(currentUser.email?.split('@')[0] || 'वापरकर्ता');
            }
        }
    };

    const fetchFilters = async () => {
        try {
            const [cats, santList] = await Promise.all([
                categoryService.getAll(),
                santService.getAll()
            ]);
            setCategories(cats);
            setSants(santList);
        } catch (error) {
            console.error("Error fetching filters:", error);
        }
    };

    const handleSearch = (original, marathi) => {
        setSearchQuery({ original: original.toLowerCase(), marathi: marathi.toLowerCase() });
    };

    const filteredAbhangs = abhangs.filter(abhang => {
        // 1. Search Query Filter
        const { original, marathi } = searchQuery;
        let matchesSearch = true;

        if (original) {
            const title = abhang.title?.toLowerCase() || '';
            const author = abhang.author?.toLowerCase() || '';
            const content = abhang.content?.toLowerCase() || '';
            const category = abhang.category?.toLowerCase() || '';

            matchesSearch = (
                title.includes(original) || title.includes(marathi) ||
                author.includes(original) || author.includes(marathi) ||
                content.includes(original) || content.includes(marathi) ||
                category.includes(original) || category.includes(marathi)
            );
        }

        // 2. Category Filter
        let matchesCategory = true;
        if (selectedCategory !== 'all') {
            matchesCategory = abhang.category === selectedCategory;
        }

        // 3. Sant Filter
        let matchesSant = true;
        if (selectedSant !== 'all') {
            matchesSant = abhang.author === selectedSant;
        }

        return matchesSearch && matchesCategory && matchesSant;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron"></div>
            </div>
        );
    }

    return (
        <div className="pb-24 min-h-screen bg-paper">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-saffron to-gold pb-12 pt-8 px-6 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                    <svg width="200" height="200" viewBox="0 0 200 200" fill="currentColor" className="text-white">
                        <path d="M100 0C44.8 0 0 44.8 0 100s44.8 100 100 100 100-44.8 100-100S155.2 0 100 0zm0 180c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z" />
                    </svg>
                </div>

                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-white font-mukta mb-1">अभंगवाणी</h1>
                    <p className='text-orange-50 text-lg font-medium'>रामकृष्णहरी, {userName} 🙏</p>
                    <p className="text-orange-100 text-sm mt-1">आजचा दिवस मंगलमय असो!</p>
                </div>
            </div>

            {/* Search Section - Floating overlap */}
            <div className="px-4 -mt-7 relative z-20 mb-6">
                <GlobalSearch
                    onSearch={handleSearch}
                    placeholder="अभंग, संत किंवा श्रेणी शोधा..."
                />
            </div>

            <div className="px-4 space-y-6">
                {/* Filters - Horizontal Scroll */}
                <div className="space-y-3">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                        {/* Sant Filters */}
                        <button
                            onClick={() => setSelectedSant('all')}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedSant === 'all'
                                    ? 'bg-saffron text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-100'
                                }`}
                        >
                            सर्व संत
                        </button>
                        {sants.map(sant => (
                            <button
                                key={sant.id}
                                onClick={() => setSelectedSant(sant.name)}
                                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedSant === sant.name
                                        ? 'bg-saffron text-white shadow-md'
                                        : 'bg-white text-gray-600 border border-gray-100'
                                    }`}
                            >
                                {sant.name}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                        {/* Category Filters */}
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === 'all'
                                    ? 'bg-gold text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-100'
                                }`}
                        >
                            सर्व श्रेणी
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.slug)}
                                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.slug
                                        ? 'bg-gold text-white shadow-md'
                                        : 'bg-white text-gray-600 border border-gray-100'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 font-mukta mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-saffron rounded-full"></span>
                        {searchQuery.original || selectedCategory !== 'all' || selectedSant !== 'all'
                            ? 'शोध निकाल'
                            : 'नवीनतम अभंग'}
                    </h2>

                    {filteredAbhangs.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-3xl shadow-sm border border-gray-50">
                            <div className="text-6xl mb-4">🙏</div>
                            <p className="text-gray-500 font-medium">कोणतेही अभंग सापडले नाहीत</p>
                            <p className="text-sm text-gray-400 mt-1">कृपया वेगळे शब्द वापरून पहा</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredAbhangs.map(abhang => (
                                <Link to={`/abhang/${abhang.id}`} key={abhang.id} className="block group">
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
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
