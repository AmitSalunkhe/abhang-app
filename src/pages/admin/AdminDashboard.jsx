import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaPlus, FaList, FaUsers, FaLayerGroup, FaPray, FaUpload, FaChartLine } from 'react-icons/fa';
import PageHeader from '../../components/PageHeader';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import ErrorBoundary from '../../components/ErrorBoundary';

function AdminDashboardContent() {
    const [abhangCount, setAbhangCount] = useState(0);
    const [categoryCount, setCategoryCount] = useState(0);
    const [santCount, setSantCount] = useState(0);
    const [userCount, setUserCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Realtime listener for abhangs count
        const unsubAbhangs = onSnapshot(collection(db, 'abhangs'), (snapshot) => {
            setAbhangCount(snapshot.size);
            setLoading(false);
        });

        // Realtime listener for categories count
        const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
            setCategoryCount(snapshot.size);
        });

        // Realtime listener for sants count
        const unsubSants = onSnapshot(collection(db, 'sants'), (snapshot) => {
            setSantCount(snapshot.size);
        });

        // Realtime listener for users count
        const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            setUserCount(snapshot.size);
        });

        return () => {
            unsubAbhangs();
            unsubCategories();
            unsubSants();
            unsubUsers();
        };
    }, []);

    const stats = [
        { label: 'एकूण अभंग', count: abhangCount, gradient: 'from-blue-500 to-cyan-500', icon: FaList },
        { label: 'श्रेणी', count: categoryCount, gradient: 'from-green-500 to-emerald-500', icon: FaLayerGroup },
        { label: 'संत', count: santCount, gradient: 'from-purple-500 to-pink-500', icon: FaPray },
        { label: 'वापरकर्ते', count: userCount, gradient: 'from-orange-500 to-red-500', icon: FaUsers },
    ];

    const actions = [
        {
            title: 'नवीन अभंग जोडा',
            description: 'नवीन अभंग तयार करा',
            icon: FaPlus,
            link: '/admin/add',
            gradient: 'from-saffron to-orange-500'
        },
        {
            title: 'अभंग व्यवस्थापित करा',
            description: 'अभंग संपादित करा किंवा हटवा',
            icon: FaList,
            link: '/admin/abhangs',
            gradient: 'from-blue-500 to-blue-600'
        },
        {
            title: 'श्रेणी व्यवस्थापित करा',
            description: 'श्रेणी जोडा, संपादित करा किंवा हटवा',
            icon: FaLayerGroup,
            link: '/admin/categories',
            gradient: 'from-green-500 to-green-600'
        },
        {
            title: 'संत व्यवस्थापित करा',
            description: 'संत जोडा, संपादित करा किंवा हटवा',
            icon: FaPray,
            link: '/admin/sants',
            gradient: 'from-purple-500 to-purple-600'
        },
        {
            title: 'वापरकर्ते व्यवस्थापित करा',
            description: 'वापरकर्ता भूमिका व्यवस्थापित करा',
            icon: FaUsers,
            link: '/admin/users',
            gradient: 'from-pink-500 to-rose-600'
        },
        {
            title: 'बल्क इम्पोर्ट',
            description: 'Excel/JSON फाईलमधून अभंग इम्पोर्ट करा',
            icon: FaUpload,
            link: '/admin/bulk-import',
            gradient: 'from-indigo-500 to-violet-600'
        }
    ];

    return (
        <div className="p-6 pb-24 min-h-screen bg-background">
            <PageHeader
                title="Admin Dashboard"
                subtitle="Manage content and users"
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {loading ? (
                    <CardSkeleton count={4} />
                ) : (
                    stats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl p-5 shadow-card border border-gray-50 hover:shadow-soft transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${index === 0 ? 'bg-blue-50 text-blue-600' :
                                    index === 1 ? 'bg-green-50 text-green-600' :
                                        index === 2 ? 'bg-purple-50 text-purple-600' :
                                            'bg-orange-50 text-orange-600'
                                    }`}>
                                    <stat.icon className="text-xl" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-text-primary mb-1 font-outfit">{stat.count}</div>
                            <div className="text-sm font-medium text-text-muted">{stat.label}</div>
                        </div>
                    ))
                )}
            </div>

            {/* Actions Grid */}
            <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-6 font-outfit">
                Quick Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {actions.map((action, index) => (
                    <Link
                        key={index}
                        to={action.link}
                        className="group block"
                    >
                        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-50 hover:shadow-soft hover:-translate-y-1 hover:border-primary/20 transition-all duration-300 h-full">
                            <div className="flex items-start gap-5">
                                {/* Icon */}
                                <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300">
                                    <action.icon className="text-text-secondary text-xl group-hover:text-primary transition-colors" />
                                </div>

                                <div>
                                    {/* Title */}
                                    <h3 className="font-bold text-lg text-text-primary font-mukta mb-1 group-hover:text-primary transition-colors">
                                        {action.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-text-muted leading-relaxed">
                                        {action.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    return (
        <ErrorBoundary>
            <AdminDashboardContent />
        </ErrorBoundary>
    );
}
