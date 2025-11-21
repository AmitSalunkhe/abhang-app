import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { abhangService } from '../../services/abhangService';
import { categoryService } from '../../services/categoryService';
import { santService } from '../../services/santService';
import { FaSave, FaPlus, FaTimes, FaLayerGroup, FaUser, FaHeading, FaAlignLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import ErrorBoundary from '../../components/ErrorBoundary';

import CustomSelect from '../../components/CustomSelect';

function AbhangFormContent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [sants, setSants] = useState([]);

    // Inline creation states
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAddingSant, setIsAddingSant] = useState(false);
    const [newSantName, setNewSantName] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        author: '', // This stores the Sant's name
        category: '' // This stores the Category's slug
    });

    useEffect(() => {
        const loadData = async () => {
            let loadedCats = [];

            // 1. Fetch Categories
            try {
                loadedCats = await categoryService.getAll();
                setCategories(loadedCats);

                // Set default category for new entry if not editing
                if (!id && loadedCats.length > 0) {
                    setFormData(prev => ({ ...prev, category: loadedCats[0].slug }));
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
                toast.error(`श्रेणी लोड करताना त्रुटी: ${error.message}`);
            }

            // 2. Fetch Sants
            try {
                const santList = await santService.getAll();
                setSants(santList);
            } catch (error) {
                console.error("Error fetching sants:", error);
                toast.error(`संत लोड करताना त्रुटी: ${error.message}`);
            }

            // 3. If editing, fetch Abhang data
            if (id) {
                try {
                    const abhang = await abhangService.getById(id);
                    setFormData({
                        title: abhang.title || '',
                        content: abhang.content || '',
                        author: abhang.author || '',
                        category: abhang.category || ''
                    });
                } catch (error) {
                    console.error("Error fetching abhang:", error);
                    toast.error(`अभंग लोड करताना त्रुटी: ${error.message}`);
                }
            }
        };

        loadData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            setLoading(true);
            await categoryService.add({ name: newCategoryName });
            const updatedCats = await categoryService.getAll();
            setCategories(updatedCats);

            // Auto-select the new category
            const newCat = updatedCats.find(c => c.name === newCategoryName);
            if (newCat) {
                setFormData(prev => ({ ...prev, category: newCat.slug }));
            }

            setNewCategoryName('');
            setIsAddingCategory(false);
            toast.success("नवीन श्रेणी जोडली");
        } catch (error) {
            console.error("Error adding category:", error);
            toast.error("श्रेणी जोडताना त्रुटी आली");
        } finally {
            setLoading(false);
        }
    };

    const handleAddSant = async () => {
        if (!newSantName.trim()) return;
        try {
            setLoading(true);
            await santService.add({ name: newSantName });
            const updatedSants = await santService.getAll();
            setSants(updatedSants);

            // Auto-select the new sant
            setFormData(prev => ({ ...prev, author: newSantName }));

            setNewSantName('');
            setIsAddingSant(false);
            toast.success("नवीन संत जोडले");
        } catch (error) {
            console.error("Error adding sant:", error);
            toast.error(`संत जोडताना त्रुटी आली: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await abhangService.update(id, formData);
                toast.success("अभंग यशस्वीरित्या अपडेट केला");
            } else {
                await abhangService.add(formData);
                toast.success("नवीन अभंग यशस्वीरित्या जोडला");
            }
            navigate('/admin');
        } catch (error) {
            console.error("Error saving abhang:", error);
            toast.error("अभंग जतन करताना त्रुटी आली");
        } finally {
            setLoading(false);
        }
    };

    // Prepare options for CustomSelect
    const categoryOptions = categories.map(cat => ({ value: cat.slug, label: cat.name }));
    const santOptions = sants.map(sant => ({ value: sant.name, label: sant.name }));

    return (
        <div className="min-h-screen bg-background p-6 pb-24">
            <PageHeader
                title={id ? 'Edit Abhang' : 'Add New Abhang'}
                subtitle="Fill in the details below"
                showBack={true}
            />

            <div className="max-w-4xl mx-auto -mt-4">
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-card p-6 md:p-8 space-y-8 animate-slide-up border border-gray-50">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Category Field */}
                        <div className="space-y-3">
                            {isAddingCategory ? (
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-text-primary font-outfit">
                                        <FaLayerGroup className="text-secondary" /> New Category
                                    </label>
                                    <div className="flex gap-2 animate-fade-in">
                                        <input
                                            type="text"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            placeholder="New Category Name"
                                            className="flex-1 p-3 border-none bg-gray-50 rounded-xl focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddCategory}
                                            className="bg-secondary text-white px-4 rounded-xl hover:bg-secondary/90 transition-colors shadow-md"
                                        >
                                            <FaSave />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingCategory(false)}
                                            className="bg-gray-100 text-text-secondary px-4 rounded-xl hover:bg-gray-200 transition-colors"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <CustomSelect
                                            label={
                                                <span className="flex items-center gap-2">
                                                    <FaLayerGroup className="text-secondary" /> Category
                                                </span>
                                            }
                                            name="category"
                                            value={formData.category}
                                            onChange={(e) => handleChange({ target: { name: 'category', value: e.target.value } })}
                                            options={categoryOptions}
                                            placeholder="Select Category"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingCategory(true)}
                                        className="bg-secondary/10 text-secondary px-4 py-3 rounded-xl hover:bg-secondary/20 transition-all flex items-center gap-2 text-sm font-bold whitespace-nowrap mb-[2px] h-[46px]"
                                        title="Add New Category"
                                    >
                                        <FaPlus /> <span className="hidden sm:inline">New</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Author (Sant) Field */}
                        <div className="space-y-3">
                            {isAddingSant ? (
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-text-primary font-outfit">
                                        <FaUser className="text-secondary" /> New Sant / Author
                                    </label>
                                    <div className="flex gap-2 animate-fade-in">
                                        <input
                                            type="text"
                                            value={newSantName}
                                            onChange={(e) => setNewSantName(e.target.value)}
                                            placeholder="New Sant Name"
                                            className="flex-1 p-3 border-none bg-gray-50 rounded-xl focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddSant}
                                            className="bg-secondary text-white px-4 rounded-xl hover:bg-secondary/90 transition-colors shadow-md"
                                        >
                                            <FaSave />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingSant(false)}
                                            className="bg-gray-100 text-text-secondary px-4 rounded-xl hover:bg-gray-200 transition-colors"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <CustomSelect
                                            label={
                                                <span className="flex items-center gap-2">
                                                    <FaUser className="text-secondary" /> Sant / Author
                                                </span>
                                            }
                                            name="author"
                                            value={formData.author}
                                            onChange={(e) => handleChange({ target: { name: 'author', value: e.target.value } })}
                                            options={santOptions}
                                            placeholder="Select Sant"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingSant(true)}
                                        className="bg-secondary/10 text-secondary px-4 py-3 rounded-xl hover:bg-secondary/20 transition-all flex items-center gap-2 text-sm font-bold whitespace-nowrap mb-[2px] h-[46px]"
                                        title="Add New Sant"
                                    >
                                        <FaPlus /> <span className="hidden sm:inline">New</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Title Field */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-bold text-text-primary font-outfit">
                            <FaHeading className="text-secondary" /> Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Abhang Title"
                            className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-secondary/20 outline-none transition-all font-mukta text-lg text-text-primary placeholder-text-muted"
                            required
                        />
                    </div>

                    {/* Content Field */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-bold text-text-primary font-outfit">
                            <FaAlignLeft className="text-secondary" /> Content (Abhang)
                        </label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            rows="12"
                            placeholder="Write abhang lyrics here..."
                            className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-secondary/20 outline-none transition-all font-mukta text-lg leading-relaxed resize-y text-text-primary placeholder-text-muted"
                            required
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex justify-center items-center gap-2 shadow-md shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed font-outfit"
                    >
                        {loading ? (
                            <span className="animate-pulse">Saving...</span>
                        ) : (
                            <><FaSave /> Save Abhang</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function AbhangForm() {
    return (
        <ErrorBoundary>
            <AbhangFormContent />
        </ErrorBoundary>
    );
}
