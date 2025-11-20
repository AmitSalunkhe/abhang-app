import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export default function CategoryManagement() {
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
        } finally {
            setLoading(false);
        }
    };

    // Generate slug from name
    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\u0900-\u097Fa-z0-9\s-]/g, '') // Keep Devanagari, letters, numbers, spaces, hyphens
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const slug = generateSlug(formData.name);
            await categoryService.add({ name: formData.name, slug });
            setFormData({ name: '' });
            setShowAddForm(false);
            fetchCategories();
        } catch (error) {
            alert('Error adding category');
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
        } catch (error) {
            alert('Error updating category');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('या श्रेणी हटवायची आहे का?')) {
            try {
                await categoryService.delete(id);
                fetchCategories();
            } catch (error) {
                alert('Error deleting category');
            }
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setShowAddForm(false);
        setFormData({ name: '' });
    };

    return (
        <div className="min-h-screen bg-paper p-4 pb-24">
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button onClick={() => navigate('/admin')} className="mr-4 text-gray-600">
                        <FaArrowLeft />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800 font-mukta">श्रेणी व्यवस्थापन</h1>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-saffron text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600"
                >
                    <FaPlus /> नवीन श्रेणी
                </button>
            </header>

            {showAddForm && (
                <form onSubmit={handleAdd} className="bg-white p-4 rounded-lg shadow-sm mb-4">
                    <h3 className="font-bold mb-3">नवीन श्रेणी जोडा</h3>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="श्रेणी नाव (उदा. संत तुकाराम)"
                            value={formData.name}
                            onChange={(e) => setFormData({ name: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-saffron"
                            required
                        />
                        <div className="flex gap-2">
                            <button type="submit" className="bg-saffron text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                <FaSave /> जतन करा
                            </button>
                            <button type="button" onClick={handleCancel} className="bg-gray-300 px-4 py-2 rounded-lg flex items-center gap-2">
                                <FaTimes /> रद्द करा
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saffron"></div>
                </div>
            ) : (
                <div className="space-y-3">
                    {categories.map((category) => (
                        <div key={category.id} className="bg-white p-4 rounded-lg shadow-sm">
                            {editingId === category.id ? (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-saffron"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdate(category.id)}
                                            className="bg-saffron text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                        >
                                            <FaSave /> जतन करा
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="bg-gray-300 px-4 py-2 rounded-lg flex items-center gap-2"
                                        >
                                            <FaTimes /> रद्द करा
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg">{category.name}</h3>
                                        <p className="text-sm text-gray-500">Slug: {category.slug}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(category)}
                                            className="text-blue-600 hover:text-blue-800 p-2"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.id)}
                                            className="text-red-600 hover:text-red-800 p-2"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
