import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { mockApi } from './mocks/api.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mockApi()],
})
