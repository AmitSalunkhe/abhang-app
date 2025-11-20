import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { abhangService } from '../services/abhangService';
import { FaHeart, FaChevronRight, FaSadTear } from 'react-icons/fa';
import GlobalSearch from '../components/GlobalSearch';

export default function Favorites() {
    const { currentUser } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState({ original: '', marathi: '' });

    useEffect(() => {
        if (!currentUser) return;

        const userRef = doc(db, "users", currentUser.uid);
        const unsubscribe = onSnapshot(userRef, async (docSnap) => {
            if (docSnap.exists()) {
                const favoriteIds = docSnap.data().favorites || [];
                if (favoriteIds.length > 0) {
                    try {
                        const promises = favoriteIds.map(id => abhangService.getById(id));
                        const results = await Promise.all(promises);
                        setFavorites(results.filter(item => item !== null)); // Filter out any nulls if abhangs were deleted
                    } catch (error) {
                        console.error("Error fetching favorite abhangs:", error);
                    }
                } else {
                    setFavorites([]);
                }
            }
            setLoading(false);
        }, (error) => {
            console.error("Error listening to favorites:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleSearch = (original, marathi) => {
        setSearchQuery({ original: original.toLowerCase(), marathi: marathi.toLowerCase() });
    };

    const filteredFavorites = favorites.filter(abhang => {
        const { original, marathi } = searchQuery;
        if (!original) return true;

        const title = abhang.title?.toLowerCase() || '';
        const author = abhang.author?.toLowerCase() || '';
        const content = abhang.content?.toLowerCase() || '';

        return (
            title.includes(original) || title.includes(marathi) ||
            author.includes(original) || author.includes(marathi) ||
            content.includes(original) || content.includes(marathi)
        );
    });

    return (
        <div className="p-4 pb-24 min-h-screen bg-paper">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-saffron font-mukta mb-2">आवडते अभंग</h1>
                <p className="text-gray-500">तुमचे जतन केलेले अभंग</p>
            </header>

            <div className="mb-6">
                <GlobalSearch
                    onSearch={handleSearch}
                    placeholder="आवडते अभंग शोधा..."
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saffron"></div>
                </div>
            ) : filteredFavorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-50">
                    <FaSadTear className="text-5xl mb-4 text-orange-200" />
                    <p className="font-medium">{favorites.length === 0 ? 'अद्याप कोणतेही आवडते अभंग नाहीत.' : 'कोणतेही अभंग सापडले नाहीत.'}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredFavorites.map((abhang) => (
                        <Link
                            key={abhang.id}
                            to={`/abhang/${abhang.id}`}
                            className="block group"
                        >
                            <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-orange-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110"></div>

                                <div className="flex justify-between items-start relative z-10">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <FaHeart className="text-saffron text-sm" />
                                            <span className="text-xs font-medium text-gray-400">Saved</span>
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-800 font-mukta truncate group-hover:text-saffron transition-colors">
                                            {abhang.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">{abhang.author}</p>
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
