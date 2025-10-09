// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   darkMode: ["class"],
//   content: [
//     './pages/**/*.{ts,tsx}',
//     './components/**/*.{ts,tsx}',
//     './app/**/*.{ts,tsx}',
//     './src/**/*.{ts,tsx}',
//   ],
//   prefix: "",
//   theme: {
//     container: {
//       center: true,
//       padding: "2rem",
//       screens: {
//         "2xl": "1400px",
//       },
//     },
//     extend: {
//       colors: {
//         border: "hsl(var(--border))",
//         input: "hsl(var(--input))",
//         ring: "hsl(var(--ring))",
//         background: "hsl(var(--background))",
//         foreground: "hsl(var(--foreground))",
//         primary: {
//           DEFAULT: "hsl(var(--primary))",
//           foreground: "hsl(var(--primary-foreground))",
//         },
//         secondary: {
//           DEFAULT: "hsl(var(--secondary))",
//           foreground: "hsl(var(--secondary-foreground))",
//         },
//         destructive: {
//           DEFAULT: "hsl(var(--destructive))",
//           foreground: "hsl(var(--destructive-foreground))",
//         },
//         muted: {
//           DEFAULT: "hsl(var(--muted))",
//           foreground: "hsl(var(--muted-foreground))",
//         },
//         accent: {
//           DEFAULT: "hsl(var(--accent))",
//           foreground: "hsl(var(--accent-foreground))",
//         },
//         popover: {
//           DEFAULT: "hsl(var(--popover))",
//           foreground: "hsl(var(--popover-foreground))",
//         },
//         card: {
//           DEFAULT: "hsl(var(--card))",
//           foreground: "hsl(var(--card-foreground))",
//         },
//         // Restaurant-specific colors
//         restaurant: {
//           50: '#fef7ee',
//           100: '#fdedd6',
//           200: '#fad7ad',
//           300: '#f6b979',
//           400: '#f19443',
//           500: '#ed7a1e',
//           600: '#de5f14',
//           700: '#b84813',
//           800: '#933817',
//           900: '#762f16',
//         },
//         success: {
//           50: '#f0fdf4',
//           100: '#dcfce7',
//           200: '#bbf7d0',
//           300: '#86efac',
//           400: '#4ade80',
//           500: '#22c55e',
//           600: '#16a34a',
//           700: '#15803d',
//           800: '#166534',
//           900: '#14532d',
//         },
//         warning: {
//           50: '#fffbeb',
//           100: '#fef3c7',
//           200: '#fde68a',
//           300: '#fcd34d',
//           400: '#fbbf24',
//           500: '#f59e0b',
//           600: '#d97706',
//           700: '#b45309',
//           800: '#92400e',
//           900: '#78350f',
//         },
//       },
//       borderRadius: {
//         lg: "var(--radius)",
//         md: "calc(var(--radius) - 2px)",
//         sm: "calc(var(--radius) - 4px)",
//       },
//       keyframes: {
//         "accordion-down": {
//           from: { height: "0" },
//           to: { height: "var(--radix-accordion-content-height)" },
//         },
//         "accordion-up": {
//           from: { height: "var(--radix-accordion-content-height)" },
//           to: { height: "0" },
//         },
//         "fade-in": {
//           from: { opacity: "0" },
//           to: { opacity: "1" },
//         },
//         "fade-out": {
//           from: { opacity: "1" },
//           to: { opacity: "0" },
//         },
//         "slide-in-from-top": {
//           from: { transform: "translateY(-100%)" },
//           to: { transform: "translateY(0)" },
//         },
//         "slide-in-from-bottom": {
//           from: { transform: "translateY(100%)" },
//           to: { transform: "translateY(0)" },
//         },
//         "slide-in-from-left": {
//           from: { transform: "translateX(-100%)" },
//           to: { transform: "translateX(0)" },
//         },
//         "slide-in-from-right": {
//           from: { transform: "translateX(100%)" },
//           to: { transform: "translateX(0)" },
//         },
//         "bounce-in": {
//           "0%": { transform: "scale(0.3)", opacity: "0" },
//           "50%": { transform: "scale(1.05)" },
//           "70%": { transform: "scale(0.9)" },
//           "100%": { transform: "scale(1)", opacity: "1" },
//         },
//       },
//       animation: {
//         "accordion-down": "accordion-down 0.2s ease-out",
//         "accordion-up": "accordion-up 0.2s ease-out",
//         "fade-in": "fade-in 0.2s ease-out",
//         "fade-out": "fade-out 0.2s ease-out",
//         "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
//         "slide-in-from-bottom": "slide-in-from-bottom 0.3s ease-out",
//         "slide-in-from-left": "slide-in-from-left 0.3s ease-out",
//         "slide-in-from-right": "slide-in-from-right 0.3s ease-out",
//         "bounce-in": "bounce-in 0.6s ease-out",
//       },
//       fontFamily: {
//         sans: ['Inter', 'system-ui', 'sans-serif'],
//         serif: ['Merriweather', 'serif'],
//         mono: ['JetBrains Mono', 'monospace'],
//       },
//       spacing: {
//         '18': '4.5rem',
//         '88': '22rem',
//         '128': '32rem',
//       },
//       maxWidth: {
//         '8xl': '88rem',
//         '9xl': '96rem',
//       },
//       zIndex: {
//         '60': '60',
//         '70': '70',
//         '80': '80',
//         '90': '90',
//         '100': '100',
//       },
//     },
//   },
//   plugins: [require("tailwindcss-animate")],
// }
