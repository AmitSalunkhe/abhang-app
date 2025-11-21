import React, { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaCheck } from 'react-icons/fa';

const CustomSelect = ({
    label,
    value,
    onChange,
    options,
    placeholder = "Select an option",
    disabled = false,
    error = null,
    required = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (option) => {
        onChange({ target: { name: label.toLowerCase(), value: option.value } }); // Mimic event object for compatibility
        setIsOpen(false);
        setSearchTerm('');
    };

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative" ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-bold text-text-primary font-outfit mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div
                className={`
                    w-full p-3 bg-gray-50 rounded-xl border transition-all cursor-pointer flex items-center justify-between
                    ${error ? 'border-red-500' : 'border-transparent hover:border-secondary/30'}
                    ${isOpen ? 'ring-2 ring-secondary/20 border-secondary/30' : ''}
                    ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
                `}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className={`${!selectedOption ? 'text-text-muted' : 'text-text-primary'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <FaChevronDown className={`text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={12} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up origin-top">
                    <div className="p-2 border-b border-gray-50">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full p-2 bg-gray-50 rounded-lg text-sm outline-none focus:ring-1 focus:ring-secondary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`
                                        px-4 py-3 text-sm cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors
                                        ${value === option.value ? 'bg-secondary/5 text-secondary font-medium' : 'text-text-primary'}
                                    `}
                                    onClick={() => handleSelect(option)}
                                >
                                    <span>{option.label}</span>
                                    {value === option.value && <FaCheck size={12} />}
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-text-muted text-sm">
                                No options found
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

            {/* Hidden input for HTML5 form validation */}
            <input
                type="text"
                name={label ? label.toLowerCase() : ''}
                value={value}
                required={required}
                className="opacity-0 absolute h-0 w-0 pointer-events-none"
                tabIndex={-1}
                onChange={() => { }} // Suppress React warning
            />
        </div>
    );
};

export default CustomSelect;
