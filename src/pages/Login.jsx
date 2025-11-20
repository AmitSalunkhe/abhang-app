import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { FaGoogle } from 'react-icons/fa';

export default function Login() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    React.useEffect(() => {
        if (currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);

        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user document exists
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (!userDoc.exists()) {
                // Create new user document with Google info
                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    displayName: user.displayName || user.email.split('@')[0],
                    photoURL: user.photoURL || null,
                    role: 'general',
                    favorites: []
                });
            } else {
                // Update existing user with latest Google info
                const existingData = userDoc.data();
                if (existingData.photoURL !== user.photoURL || existingData.displayName !== user.displayName) {
                    await updateDoc(doc(db, "users", user.uid), {
                        photoURL: user.photoURL || null,
                        displayName: user.displayName || existingData.displayName
                    });
                }
            }

            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const [deferredPrompt, setDeferredPrompt] = useState(null);

    React.useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-paper p-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-50 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-10 -mt-10 opacity-50"></div>

                <div className="text-center mb-10 relative z-10">
                    <div className="w-20 h-20 bg-saffron rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce-slow">
                        <span className="text-4xl">🙏</span>
                    </div>
                    <p className="text-saffron font-medium mb-2 tracking-wide uppercase text-xs">जननी माता भजन मंडळ मोरावळे</p>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2 font-mukta">अभंगवाणी</h1>
                    <p className="text-gray-500 text-sm">
                        आपले स्वागत आहे
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        {error}
                    </div>
                )}

                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-bold py-4 px-6 rounded-2xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md group"
                >
                    <FaGoogle className="text-red-500 text-xl group-hover:scale-110 transition-transform" />
                    <span className="text-lg font-mukta">Google सह साइन इन करा</span>
                </button>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">सुरक्षित आणि जलद प्रवेशासाठी</p>
                </div>

                {deferredPrompt && (
                    <button
                        onClick={handleInstallClick}
                        className="mt-8 w-full bg-gradient-to-r from-saffron to-orange-500 text-white font-bold py-3 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                    >
                        📱 ॲप इन्स्टॉल करा
                    </button>
                )}
            </div>
        </div>
    );
}
