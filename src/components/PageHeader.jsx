import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

export default function PageHeader({ title, subtitle, showBack = false }) {
    const navigate = useNavigate();

    return (
        <div className="mb-8 pt-6 px-4">
            {showBack && (
                <button
                    onClick={() => navigate(-1)}
                    className="mb-4 flex items-center text-text-muted hover:text-text-primary transition-colors group"
                >
                    <div className="w-8 h-8 rounded-full bg-white shadow-soft flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FaArrowLeft className="text-sm" />
                    </div>
                    <span className="ml-3 font-medium font-outfit">Back</span>
                </button>
            )}

            <div className="animate-fade-in">
                <h1 className="text-3xl font-bold text-text-primary font-mukta mb-1">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-text-muted text-lg font-outfit">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}
