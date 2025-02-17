/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js}'],
    theme: {
        extend: {
            colors: {
                'app-primary': '#4050b5',
                'app-secondary': '#cfd3ed',
            },
        },
    },
    plugins: [],
};
