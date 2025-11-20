import React from 'react';

export default function SplashScreen() {
    return (
        <div className="fixed inset-0 bg-paper flex flex-col items-center justify-center z-50">
            <div className="animate-bounce mb-4">
                <div className="w-24 h-24 bg-saffron rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-4xl">🙏</span>
                </div>
            </div>
            <h1 className="text-3xl font-bold text-saffron animate-pulse font-mukta">अभंगवाणी</h1>
            <p className="text-gray-500 mt-2 text-sm">जननी माता भजन मंडळ</p>
        </div>
    );
}
