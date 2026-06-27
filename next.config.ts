import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	output: 'standalone',
	reactCompiler: true,
	images: {
		// Віддаємо S3-зображення як є (без ре-оптимізації на сервері), щоб не
		// навантажувати VPS. Hostname онови під реальний бакет.
		unoptimized: true,
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '*.amazonaws.com'
			}
		]
	},
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'Strict-Transport-Security',
						value: 'max-age=63072000; includeSubDomains; preload'
					},
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					{ key: 'X-Frame-Options', value: 'DENY' },
					{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
					{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
					{
						key: 'Permissions-Policy',
						value: 'camera=(), microphone=(), geolocation=()'
					}
				]
			}
		]
	}
}

export default nextConfig
