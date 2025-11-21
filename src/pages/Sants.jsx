import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import GlobalSearch from '../components/GlobalSearch';
import { CardSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorBoundary from '../components/ErrorBoundary';

const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

const gradients = [
    'from-orange-400 via-red-400 to-pink-400',
    'from-purple-400 via-pink-400 to-rose-400',
    'from-blue-400 via-cyan-400 to-teal-400',
    'from-green-400 via-emerald-400 to-teal-400',
    'from-yellow-400 via-orange-400 to-red-400',
    'from-indigo-400 via-purple-400 to-pink-400',
    'from-pink-400 via-rose-400 to-red-400',
    'from-cyan-400 via-blue-400 to-indigo-400',
];

const SantCard = ({ sant, index }) => {
    const initials = getInitials(sant.name);

    return (
        <Link
            to={`/sant/${sant.slug}`}
            className="stagger-item group block"
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            <div className="bg-white rounded-3xl p-6 shadow-card border border-gray-50 hover:shadow-soft hover:-translate-y-1 transition-all duration-300 relative overflow-hidden h-full flex flex-col items-center text-center group">
                <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                    {/* Avatar */}
                    <div className="mb-4 relative">
                        <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 text-secondary">
                            <span className="font-bold text-2xl font-mukta">{initials}</span>
                        </div>
                    </div>

                    {/* Name */}
                    <h3 className="font-bold text-lg text-text-primary font-mukta mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
                        {sant.name}
                    </h3>

                    {/* Count badge */}
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-gray-100 text-text-muted font-outfit group-hover:bg-white transition-colors">
                        {sant.count} Abhangs
                    </span>
                </div>
            </div>
        </Link>
    );
};

function SantsContent() {
    const [sants, setSants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState({ original: '', marathi: '' });
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, 'sants'),
            async (snapshot) => {
                try {
                    const santList = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    const santsWithCount = await Promise.all(
                        santList.map(async (sant) => {
                            try {
                                const q = query(collection(db, 'abhangs'), where('author', '==', sant.name));
                                const abhangSnapshot = await getDocs(q);
                                return {
                                    ...sant,
                                    count: abhangSnapshot.size
                                };
                            } catch (err) {
                                console.error(`Error fetching count for sant ${sant.name}:`, err);
                                return { ...sant, count: 0 };
                            }
                        })
                    );

                    setSants(santsWithCount);
                    setError(null);
                } catch (error) {
                    console.error("Error processing sants data:", error);
                    setError(error.message);
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error('Error fetching sants:', error);
                setError(error.message);
                setLoading(false);
            }
        );

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
                <h1 className="text-3xl font-bold text-text-primary font-outfit mb-1">Sants</h1>
                <p className="text-text-muted font-outfit">Explore by authors</p>
            </div>

            <div className="px-6 -mt-2">
                {/* Search Bar */}
                <div className="mb-6 animate-slide-up">
                    <GlobalSearch
                        onSearch={handleSearch}
                        placeholder="Search sants..."
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <CardSkeleton count={8} />
                    </div>
                ) : (
                    <>
                        {filteredSants.length === 0 ? (
                            <EmptyState
                                icon="🙏"
                                title="No sants found"
                                description="Try different search terms"
                            />
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                                {filteredSants.map((sant, index) => (
                                    <SantCard key={sant.id} sant={sant} index={index} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default function Sants() {
    return (
        <ErrorBoundary>
            <SantsContent />
        </ErrorBoundary>
    );
}
