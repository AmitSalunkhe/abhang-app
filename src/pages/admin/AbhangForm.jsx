import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { abhangService } from '../../services/abhangService';
import { categoryService } from '../../services/categoryService';
import { santService } from '../../services/santService';
import { FaArrowLeft, FaSave, FaPlus, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function AbhangForm() {
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
        author: '', // This will now store the Sant's name
        category: '' // This will store the Category's slug
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

    return (
        <div className="min-h-screen bg-paper p-4 pb-24">
            <header className="mb-6 flex items-center">
                <button onClick={() => navigate('/admin')} className="mr-4 text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <FaArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-gray-800 font-mukta">
                    {id ? 'अभंग संपादित करा' : 'नवीन अभंग जोडा'}
                </h1>
            </header>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                {/* Category Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-mukta">श्रेणी (Category)</label>
                    {isAddingCategory ? (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="नवीन श्रेणीचे नाव"
                                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-saffron focus:border-saffron"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={handleAddCategory}
                                className="bg-green-600 text-white px-4 rounded-lg hover:bg-green-700"
                            >
                                <FaSave />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAddingCategory(false)}
                                className="bg-gray-500 text-white px-4 rounded-lg hover:bg-gray-600"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2 items-center">
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-saffron focus:border-saffron bg-white min-w-0"
                                required
                            >
                                <option value="">श्रेणी निवडा</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => setIsAddingCategory(true)}
                                className="bg-saffron text-white px-3 py-3 rounded-lg hover:bg-orange-600 whitespace-nowrap flex items-center gap-1 text-sm font-medium shadow-sm"
                            >
                                <FaPlus /> <span className="hidden sm:inline">नवीन</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Author (Sant) Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-mukta">संत / लेखक (Author)</label>
                    {isAddingSant ? (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSantName}
                                onChange={(e) => setNewSantName(e.target.value)}
                                placeholder="नवीन संतांचे नाव"
                                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-saffron focus:border-saffron"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={handleAddSant}
                                className="bg-green-600 text-white px-4 rounded-lg hover:bg-green-700"
                            >
                                <FaSave />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAddingSant(false)}
                                className="bg-gray-500 text-white px-4 rounded-lg hover:bg-gray-600"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2 items-center">
                            <select
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-saffron focus:border-saffron bg-white min-w-0"
                                required
                            >
                                <option value="">संत निवडा</option>
                                {sants.map(sant => (
                                    <option key={sant.id} value={sant.name}>{sant.name}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => setIsAddingSant(true)}
                                className="bg-saffron text-white px-3 py-3 rounded-lg hover:bg-orange-600 whitespace-nowrap flex items-center gap-1 text-sm font-medium shadow-sm"
                            >
                                <FaPlus /> <span className="hidden sm:inline">नवीन</span>
                            </button>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-mukta">शीर्षक (Title)</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-saffron focus:border-saffron"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-mukta">अभंग (Content)</label>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        rows="10"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-saffron focus:border-saffron font-mukta"
                        required
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-saffron text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition duration-200 flex justify-center items-center gap-2 shadow-md"
                >
                    {loading ? 'जतन करत आहे...' : <><FaSave /> जतन करा</>}
                </button>
            </form>
        </div>
    );
}
