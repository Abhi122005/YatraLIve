import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/buses': 'http://localhost:8000',
      '/arrival_board': 'http://localhost:8000',
      '/delay_alerts': 'http://localhost:8000',
      '/recent_departures': 'http://localhost:8000',
      '/depot': 'http://localhost:8000',
      '/simulate': 'http://localhost:8000',
      '/auth': 'http://localhost:8000',
    }
  }
})
