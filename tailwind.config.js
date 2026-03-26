/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dashboard-specific colors for monitoring aesthetic
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Dark theme dashboard colors (Grafana/Datadog inspired)
        dark: {
          bg: '#0f172a',      // Deep slate background
          bgSecondary: '#1e293b', // Secondary background
          bgTertiary: '#334155',  // Tertiary background
          surface: '#1e293b',    // Card/surface background
          border: '#334155',      // Border color
          text: '#f1f5f9',        // Primary text
          textSecondary: '#94a3b8', // Secondary text
          textMuted: '#64748b',    // Muted text
          accent: '#3b82f6',      // Accent blue
          success: '#10b981',     // Success green
          warning: '#f59e0b',     // Warning amber
          error: '#ef4444',       // Error red
          info: '#06b6d4',        // Info cyan
        },
        // Light theme colors
        light: {
          bg: '#ffffff',          // White background
          bgSecondary: '#f8fafc', // Light gray secondary
          bgTertiary: '#f1f5f9',  // Light tertiary
          surface: '#ffffff',     // White surface
          border: '#e2e8f0',      // Light border
          text: '#1e293b',        // Dark text
          textSecondary: '#475569', // Secondary text
          textMuted: '#94a3b8',   // Muted text
          accent: '#3b82f6',      // Accent blue
          success: '#10b981',     // Success green
          warning: '#f59e0b',     // Warning amber
          error: '#ef4444',       // Error red
          info: '#06b6d4',        // Info cyan
        }
      },
      // Dashboard-specific gradients
      backgroundImage: {
        'dashboard-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'dashboard-dark': 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
        'success-gradient': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'warning-gradient': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'error-gradient': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'info-gradient': 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      },
      // Smooth transitions
      transitionProperty: {
        'width': 'width',
        'height': 'height',
        'spacing': 'margin, padding',
      },
      // Animation durations
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
      // Custom shadows for dashboard depth
      boxShadow: {
        'dashboard': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'dashboard-dark': '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-dark': '0 0 20px rgba(59, 130, 246, 0.5)',
      }
    },
  },
  plugins: [],
}
