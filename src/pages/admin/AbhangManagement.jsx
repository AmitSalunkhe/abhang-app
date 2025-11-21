import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { abhangService } from '../../services/abhangService';
import { FaPlus, FaEdit, FaTrash, FaList, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import { ListSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ErrorBoundary from '../../components/ErrorBoundary';
import toast from 'react-hot-toast';

function AbhangManagementContent() {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [abhangs, setAbhangs] = useState([]);
    const [filteredAbhangs, setFilteredAbhangs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }
        fetchAbhangs();
    }, [isAdmin, navigate]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredAbhangs(abhangs);
        } else {
            const lowerTerm = searchTerm.toLowerCase();
            const filtered = abhangs.filter(abhang =>
                abhang.title?.toLowerCase().includes(lowerTerm) ||
                abhang.author?.toLowerCase().includes(lowerTerm) ||
                abhang.category?.toLowerCase().includes(lowerTerm)
            );
            setFilteredAbhangs(filtered);
        }
    }, [searchTerm, abhangs]);

    const fetchAbhangs = async () => {
        try {
            const data = await abhangService.getAll();
            setAbhangs(data);
            setFilteredAbhangs(data);
        } catch (error) {
            console.error('Error fetching abhangs:', error);
            toast.error('अभंग लोड करताना त्रुटी आली');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('हा अभंग कायमचा हटवायचा आहे का?')) {
            try {
                await abhangService.delete(id);
                toast.success('अभंग यशस्वीरित्या हटवला');
                fetchAbhangs();
            } catch (error) {
                console.error('Error deleting abhang:', error);
                toast.error('अभंग हटवताना त्रुटी आली');
            }
        }
    };

    if (loading) return <ListSkeleton count={5} />;

    return (
        <div className="min-h-screen bg-background p-6 pb-24">
            <PageHeader
                title="Abhang Management"
                subtitle="Manage your abhang collection"
                showBack={true}
            />

            <div className="max-w-4xl mx-auto -mt-4">
                {/* Actions Bar */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-8 animate-fade-in">
                    {/* Search */}
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search abhangs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border-none bg-white shadow-soft focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>

                    {/* Add Button */}
                    <Link
                        to="/admin/add"
                        className="bg-primary text-white px-6 py-3 rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 font-bold whitespace-nowrap font-outfit"
                    >
                        <FaPlus /> Add New
                    </Link>
                </div>

                {/* Abhangs List */}
                {filteredAbhangs.length === 0 ? (
                    <EmptyState
                        icon="📖"
                        title={searchTerm ? "No results found" : "No abhangs yet"}
                        description={searchTerm ? "Try a different search term" : "Add your first abhang to get started"}
                    />
                ) : (
                    <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        {filteredAbhangs.map((abhang, index) => (
                            <div
                                key={abhang.id}
                                className="bg-white rounded-2xl p-4 shadow-card border border-gray-50 hover:shadow-soft transition-all duration-300 stagger-item flex justify-between items-center"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm flex-shrink-0">
                                        <FaList />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-text-primary font-mukta line-clamp-1">{abhang.title}</h3>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-xs text-text-muted font-medium bg-gray-100 px-2 py-0.5 rounded-md font-outfit">
                                                {abhang.author}
                                            </span>
                                            <span className="text-xs text-text-muted font-medium bg-gray-100 px-2 py-0.5 rounded-md font-outfit">
                                                {abhang.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        to={`/admin/edit/${abhang.id}`}
                                        className="p-2 text-text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <FaEdit size={18} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(abhang.id)}
                                        className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <FaTrash size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AbhangManagement() {
    return (
        <ErrorBoundary>
            <AbhangManagementContent />
        </ErrorBoundary>
    );
}
