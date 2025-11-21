/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#FF9933', // Refined Saffron
                secondary: '#3B82F6', // Blue
                background: '#FAFAFA', // Off-white
                surface: '#FFFFFF', // Pure white
                text: {
                    primary: '#111827', // Black
                    secondary: '#374151', // Dark Gray
                    muted: '#6B7280', // Gray
                },
                saffron: '#FF9933', // Keep for backward compatibility if needed
            },
            fontFamily: {
                mukta: ['Mukta', 'sans-serif'],
                outfit: ['Outfit', 'sans-serif'],
                tiro: ['Tiro Devanagari Marathi', 'serif'],
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'card': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
                'floating': '0 8px 30px rgba(0,0,0,0.08)',
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            }
        },
    },
    plugins: [],
}
