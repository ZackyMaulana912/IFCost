import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F8F9FA',
        surface: '#FFFFFF',
        'surface-2': '#F1F3F5',
        green: '#22C55E',
        yellow: '#F59E0B',
        red: '#EF4444',
        blue: '#3B82F6',
        'blue-dark': '#1D4ED8',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        border: '#E5E7EB',
        'badge-green': '#DCFCE7',
        'badge-yellow': '#FEF9C3',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
        badge: '6px',
        icon: '10px',
      },
      fontSize: {
        'app-name': ['18px', { fontWeight: '700' }],
        'tab': ['14px', { fontWeight: '500' }],
        'page-title': ['26px', { fontWeight: '700' }],
        'section-heading': ['16px', { fontWeight: '600' }],
        'table-header': ['13px', { fontWeight: '500' }],
        'table-body': ['14px', { fontWeight: '400' }],
        'metric-value': ['32px', { fontWeight: '700' }],
        'caption': ['12px', { fontWeight: '400' }],
        'mono-id': ['12px', { fontWeight: '400' }],
      },
    },
  },
  plugins: [],
}

export default config
