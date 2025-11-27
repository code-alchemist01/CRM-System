import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'antd',
      '@ant-design/cssinjs',
      '@ant-design/icons',
      '@ant-design/icons-svg',
      'recharts',
      'es-toolkit',
      '@rc-component/pagination',
      '@rc-component/picker',
      '@rc-component/cascader',
    ],
    exclude: [],
  },
  server: {
    fs: {
      strict: false,
    },
  },
})
