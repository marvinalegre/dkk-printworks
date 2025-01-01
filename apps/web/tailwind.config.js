/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "backdrop-black": "#1c1c1d",
        "form-gray": "#e4e4e4",
      },
    },
  },
  plugins: [],
};
