import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// Юніт-тести: логіка store/схем/утиліт (F6). React Compiler тут не застосовується —
// для чистої логіки це неважливо.
export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'jsdom',
		setupFiles: './vitest.setup.ts',
		include: ['src/**/*.test.{ts,tsx}']
	},
	resolve: {
		alias: { '@': path.resolve(import.meta.dirname, 'src') }
	}
})
