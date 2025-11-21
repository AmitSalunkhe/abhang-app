import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import GlobalSearch from '../components/GlobalSearch';
import { santService } from '../services/santService';
import { categoryService } from '../services/categoryService';
import { ListSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorBoundary from '../components/ErrorBoundary';

function HomeContent() {
    const { currentUser } = useAuth();
    const [abhangs, setAbhangs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState({ original: '', marathi: '' });
    const [displayName, setDisplayName] = useState('');
    const [sants, setSants] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedSant, setSelectedSant] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        setDisplayName(userDoc.data().displayName || '');
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        };
        fetchUserData();
    }, [currentUser]);

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [santsList, catsList] = await Promise.all([
                    santService.getAll(),
                    categoryService.getAll()
                ]);
                setSants(santsList);
                setCategories(catsList);
            } catch (error) {
                console.error("Error fetching filters:", error);
            }
        };
        fetchFilters();
    }, []);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'abhangs'), (snapshot) => {
            const abhangsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAbhangs(abhangsList);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching abhangs:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSearch = (original, marathi) => {
        setSearchQuery({ original: original.toLowerCase(), marathi: marathi.toLowerCase() });
    };

    const clearFilters = () => {
        setSelectedSant('');
        setSelectedCategory('');
    };

    const filteredAbhangs = abhangs.filter(abhang => {
        const { original, marathi } = searchQuery;
        const title = abhang.title?.toLowerCase() || '';
        const author = abhang.author?.toLowerCase() || '';
        const category = abhang.category?.toLowerCase() || '';

        const matchesSearch = !original ||
            title.includes(original) || title.includes(marathi) ||
            author.includes(original) || author.includes(marathi) ||
            category.includes(original) || category.includes(marathi);

        const matchesSant = !selectedSant || abhang.author === selectedSant;
        const matchesCategory = !selectedCategory || abhang.category === selectedCategory;

        return matchesSearch && matchesSant && matchesCategory;
    });

    const hasActiveFilters = selectedSant || selectedCategory;

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Hero Section */}
            <div className="px-6 pt-12 pb-8">
                <div className="animate-fade-in">
                    <p className="text-text-muted font-medium mb-2 text-sm font-outfit tracking-wide uppercase">Janani Mata Bhajan Mandal</p>
                    <h1 className="text-4xl font-bold text-text-primary font-mukta mb-2">
                        अभंगवाणी
                    </h1>
                    {displayName && (
                        <p className="text-text-secondary text-lg font-outfit">Welcome back, {displayName} 👋</p>
                    )}
                </div>
            </div>

            <div className="px-4">
                {/* Search Bar */}
                <div className="mb-8 animate-slide-up">
                    <GlobalSearch
                        onSearch={handleSearch}
                        placeholder="Search Abhangs..."
                    />
                </div>

                {/* Filter Chips */}
                <div className="mb-8 space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3 ml-1 font-outfit">Sants</label>
                        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
                            <button
                                onClick={() => setSelectedSant('')}
                                className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 font-outfit ${!selectedSant
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'bg-white text-text-secondary border border-gray-100 hover:border-primary/30'
                                    }`}
                            >
                                All
                            </button>
                            {sants.map(sant => (
                                <button
                                    key={sant.id}
                                    onClick={() => setSelectedSant(sant.name)}
                                    className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 font-mukta ${selectedSant === sant.name
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'bg-white text-text-secondary border border-gray-100 hover:border-primary/30'
                                        }`}
                                >
                                    {sant.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3 ml-1 font-outfit">Categories</label>
                        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
                            <button
                                onClick={() => setSelectedCategory('')}
                                className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 font-outfit ${!selectedCategory
                                    ? 'bg-secondary text-white shadow-lg shadow-secondary/30'
                                    : 'bg-white text-text-secondary border border-gray-100 hover:border-secondary/30'
                                    }`}
                            >
                                All
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.slug)}
                                    className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 font-mukta ${selectedCategory === cat.slug
                                        ? 'bg-secondary text-white shadow-lg shadow-secondary/30'
                                        : 'bg-white text-text-secondary border border-gray-100 hover:border-secondary/30'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="w-full bg-gray-100 text-text-secondary py-3 px-4 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium text-sm font-outfit"
                        >
                            Reset Filters
                        </button>
                    )}
                </div>

                {/* Abhangs List */}
                {loading ? (
                    <ListSkeleton count={5} />
                ) : (
                    <>
                        {filteredAbhangs.length === 0 ? (
                            <EmptyState
                                icon="📖"
                                title="No Abhangs Found"
                                description="Try searching for something else"
                                action={hasActiveFilters ? clearFilters : null}
                                actionLabel={hasActiveFilters ? "Reset Filters" : null}
                            />
                        ) : (
                            <div className="space-y-4">
                                {filteredAbhangs.map((abhang, index) => (
                                    <Link
                                        key={abhang.id}
                                        to={`/abhang/${abhang.id}`}
                                        className="stagger-item block group"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <div className="bg-white rounded-2xl p-5 shadow-card hover:shadow-soft hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-primary/10">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg text-text-primary font-mukta group-hover:text-primary transition-colors line-clamp-1">
                                                    {abhang.title}
                                                </h3>
                                                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-lg font-mukta whitespace-nowrap ml-2">
                                                    {abhang.category}
                                                </span>
                                            </div>
                                            <p className="text-sm text-text-muted font-mukta flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                                {abhang.author}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default function Home() {
    return (
        <ErrorBoundary>
            <HomeContent />
        </ErrorBoundary>
    );
}
