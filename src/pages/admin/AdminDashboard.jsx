import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { abhangService } from '../../services/abhangService';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaUserShield, FaLayerGroup, FaPenNib } from 'react-icons/fa';
import GlobalSearch from '../../components/GlobalSearch';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const { isAdmin, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [abhangs, setAbhangs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState({ original: '', marathi: '' });

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            navigate('/');
            return;
        }
        if (isAdmin) {
            const q = query(collection(db, 'abhangs'), orderBy('createdAt', 'desc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const abhangsList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAbhangs(abhangsList);
                setLoading(false);
            }, (error) => {
                console.error("Failed to fetch abhangs", error);
                toast.error("अभंग लोड करण्यास त्रुटी आली");
                setLoading(false);
            });

            return () => unsubscribe();
        }
    }, [isAdmin, authLoading, navigate]);

    const handleDelete = async (id) => {
        if (window.confirm('तुम्हाला नक्की हा अभंग काढून टाकायचा आहे का?')) {
            try {
                await abhangService.delete(id);
                toast.success("अभंग यशस्वीरित्या हटवला");
            } catch (error) {
                toast.error("अभंग हटवताना त्रुटी आली");
            }
        }
    };

    const handleSearch = (original, marathi) => {
        setSearchQuery({ original: original.toLowerCase(), marathi: marathi.toLowerCase() });
    };

    const filteredAbhangs = abhangs.filter(abhang => {
        const { original, marathi } = searchQuery;
        if (!original) return true;

        const title = abhang.title?.toLowerCase() || '';
        const author = abhang.author?.toLowerCase() || '';
        const category = abhang.category?.toLowerCase() || '';

        return (
            title.includes(original) || title.includes(marathi) ||
            author.includes(original) || author.includes(marathi) ||
            category.includes(original) || category.includes(marathi)
        );
    });

    if (authLoading || loading) return <div className="p-4 text-center">लोड होत आहे...</div>;

    return (
        <div className="min-h-screen bg-paper p-4 pb-24">
            <header className="mb-6">
                <div className="flex items-center mb-4">
                    <button onClick={() => navigate('/profile')} className="mr-4 text-gray-600">
                        <FaArrowLeft />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800 font-mukta">प्रशासक डॅशबोर्ड</h1>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                        onClick={() => navigate('/admin/add')}
                        className="bg-saffron text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-orange-600 shadow-sm"
                    >
                        <FaPlus /> नवीन अभंग
                    </button>
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 shadow-sm"
                    >
                        <FaUserShield /> वापरकर्ते
                    </button>
                    <button
                        onClick={() => navigate('/admin/categories')}
                        className="bg-green-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 shadow-sm"
                    >
                        <FaLayerGroup /> श्रेणी व्यवस्थापन
                    </button>
                    <button
                        onClick={() => navigate('/admin/sants')}
                        className="bg-purple-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-700 shadow-sm"
                    >
                        <FaPenNib /> संत व्यवस्थापन
                    </button>
                </div>

                <div className="mt-4">
                    <GlobalSearch
                        onSearch={handleSearch}
                        placeholder="अभंग शोधा... (Search Abhangs...)"
                    />
                </div>
            </header>

            <div className="space-y-4">
                {filteredAbhangs.length === 0 ? (
                    <div className="text-center text-gray-500 py-8 bg-white rounded-lg shadow">
                        कोणतेही अभंग सापडले नाहीत
                    </div>
                ) : (
                    filteredAbhangs.map((abhang) => (
                        <div key={abhang.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
                            <div className="flex-1 min-w-0 mr-4">
                                <h3 className="text-lg font-bold text-gray-900 truncate font-mukta">{abhang.title}</h3>
                                <p className="text-sm text-gray-500 truncate">{abhang.author} • {abhang.category}</p>
                            </div>
                            <div className="flex gap-3 shrink-0">
                                <button
                                    onClick={() => navigate(`/admin/edit/${abhang.id}`)}
                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                    title="संपादित करा"
                                >
                                    <FaEdit size={20} />
                                </button>
                                <button
                                    onClick={() => handleDelete(abhang.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    title="हटवा"
                                >
                                    <FaTrash size={20} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
