import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { santService } from '../../services/santService';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function SantManagement() {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [sants, setSants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({ name: '' });

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }
        fetchSants();
    }, [isAdmin, navigate]);

    const fetchSants = async () => {
        try {
            const data = await santService.getAll();
            setSants(data);
        } catch (error) {
            console.error('Error fetching sants:', error);
            toast.error('संत लोड करताना त्रुटी आली');
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
        if (!formData.name.trim()) return;

        try {
            const slug = generateSlug(formData.name);
            await santService.add({ name: formData.name, slug });
            setFormData({ name: '' });
            setShowAddForm(false);
            fetchSants();
            toast.success('नवीन संत यशस्वीरित्या जोडले');
        } catch (error) {
            console.error('Error adding sant:', error);
            toast.error(`संत जोडताना त्रुटी: ${error.message}`);
        }
    };

    const handleEdit = (sant) => {
        setEditingId(sant.id);
        setFormData({ name: sant.name });
    };

    const handleUpdate = async (id) => {
        if (!formData.name.trim()) return;

        try {
            const slug = generateSlug(formData.name);
            await santService.update(id, { name: formData.name, slug });
            setEditingId(null);
            setFormData({ name: '' });
            fetchSants();
            toast.success('संत माहिती अपडेट केली');
        } catch (error) {
            console.error('Error updating sant:', error);
            toast.error('अपडेट करताना त्रुटी आली');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('हे संत/लेखक हटवायचे आहेत का?')) {
            try {
                await santService.delete(id);
                fetchSants();
                toast.success('संत यशस्वीरित्या हटवले');
            } catch (error) {
                console.error('Error deleting sant:', error);
                toast.error('हटवताना त्रुटी आली');
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
                    <button onClick={() => navigate('/admin')} className="mr-4 text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                        <FaArrowLeft />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800 font-mukta">संत / लेखक व्यवस्थापन</h1>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-saffron text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 shadow-sm transition-colors"
                >
                    <FaPlus /> नवीन जोडा
                </button>
            </header>

            {showAddForm && (
                <form onSubmit={handleAdd} className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-100">
                    <h3 className="font-bold mb-3 text-gray-800">नवीन संत / लेखक जोडा</h3>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="नाव (उदा. संत तुकाराम)"
                            value={formData.name}
                            onChange={(e) => setFormData({ name: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                            required
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button type="submit" className="bg-saffron text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600">
                                <FaSave /> जतन करा
                            </button>
                            <button type="button" onClick={handleCancel} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200">
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
                    {sants.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            अद्याप कोणतेही संत जोडलेले नाहीत.
                        </div>
                    )}
                    {sants.map((sant) => (
                        <div key={sant.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            {editingId === sant.id ? (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdate(sant.id)}
                                            className="bg-saffron text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600"
                                        >
                                            <FaSave /> जतन करा
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200"
                                        >
                                            <FaTimes /> रद्द करा
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">{sant.name}</h3>
                                        <p className="text-xs text-gray-400">Slug: {sant.slug}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(sant)}
                                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors"
                                            title="संपादित करा"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sant.id)}
                                            className="text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                                            title="हटवा"
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
