import React, { useState, useEffect } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { transliterationService } from '../services/transliterationService';

export default function GlobalSearch({ onSearch, placeholder = "शोधा... (Search...)" }) {
    const [query, setQuery] = useState('');

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            // Get transliterated text
            const marathiQuery = transliterationService.transliterate(query);

            // Pass both original and transliterated query to parent
            onSearch(query, marathiQuery);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query, onSearch]);

    return (
        <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-saffron text-lg" />
            </div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="block w-full pl-12 pr-12 py-4 border-none rounded-full leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-saffron/50 sm:text-base transition duration-200 ease-in-out shadow-md hover:shadow-lg"
                placeholder={placeholder}
            />
            {query && (
                <button
                    onClick={() => setQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                    <FaTimes />
                </button>
            )}
        </div>
    );
}
