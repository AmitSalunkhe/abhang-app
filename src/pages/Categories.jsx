import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import GlobalSearch from '../components/GlobalSearch';
import { CardSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorBoundary from '../components/ErrorBoundary';

// Enhanced category icons/emojis mapping
const categoryIcons = {
    'default': '📚',
    'भक्ति': '🙏',
    'ज्ञान': '💡',
    'प्रेम': '❤️',
    'निर्गुण': '🕉️',
    'सगुण': '🌺',
    'विरह': '💔',
    'आनंद': '😊',
};

const gradients = [
    'from-orange-400 to-red-400',
    'from-purple-400 to-pink-400',
    'from-blue-400 to-cyan-400',
    'from-green-400 to-teal-400',
    'from-yellow-400 to-orange-400',
    'from-indigo-400 to-purple-400',
    'from-pink-400 to-rose-400',
    'from-cyan-400 to-blue-400',
];

const CategoryCard = ({ category, index }) => {
    const icon = categoryIcons[category.name] || categoryIcons['default'];

    return (
        <Link
            to={`/category/${category.slug}`}
            className="stagger-item group block"
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            <div className="bg-white rounded-3xl p-6 shadow-card border border-gray-50 hover:shadow-soft hover:-translate-y-1 transition-all duration-300 relative overflow-hidden h-full flex flex-col items-center text-center group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                    {/* Icon */}
                    <div className="mb-4 relative">
                        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                            <span className="text-4xl">{icon}</span>
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-lg text-text-primary font-mukta mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {category.name}
                    </h3>

                    {/* Count badge */}
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-gray-100 text-text-muted font-outfit group-hover:bg-white transition-colors">
                        {category.count} Abhangs
                    </span>
                </div>
            </div>
        </Link>
    );
};

function CategoriesContent() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState({ original: '', marathi: '' });
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, 'categories'),
            async (snapshot) => {
                try {
                    const cats = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    const categoriesWithCount = await Promise.all(
                        cats.map(async (cat) => {
                            try {
                                if (!cat.slug) return { ...cat, count: 0 };
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
                    setError(null);
                } catch (error) {
                    console.error("Error processing categories data:", error);
                    setError(error.message);
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error('Error fetching categories:', error);
                setError(error.message);
                setLoading(false);
            }
        );

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

    if (error) {
        return (
            <div className="p-4 pb-24 min-h-screen bg-background">
                <div className="max-w-md mx-auto mt-20">
                    <EmptyState
                        icon="⚠️"
                        title="Error Loading Data"
                        description={error}
                        action={() => window.location.reload()}
                        actionLabel="Retry"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Minimal Header */}
            <div className="bg-white pt-8 pb-6 px-6 rounded-b-[2.5rem] shadow-soft mb-6">
                <h1 className="text-3xl font-bold text-text-primary font-outfit mb-1">Categories</h1>
                <p className="text-text-muted font-outfit">Browse by topics</p>
            </div>

            <div className="px-6 -mt-2">
                {/* Search Bar */}
                <div className="mb-6 animate-slide-up">
                    <GlobalSearch
                        onSearch={handleSearch}
                        placeholder="Search categories..."
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <CardSkeleton count={6} />
                    </div>
                ) : (
                    <>
                        {filteredCategories.length === 0 ? (
                            <EmptyState
                                icon="📚"
                                title="No categories found"
                                description="Try different search terms"
                            />
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                                {filteredCategories.map((category, index) => (
                                    <CategoryCard key={category.id} category={category} index={index} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default function Categories() {
    return (
        <ErrorBoundary>
            <CategoriesContent />
        </ErrorBoundary>
    );
}
