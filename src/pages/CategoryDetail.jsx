import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { FaArrowLeft } from 'react-icons/fa';
import { santService } from '../services/santService';
import { ListSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorBoundary from '../components/ErrorBoundary';

function CategoryDetailContent() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [abhangs, setAbhangs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sants, setSants] = useState([]);
    const [selectedSant, setSelectedSant] = useState('all');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const categorySnapshot = await getDocs(collection(db, 'categories'));
                const categories = categorySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                const currentCategory = categories.find(cat => cat.slug === slug);
                if (!currentCategory) {
                    setError('Category not found');
                }
                setCategory(currentCategory);
            } catch (error) {
                console.error("Error fetching category:", error);
                setError(error.message);
            }
        };

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
            setError(error.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [slug, category]);

    const filteredAbhangs = abhangs.filter(abhang => {
        if (selectedSant === 'all') return true;
        return abhang.author === selectedSant;
    });

    if (error) {
        return (
            <div className="min-h-screen bg-background p-4">
                <div className="max-w-md mx-auto mt-20">
                    <EmptyState
                        icon="⚠️"
                        title="Error"
                        description={error}
                        action={() => navigate('/categories')}
                        actionLabel="Go Back"
                    />
                </div>
            </div>
        );
    }

    if (loading || !category) {
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

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="bg-white shadow-soft px-6 pt-8 pb-8 rounded-b-3xl mb-6">
                <button
                    onClick={() => navigate('/categories')}
                    className="mb-6 flex items-center text-text-muted hover:text-text-primary transition-colors group"
                >
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                        <FaArrowLeft className="text-sm" />
                    </div>
                    <span className="ml-3 font-medium font-outfit">Back</span>
                </button>
                <h1 className="text-3xl font-bold text-text-primary font-mukta mb-2 animate-slide-up">{category.name}</h1>
                <p className="text-text-muted font-outfit animate-slide-up" style={{ animationDelay: '0.1s' }}>{abhangs.length} Abhangs</p>
            </div>

            <div className="px-4">
                {/* Sant Filter */}
                {sants.length > 0 && (
                    <div className="mb-6 animate-slide-up">
                        <label className="block text-sm font-bold text-text-muted uppercase tracking-wider mb-3 font-outfit px-1">Filter by Sant</label>
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                            <button
                                onClick={() => setSelectedSant('all')}
                                className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 font-outfit ${selectedSant === 'all'
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'bg-white text-text-secondary border border-gray-100 hover:border-primary/30 shadow-sm'
                                    }`}
                            >
                                All
                            </button>
                            {sants.map(sant => (
                                <button
                                    key={sant.id}
                                    onClick={() => setSelectedSant(sant.name)}
                                    className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 font-outfit ${selectedSant === sant.name
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'bg-white text-text-secondary border border-gray-100 hover:border-primary/30 shadow-sm'
                                        }`}
                                >
                                    {sant.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Abhangs List */}
                {filteredAbhangs.length === 0 ? (
                    <EmptyState
                        icon="📖"
                        title="No Abhangs Found"
                        description="There are no abhangs available in this category."
                        action={selectedSant !== 'all' ? () => setSelectedSant('all') : null}
                        actionLabel={selectedSant !== 'all' ? "View All" : null}
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

export default function CategoryDetail() {
    return (
        <ErrorBoundary>
            <CategoryDetailContent />
        </ErrorBoundary>
    );
}

