import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { abhangService } from '../../services/abhangService';
import { FaUpload, FaFileExcel, FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

export default function BulkImport() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
    const [logs, setLogs] = useState([]);

    // Redirect if not admin
    if (!isAdmin) {
        navigate('/');
        return null;
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseFile(selectedFile);
        }
    };

    const parseFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                // Validate and format data
                const formattedData = jsonData.map((row, index) => ({
                    id: index, // temporary ID for preview
                    title: row['Title'] || row['title'] || row['शीर्षक'] || '',
                    author: row['Author'] || row['author'] || row['संत'] || '',
                    category: row['Category'] || row['category'] || row['श्रेणी'] || '',
                    lyrics: row['Lyrics'] || row['lyrics'] || row['अभंग'] || '',
                    isValid: (row['Title'] || row['title'] || row['शीर्षक']) && (row['Lyrics'] || row['lyrics'] || row['अभंग'])
                }));

                setPreviewData(formattedData);
                toast.success(`${formattedData.length} अभंग सापडले!`);
            } catch (error) {
                console.error("Error parsing file:", error);
                toast.error("फाइल वाचताना त्रुटी आली. कृपया योग्य Excel फाइल निवडा.");
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleImport = async () => {
        if (previewData.length === 0) return;

        setImporting(true);
        setProgress({ current: 0, total: previewData.length, success: 0, failed: 0 });
        setLogs([]);

        const validData = previewData.filter(item => item.isValid);
        const total = validData.length;
        let successCount = 0;
        let failedCount = 0;

        // Batch processing configuration
        const BATCH_SIZE = 50; // Process 50 records at a time
        const DELAY_MS = 1000; // 1 second delay between batches to be safe

        for (let i = 0; i < total; i += BATCH_SIZE) {
            const batch = validData.slice(i, i + BATCH_SIZE);

            // Process current batch
            await Promise.all(batch.map(async (item) => {
                try {
                    await abhangService.add({
                        title: item.title,
                        author: item.author,
                        category: item.category,
                        lyrics: item.lyrics,
                        status: 'published'
                    });
                    successCount++;
                } catch (error) {
                    console.error(`Failed to import ${item.title}:`, error);
                    failedCount++;
                    setLogs(prev => [...prev, `Error importing "${item.title}": ${error.message}`]);
                }
            }));

            // Update progress
            setProgress({
                current: Math.min(i + BATCH_SIZE, total),
                total: total,
                success: successCount,
                failed: failedCount
            });

            // Artificial delay to prevent server overload
            if (i + BATCH_SIZE < total) {
                await new Promise(resolve => setTimeout(resolve, DELAY_MS));
            }
        }

        setImporting(false);
        toast.success(`इम्पोर्ट पूर्ण झाले! यशस्वी: ${successCount}, अयशस्वी: ${failedCount}`);

        if (successCount > 0) {
            setTimeout(() => navigate('/admin'), 2000);
        }
    };

    const handleDownloadTemplate = () => {
        const templateData = [
            {
                'Title': 'उदा. अभंग १ (Title)',
                'Author': 'संत तुकाराम (Author)',
                'Category': 'भजन (Category)',
                'Lyrics': 'येथे अभंगाचे शब्द लिहा... (Lyrics)'
            },
            {
                'Title': 'उदा. अभंग २',
                'Author': 'संत ज्ञानेश्वर',
                'Category': 'गवळण',
                'Lyrics': 'दुसऱ्या अभंगाचे शब्द...'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Abhang_Import_Template.xlsx");
    };

    return (
        <div className="min-h-screen bg-background p-6 pb-24">
            <PageHeader
                title="Bulk Import"
                subtitle="Import abhangs from Excel"
                showBack={true}
            />

            <div className="max-w-4xl mx-auto -mt-4 space-y-6">
                {/* Header Actions */}
                <div className="flex justify-end">
                    <button
                        onClick={handleDownloadTemplate}
                        className="text-sm bg-white text-primary border border-primary/20 px-4 py-2 rounded-xl hover:bg-primary/5 transition-colors flex items-center gap-2 shadow-sm font-outfit font-bold"
                    >
                        <FaFileExcel /> Download Template
                    </button>
                </div>

                {/* File Upload Section */}
                <div className="bg-white rounded-3xl shadow-card p-8 border-2 border-dashed border-gray-200 text-center hover:border-primary/50 transition-all group">
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        disabled={importing}
                    />
                    <label htmlFor="file-upload" className={`cursor-pointer flex flex-col items-center ${importing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <FaFileExcel className="text-3xl text-green-600" />
                        </div>
                        <span className="text-lg font-bold text-text-primary mb-2 font-outfit">Select Excel File (.xlsx)</span>
                        <span className="text-sm text-text-muted">Click or drag file here to upload</span>
                    </label>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 rounded-2xl p-6 text-sm text-blue-800 border border-blue-100">
                    <h3 className="font-bold mb-2 flex items-center gap-2 font-outfit"><FaExclamationTriangle /> Important Instructions:</h3>
                    <p className="mb-2">The Excel file must contain the following columns:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 font-medium">
                        <li>Title (or 'शीर्षक')</li>
                        <li>Author (or 'संत')</li>
                        <li>Category (or 'श्रेणी')</li>
                        <li>Lyrics (or 'अभंग')</li>
                    </ul>
                </div>

                {/* Preview Section */}
                {previewData.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-card overflow-hidden border border-gray-50">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-text-primary font-outfit text-lg">Preview - {previewData.length} Abhangs</h3>
                            {!importing && (
                                <button
                                    onClick={handleImport}
                                    className="bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg shadow-primary/30 font-bold font-outfit"
                                >
                                    <FaUpload /> Start Import
                                </button>
                            )}
                        </div>

                        {importing && (
                            <div className="p-6 bg-primary/5 border-b border-primary/10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-primary flex items-center gap-2 font-outfit">
                                        <FaSpinner className="animate-spin" /> Importing...
                                    </span>
                                    <span className="text-sm font-bold text-primary">
                                        {Math.round((progress.current / progress.total) * 100)}%
                                    </span>
                                </div>
                                <div className="w-full bg-white rounded-full h-2.5 mb-3 overflow-hidden">
                                    <div
                                        className="bg-primary h-2.5 rounded-full transition-all duration-300"
                                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="flex gap-4 text-sm font-medium">
                                    <span className="text-green-600 flex items-center gap-1"><FaCheckCircle /> Success: {progress.success}</span>
                                    <span className="text-red-600 flex items-center gap-1"><FaExclamationTriangle /> Failed: {progress.failed}</span>
                                </div>
                            </div>
                        )}

                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-text-muted sticky top-0 z-10">
                                    <tr>
                                        <th className="p-4 font-bold font-outfit">Status</th>
                                        <th className="p-4 font-bold font-outfit">Title</th>
                                        <th className="p-4 font-bold font-outfit">Author</th>
                                        <th className="p-4 font-bold font-outfit">Category</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {previewData.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                {row.isValid ? (
                                                    <span className="text-green-500"><FaCheckCircle /></span>
                                                ) : (
                                                    <span className="text-red-500" title="Incomplete Data"><FaExclamationTriangle /></span>
                                                )}
                                            </td>
                                            <td className="p-4 font-bold text-text-primary font-mukta">{row.title || '-'}</td>
                                            <td className="p-4 text-text-secondary font-mukta">{row.author || '-'}</td>
                                            <td className="p-4 text-text-secondary font-mukta">{row.category || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Error Logs */}
                {logs.length > 0 && (
                    <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                        <h3 className="font-bold text-red-800 mb-3 font-outfit">Errors:</h3>
                        <ul className="list-disc list-inside text-sm text-red-700 space-y-1 font-mono">
                            {logs.map((log, index) => (
                                <li key={index}>{log}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
