export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        clinic: {
          ink: '#10201b',
          mist: '#edf7f3',
          green: '#0f8a63',
          teal: '#167c80',
          amber: '#d97706',
          red: '#c24132'
        }
      },
      boxShadow: {
        panel: '0 14px 45px rgba(16, 32, 27, 0.08)'
      }
    }
  },
  plugins: []
};
