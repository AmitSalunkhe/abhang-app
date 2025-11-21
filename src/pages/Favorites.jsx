import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { favoritesService } from '../services/favoritesService';
import GlobalSearch from '../components/GlobalSearch';
import { ListSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorBoundary from '../components/ErrorBoundary';

function FavoritesContent() {
    const { currentUser } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [abhangs, setAbhangs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState({ original: '', marathi: '' });

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const favoritesQuery = query(
            collection(db, 'favorites'),
            where('userId', '==', currentUser.uid)
        );

        const unsubscribe = onSnapshot(favoritesQuery, async (snapshot) => {
            const favoritesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setFavorites(favoritesList);

            if (favoritesList.length > 0) {
                const abhangPromises = favoritesList.map(async (fav) => {
                    try {
                        const abhangQuery = query(
                            collection(db, 'abhangs'),
                            where('__name__', '==', fav.abhangId)
                        );
                        const abhangSnapshot = await getDocs(abhangQuery);
                        if (!abhangSnapshot.empty) {
                            return {
                                id: abhangSnapshot.docs[0].id,
                                ...abhangSnapshot.docs[0].data()
                            };
                        }
                        return null;
                    } catch (error) {
                        console.error('Error fetching abhang:', error);
                        return null;
                    }
                });

                const abhangsList = await Promise.all(abhangPromises);
                setAbhangs(abhangsList.filter(a => a !== null));
            } else {
                setAbhangs([]);
            }
            setLoading(false);
        }, (error) => {
            console.error('Error fetching favorites:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleSearch = (original, marathi) => {
        setSearchQuery({ original: original.toLowerCase(), marathi: marathi.toLowerCase() });
    };

    const filteredAbhangs = abhangs.filter(abhang => {
        const { original, marathi } = searchQuery;
        if (!original) return true;

        const title = abhang.title?.toLowerCase() || '';
        const author = abhang.author?.toLowerCase() || '';
        const category = abhang.category?.toLowerCase() || '';

        return (
            title.includes(original) || title.includes(marathi) ||
            author.includes(original) || author.includes(marathi) ||
            category.includes(original) || category.includes(marathi)
        );
    });

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-white to-pink-50/20 pb-24">
                <div className="max-w-md mx-auto mt-20 px-4">
                    <EmptyState
                        icon="❤️"
                        title="लॉगिन आवश्यक आहे"
                        description="आवडीचे अभंग पाहण्यासाठी कृपया लॉगिन करा"
                        gradient="from-red-50 to-transparent"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Minimal Header */}
            <div className="bg-white pt-8 pb-6 px-6 rounded-b-[2.5rem] shadow-soft mb-6">
                <h1 className="text-3xl font-bold text-text-primary font-outfit mb-1">Favorites</h1>
                <p className="text-text-muted font-outfit">Your collection of saved abhangs</p>
            </div>

            <div className="px-6 -mt-2">
                {/* Search Bar */}
                <div className="mb-6 animate-slide-up">
                    <GlobalSearch
                        onSearch={handleSearch}
                        placeholder="Search favorites..."
                    />
                </div>

                {loading ? (
                    <ListSkeleton count={5} />
                ) : (
                    <>
                        {filteredAbhangs.length === 0 ? (
                            <EmptyState
                                icon="❤️"
                                title={abhangs.length === 0 ? 'No favorites yet' : 'No matches found'}
                                description={abhangs.length === 0 ? 'Save abhangs you like by tapping the heart icon' : 'Try different search terms'}
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
                                        <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-50 hover:shadow-soft hover:-translate-y-1 hover:border-primary/20 transition-all duration-300 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                            <div className="relative z-10">
                                                <h3 className="font-bold text-lg text-text-primary font-mukta mb-3 group-hover:text-primary transition-colors">
                                                    {abhang.title}
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-text-secondary font-outfit group-hover:bg-white transition-colors">
                                                        👤 {abhang.author}
                                                    </span>
                                                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-text-secondary font-outfit group-hover:bg-white transition-colors">
                                                        📚 {abhang.category}
                                                    </span>
                                                </div>
                                            </div>
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

export default function Favorites() {
    return (
        <ErrorBoundary>
            <FavoritesContent />
        </ErrorBoundary>
    );
}
