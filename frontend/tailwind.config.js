/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            keyframes: {
                enter: {
                    '0%': { opacity: 0, transform: 'translateY(-100%)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
                leave: {
                    '0%': { opacity: 1, transform: 'translateY(0)' },
                    '100%': { opacity: 0, transform: 'translateY(-100%)' },
                },
            },
            animation: {
                enter: 'enter 0.5s forwards',
                leave: 'leave 0.5s forwards',
            },
        },
    },
    plugins: [],
};
