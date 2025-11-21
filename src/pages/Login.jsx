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
    const [showInstallInstructions, setShowInstallInstructions] = useState(false);

    React.useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        } else {
            // Show manual install instructions
            setShowInstallInstructions(true);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-card p-8 border border-gray-50 relative overflow-hidden animate-slide-up">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-saffron/10 rounded-bl-full -mr-10 -mt-10 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-tr-full -ml-8 -mb-8 opacity-50"></div>

                <div className="text-center mb-10 relative z-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-saffron to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-saffron/30 animate-bounce-slow transform rotate-3">
                        <span className="text-5xl">🙏</span>
                    </div>
                    <p className="text-saffron font-bold mb-2 tracking-wider uppercase text-xs font-outfit">Janani Mata Bhajan Mandal Moravale</p>
                    <h1 className="text-4xl font-bold text-text-primary mb-3 font-mukta">Abhangwani</h1>
                    <p className="text-text-muted text-sm font-outfit">
                        Welcome back, please sign in to continue
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 font-medium">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        {error}
                    </div>
                )}

                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white text-text-primary font-bold py-4 px-6 rounded-2xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md group font-outfit"
                >
                    <FaGoogle className="text-red-500 text-xl group-hover:scale-110 transition-transform" />
                    <span className="text-lg">Sign in with Google</span>
                </button>

                <div className="mt-8 text-center">
                    <p className="text-xs text-text-muted font-outfit">Secure and fast access</p>
                </div>

                {/* Always visible Install App button */}
                <button
                    onClick={handleInstallClick}
                    className="mt-6 w-full bg-secondary text-white font-bold py-3 px-4 rounded-2xl shadow-lg shadow-secondary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 font-outfit"
                >
                    <span>📱</span> Install App
                </button>

                {/* Install Instructions Modal */}
                {showInstallInstructions && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowInstallInstructions(false)}>
                        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-strong animate-scale-in" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-xl font-bold text-text-primary mb-4 font-outfit">How to Install App</h3>
                            <div className="space-y-4 text-sm text-text-secondary font-outfit">
                                <div>
                                    <p className="font-bold text-text-primary mb-1">Chrome (Android):</p>
                                    <ol className="list-decimal list-inside space-y-1 ml-2 text-text-muted">
                                        <li>Click Menu (⋮)</li>
                                        <li>Select "Add to Home screen"</li>
                                        <li>Click "Install"</li>
                                    </ol>
                                </div>
                                <div>
                                    <p className="font-bold text-text-primary mb-1">Safari (iPhone):</p>
                                    <ol className="list-decimal list-inside space-y-1 ml-2 text-text-muted">
                                        <li>Click Share button (□↑)</li>
                                        <li>Select "Add to Home Screen"</li>
                                        <li>Click "Add"</li>
                                    </ol>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowInstallInstructions(false)}
                                className="mt-8 w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
