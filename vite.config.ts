import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    // The tested code is pure game logic, so no browser environment is needed.
    environment: 'node',
  },
})
