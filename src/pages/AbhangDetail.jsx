import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FaArrowLeft, FaHeart, FaRegHeart, FaShare, FaTextHeight } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { favoritesService } from '../services/favoritesService';
import { DetailSkeleton } from '../components/LoadingSkeleton';
import ErrorBoundary from '../components/ErrorBoundary';

function AbhangDetailContent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [abhang, setAbhang] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [fontSize, setFontSize] = useState(18);
    const [error, setError] = useState(null);
    const [showFontSlider, setShowFontSlider] = useState(false);

    useEffect(() => {
        const fetchAbhang = async () => {
            try {
                const abhangDoc = await getDoc(doc(db, 'abhangs', id));
                if (abhangDoc.exists()) {
                    setAbhang({ id: abhangDoc.id, ...abhangDoc.data() });
                } else {
                    setError('Abhang not found');
                }
            } catch (error) {
                console.error("Error fetching abhang:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAbhang();
    }, [id]);

    useEffect(() => {
        if (currentUser && id) {
            checkFavorite();
        }
    }, [currentUser, id]);

    useEffect(() => {
        const saved = localStorage.getItem('abhang-font-size');
        if (saved) setFontSize(parseInt(saved));
    }, []);

    const checkFavorite = async () => {
        try {
            const favorites = await favoritesService.getUserFavorites(currentUser.uid);
            setIsFavorite(favorites.some(fav => fav.abhangId === id));
        } catch (error) {
            console.error("Error checking favorite:", error);
        }
    };

    const toggleFavorite = async () => {
        if (!currentUser) return;

        try {
            if (isFavorite) {
                await favoritesService.removeFavorite(currentUser.uid, id);
                setIsFavorite(false);
            } else {
                await favoritesService.addFavorite(currentUser.uid, id);
                setIsFavorite(true);
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    };

    const handleShare = async () => {
        if (navigator.share && abhang) {
            try {
                await navigator.share({
                    title: abhang.title,
                    text: `${abhang.title} - ${abhang.author}`,
                    url: window.location.href
                });
            } catch (error) {
                console.error("Error sharing:", error);
            }
        }
    };

    const handleFontSizeChange = (newSize) => {
        setFontSize(newSize);
        localStorage.setItem('abhang-font-size', newSize.toString());
    };

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-card border border-gray-50 p-8 text-center animate-scale-in">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">⚠️</span>
                    </div>
                    <h3 className="text-lg font-bold text-text-primary font-outfit mb-2">Error</h3>
                    <p className="text-text-secondary text-sm mb-6">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 font-outfit"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (loading || !abhang) {
        return <DetailSkeleton />;
    }

    const lyricsText = abhang.lyrics || abhang.content || '';

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="px-6 pt-8 pb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center text-text-muted hover:text-text-primary transition-colors group"
                >
                    <div className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FaArrowLeft className="text-sm" />
                    </div>
                </button>

                <h1 className="text-3xl font-bold text-text-primary font-mukta mb-4 leading-tight">
                    {abhang.title}
                </h1>

                <div className="flex flex-wrap gap-3 mb-6">
                    <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                        👤 {abhang.author}
                    </span>
                    <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-secondary/10 text-secondary border border-secondary/20">
                        📚 {abhang.category}
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    {currentUser && (
                        <button
                            onClick={toggleFavorite}
                            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${isFavorite
                                ? 'bg-red-50 text-red-500 border border-red-100 shadow-sm'
                                : 'bg-white text-text-secondary border border-gray-100 shadow-soft hover:shadow-card'
                                }`}
                        >
                            {isFavorite ? <FaHeart /> : <FaRegHeart />}
                            <span>{isFavorite ? 'Saved' : 'Save'}</span>
                        </button>
                    )}
                    {navigator.share && (
                        <button
                            onClick={handleShare}
                            className="bg-white text-text-secondary py-3 px-5 rounded-xl border border-gray-100 shadow-soft hover:shadow-card transition-all flex items-center justify-center"
                        >
                            <FaShare />
                        </button>
                    )}
                    <button
                        onClick={() => setShowFontSlider(!showFontSlider)}
                        className={`py-3 px-5 rounded-xl border transition-all flex items-center justify-center ${showFontSlider
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-white text-text-secondary border-gray-100 shadow-soft hover:shadow-card'
                            }`}
                    >
                        <FaTextHeight />
                    </button>
                </div>
            </div>

            {/* Lyrics Section */}
            <div className="px-4">
                <div className="bg-white rounded-3xl p-6 shadow-card border border-gray-50">
                    {/* Font Size Slider */}
                    {showFontSlider && (
                        <div className="mb-6 pb-6 border-b border-gray-100 animate-fade-in">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-sm font-bold text-text-muted uppercase tracking-wider font-outfit">Font Size</label>
                                <span className="text-xs font-medium text-text-muted bg-gray-100 px-2 py-1 rounded-md font-outfit">{fontSize}px</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-text-muted font-outfit">A</span>
                                <input
                                    type="range"
                                    min="14"
                                    max="32"
                                    value={fontSize}
                                    onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <span className="text-xl text-text-primary font-bold font-outfit">A</span>
                            </div>
                        </div>
                    )}

                    {/* Lyrics Text */}
                    <div
                        className="leading-loose font-mukta text-text-primary whitespace-pre-wrap"
                        style={{ fontSize: `${fontSize}px` }}
                    >
                        {lyricsText || 'No lyrics available'}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AbhangDetail() {
    return (
        <ErrorBoundary>
            <AbhangDetailContent />
        </ErrorBoundary>
    );
}
