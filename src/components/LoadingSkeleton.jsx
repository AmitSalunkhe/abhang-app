import React from 'react';

// Card Skeleton for grid layouts
export const CardSkeleton = ({ count = 6 }) => {
    return (
        <>
            {[...Array(count)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 animate-pulse">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};

// List Skeleton for abhang lists
export const ListSkeleton = ({ count = 5 }) => {
    return (
        <>
            {[...Array(count)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 animate-pulse mb-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="flex gap-2">
                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                        <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                    </div>
                </div>
            ))}
        </>
    );
};

// Detail Page Skeleton
export const DetailSkeleton = () => {
    return (
        <div className="animate-pulse">
            <div className="bg-gradient-to-br from-saffron to-gold pb-12 pt-8 px-6 rounded-b-[2.5rem] mb-6">
                <div className="h-8 bg-white/20 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-white/20 rounded w-1/2"></div>
            </div>
            <div className="px-6 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
        </div>
    );
};

export default { CardSkeleton, ListSkeleton, DetailSkeleton };
