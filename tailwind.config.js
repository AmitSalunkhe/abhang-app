/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                saffron: '#FF9933',
                gold: '#D4AF37',
                paper: '#FDFBF7',
                'primary-dark': '#2D2D2D',
            },
            fontFamily: {
                mukta: ['Mukta', 'sans-serif'],
                tiro: ['Tiro Devanagari Marathi', 'serif'],
            },
        },
    },
    plugins: [],
}
