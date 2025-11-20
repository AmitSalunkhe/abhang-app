import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { abhangService } from '../services/abhangService';
import { FaArrowLeft, FaHeart, FaRegHeart, FaFont, FaShareAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function AbhangDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [abhang, setAbhang] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fontSize, setFontSize] = useState(18);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showFontControls, setShowFontControls] = useState(false);

    useEffect(() => {
        fetchAbhang();
        checkIfFavorite();
    }, [id]);

    const fetchAbhang = async () => {
        try {
            const data = await abhangService.getById(id);
            setAbhang(data);
        } catch (error) {
            console.error("Failed to fetch abhang", error);
        } finally {
            setLoading(false);
        }
    };

    const checkIfFavorite = async () => {
        if (!currentUser) return;
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
            const favorites = userDoc.data().favorites || [];
            setIsFavorite(favorites.includes(id));
        }
    };

    const toggleFavorite = async () => {
        if (!currentUser) return;
        const userRef = doc(db, "users", currentUser.uid);

        try {
            if (isFavorite) {
                await updateDoc(userRef, {
                    favorites: arrayRemove(id)
                });
                setIsFavorite(false);
            } else {
                await updateDoc(userRef, {
                    favorites: arrayUnion(id)
                });
                setIsFavorite(true);
            }
        } catch (error) {
            console.error("Error updating favorites:", error);
        }
    };

    if (loading) return <div className="p-4 text-center">लोड होत आहे...</div>;
    if (!abhang) return <div className="p-4 text-center">अभंग सापडला नाही.</div>;

    return (
        <div className="min-h-screen bg-paper flex flex-col relative">
            {/* Minimal Header */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-gray-600 hover:bg-white transition-all"
                >
                    <FaArrowLeft />
                </button>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowFontControls(!showFontControls)}
                        className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-gray-600 hover:bg-white transition-all"
                    >
                        <FaFont />
                    </button>
                    <button
                        className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-gray-600 hover:bg-white transition-all"
                    >
                        <FaShareAlt />
                    </button>
                </div>
            </div>

            {/* Font Controls - Floating Panel */}
            {showFontControls && (
                <div className="absolute top-20 right-4 z-20 bg-white rounded-2xl shadow-lg p-4 border border-gray-100 animate-fade-in w-48">
                    <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Font Size</p>
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1">
                        <button
                            onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                            className="w-8 h-8 rounded-md flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm transition-all"
                        >
                            A-
                        </button>
                        <span className="text-sm font-bold text-gray-700">{fontSize}</span>
                        <button
                            onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                            className="w-8 h-8 rounded-md flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm transition-all"
                        >
                            A+
                        </button>
                    </div>
                </div>
            )}

            {/* Content - Scrollable Paper */}
            <div className="flex-1 overflow-y-auto pt-24 pb-32 px-6">
                <div className="max-w-lg mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-saffron font-mukta mb-3 leading-tight">
                            {abhang.title}
                        </h1>
                        <div className="inline-block px-4 py-1 rounded-full bg-orange-50 text-saffron text-sm font-medium border border-orange-100">
                            {abhang.author || 'संत तुकाराम'}
                        </div>
                    </div>

                    <div className="relative">
                        {/* Decorative quotes */}
                        <span className="absolute -top-4 -left-2 text-6xl text-orange-100 font-serif opacity-50">"</span>

                        <div
                            className="whitespace-pre-line text-center leading-loose text-gray-800 font-mukta relative z-10"
                            style={{ fontSize: `${fontSize}px`, lineHeight: '2' }}
                        >
                            {abhang.content}
                        </div>

                        <span className="absolute -bottom-8 -right-2 text-6xl text-orange-100 font-serif opacity-50 transform rotate-180">"</span>
                    </div>
                </div>
            </div>

            {/* Floating Action Button for Favorite */}
            <button
                onClick={toggleFavorite}
                className="fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 z-30"
                style={{
                    background: isFavorite ? '#FF9933' : 'white',
                    color: isFavorite ? 'white' : '#FF9933'
                }}
            >
                {isFavorite ? <FaHeart className="text-2xl" /> : <FaRegHeart className="text-2xl" />}
            </button>
        </div>
    );
}
