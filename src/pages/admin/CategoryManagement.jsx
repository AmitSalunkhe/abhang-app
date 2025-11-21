import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaLayerGroup } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import { ListSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ErrorBoundary from '../../components/ErrorBoundary';
import toast from 'react-hot-toast';

function CategoryManagementContent() {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({ name: '' });

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }
        fetchCategories();
    }, [isAdmin, navigate]);

    const fetchCategories = async () => {
        try {
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('श्रेणी लोड करताना त्रुटी आली');
        } finally {
            setLoading(false);
        }
    };

    // Generate slug from name
    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\u0900-\u097Fa-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const slug = generateSlug(formData.name);
            await categoryService.add({ name: formData.name, slug });
            setFormData({ name: '' });
            setShowAddForm(false);
            fetchCategories();
            toast.success('नवीन श्रेणी यशस्वीरित्या जोडली');
        } catch (error) {
            toast.error('श्रेणी जोडताना त्रुटी आली');
        }
    };

    const handleEdit = (category) => {
        setEditingId(category.id);
        setFormData({ name: category.name });
    };

    const handleUpdate = async (id) => {
        try {
            const slug = generateSlug(formData.name);
            await categoryService.update(id, { name: formData.name, slug });
            setEditingId(null);
            setFormData({ name: '' });
            fetchCategories();
            toast.success('श्रेणी यशस्वीरित्या अपडेट केली');
        } catch (error) {
            toast.error('श्रेणी अपडेट करताना त्रुटी आली');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('या श्रेणी हटवायची आहे का?')) {
            try {
                await categoryService.delete(id);
                fetchCategories();
                toast.success('श्रेणी यशस्वीरित्या हटवली');
            } catch (error) {
                toast.error('श्रेणी हटवताना त्रुटी आली');
            }
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setShowAddForm(false);
        setFormData({ name: '' });
    };

    if (loading) return <ListSkeleton count={5} />;

    return (
        <div className="min-h-screen bg-background p-6 pb-24">
            <PageHeader
                title="Category Management"
                subtitle="Manage categories"
                showBack={true}
            />

            <div className="max-w-4xl mx-auto -mt-4">
                {/* Add Button */}
                {!showAddForm && (
                    <div className="mb-8 flex justify-end animate-fade-in">
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="bg-secondary text-white px-6 py-3 rounded-xl shadow-lg shadow-secondary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 font-bold font-outfit"
                        >
                            <FaPlus /> Add New
                        </button>
                    </div>
                )}

                {/* Add Form */}
                {showAddForm && (
                    <form onSubmit={handleAdd} className="bg-white rounded-2xl p-6 shadow-card border border-gray-50 mb-8 animate-scale-in">
                        <h3 className="font-bold text-lg text-text-primary mb-4 flex items-center gap-2 font-outfit">
                            <FaLayerGroup className="text-secondary" /> Add New Category
                        </h3>
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="Category Name (e.g. Sant Tukaram)"
                                value={formData.name}
                                onChange={(e) => setFormData({ name: e.target.value })}
                                className="flex-1 p-3 border-none bg-gray-50 rounded-xl focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                                required
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button type="submit" className="bg-secondary text-white px-6 py-3 rounded-xl hover:bg-secondary/90 transition-colors shadow-md flex items-center gap-2 font-bold whitespace-nowrap font-outfit">
                                    <FaSave /> Save
                                </button>
                                <button type="button" onClick={handleCancel} className="bg-gray-100 text-text-secondary px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 font-bold whitespace-nowrap font-outfit">
                                    <FaTimes /> Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/* Categories List */}
                {categories.length === 0 ? (
                    <EmptyState
                        icon="📂"
                        title="No categories found"
                        description="Add a new category to get started"
                    />
                ) : (
                    <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        {categories.map((category, index) => (
                            <div
                                key={category.id}
                                className="bg-white rounded-2xl p-4 shadow-card border border-gray-50 hover:shadow-soft transition-all duration-300 stagger-item"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                {editingId === category.id ? (
                                    <div className="flex flex-col md:flex-row gap-4 items-center">
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ name: e.target.value })}
                                            className="flex-1 w-full p-3 border-none bg-gray-50 rounded-xl focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                                            autoFocus
                                        />
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <button
                                                onClick={() => handleUpdate(category.id)}
                                                className="flex-1 md:flex-none bg-secondary text-white px-4 py-2 rounded-xl hover:bg-secondary/90 transition-colors shadow-sm flex items-center justify-center gap-2 font-bold font-outfit"
                                            >
                                                <FaSave /> Save
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="flex-1 md:flex-none bg-gray-100 text-text-secondary px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-bold font-outfit"
                                            >
                                                <FaTimes /> Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shadow-sm">
                                                <FaLayerGroup />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-text-primary font-mukta">{category.name}</h3>
                                                <p className="text-xs text-text-muted font-mono bg-gray-100 px-2 py-0.5 rounded-md inline-block mt-1">
                                                    {category.slug}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="p-2 text-text-muted hover:text-secondary hover:bg-secondary/5 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <FaEdit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id)}
                                                className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <FaTrash size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CategoryManagement() {
    return (
        <ErrorBoundary>
            <CategoryManagementContent />
        </ErrorBoundary>
    );
}
