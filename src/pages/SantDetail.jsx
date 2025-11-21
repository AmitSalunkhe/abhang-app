import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { FaArrowLeft } from 'react-icons/fa';
import { categoryService } from '../services/categoryService';
import { ListSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorBoundary from '../components/ErrorBoundary';

const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

function SantDetailContent() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [santName, setSantName] = useState('');
    const [abhangs, setAbhangs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sant, setSant] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
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
        const qSant = query(collection(db, 'sants'), where('slug', '==', slug));

        const unsubscribeSant = onSnapshot(qSant, (snapshot) => {
            if (!snapshot.empty) {
                const santData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
                setSant(santData);
                setSantName(santData.name);
            } else {
                setError('Sant not found');
                setLoading(false);
            }
        }, (error) => {
            console.error("Error fetching sant:", error);
            setError(error.message);
            setLoading(false);
        });

        return () => unsubscribeSant();
    }, [slug]);

    useEffect(() => {
        if (!sant) return;

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
            setError(error.message);
            setLoading(false);
        });

        return () => unsubscribeAbhangs();
    }, [sant]);

    const filteredAbhangs = abhangs.filter(abhang => {
        if (selectedCategory === 'all') return true;
        return abhang.category === selectedCategory;
    });

    if (error) {
        return (
            <div className="min-h-screen bg-background p-4">
                <div className="max-w-md mx-auto mt-20">
                    <EmptyState
                        icon="⚠️"
                        title="Error"
                        description={error}
                        action={() => navigate('/sants')}
                        actionLabel="Go Back"
                    />
                </div>
            </div>
        );
    }

    if (loading || !sant) {
        return (
            <div className="min-h-screen bg-background">
                <div className="bg-white pb-6 pt-6 px-6 shadow-soft mb-6">
                    <div className="h-8 bg-gray-100 rounded w-3/4 mb-3 animate-pulse"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="px-4">
                    <ListSkeleton count={5} />
                </div>
            </div>
        );
    }

    const initials = getInitials(sant.name);

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="bg-white shadow-soft px-6 pt-8 pb-8 rounded-b-3xl mb-6">
                <button
                    onClick={() => navigate('/sants')}
                    className="mb-6 flex items-center text-text-muted hover:text-text-primary transition-colors group"
                >
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                        <FaArrowLeft className="text-sm" />
                    </div>
                    <span className="ml-3 font-medium font-outfit">Back</span>
                </button>

                <div className="flex items-center gap-5 animate-slide-up">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center shadow-sm border border-secondary/20">
                            <span className="text-secondary font-bold text-2xl font-outfit">{initials}</span>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary font-mukta mb-1">{sant.name}</h1>
                        <p className="text-text-muted font-outfit">{abhangs.length} Abhangs</p>
                    </div>
                </div>
            </div>

            <div className="px-4">
                {/* Category Filter */}
                {categories.length > 0 && (
                    <div className="mb-6 animate-slide-up">
                        <label className="block text-sm font-bold text-text-muted uppercase tracking-wider mb-3 font-outfit px-1">Filter by Category</label>
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 font-outfit ${selectedCategory === 'all'
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'bg-white text-text-secondary border border-gray-100 hover:border-primary/30 shadow-sm'
                                    }`}
                            >
                                All
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.slug)}
                                    className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 font-outfit ${selectedCategory === cat.slug
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'bg-white text-text-secondary border border-gray-100 hover:border-primary/30 shadow-sm'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Abhangs List */}
                {filteredAbhangs.length === 0 ? (
                    <EmptyState
                        icon="🙏"
                        title="No Abhangs Found"
                        description="There are no abhangs available for this sant."
                        action={selectedCategory !== 'all' ? () => setSelectedCategory('all') : null}
                        actionLabel={selectedCategory !== 'all' ? "View All" : null}
                    />
                ) : (
                    <div className="space-y-3">
                        {filteredAbhangs.map((abhang, index) => (
                            <Link
                                key={abhang.id}
                                to={`/abhang/${abhang.id}`}
                                className="stagger-item block group"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-50 hover:shadow-soft hover:border-primary/20 transition-all duration-300">
                                    <h3 className="font-bold text-lg text-text-primary font-mukta mb-3 group-hover:text-primary transition-colors">
                                        {abhang.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-gray-50 text-text-secondary border border-gray-100 font-outfit">
                                            👤 {abhang.author}
                                        </span>
                                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-secondary/5 text-secondary border border-secondary/10 font-outfit">
                                            📚 {abhang.category}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SantDetail() {
    return (
        <ErrorBoundary>
            <SantDetailContent />
        </ErrorBoundary>
    );
}

