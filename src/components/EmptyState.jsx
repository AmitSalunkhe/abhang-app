import React from 'react';

export default function EmptyState({
    icon = '📭',
    title = 'काहीही सापडले नाही',
    description = 'कृपया पुन्हा प्रयत्न करा',
    action,
    actionLabel,
    gradient = 'from-orange-50 to-transparent'
}) {
    return (
        <div className={`text-center py-20 bg-gradient-to-br ${gradient} rounded-3xl shadow-sm border border-orange-100/50 animate-fade-in`}>
            <div className="text-7xl mb-6 animate-float">{icon}</div>
            <h3 className="text-gray-800 font-bold text-xl font-mukta mb-2">{title}</h3>
            <p className="text-gray-600 text-sm max-w-sm mx-auto mb-6">{description}</p>
            {action && actionLabel && (
                <button
                    onClick={action}
                    className="bg-gradient-to-r from-saffron to-orange-500 text-white font-medium py-3 px-8 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
