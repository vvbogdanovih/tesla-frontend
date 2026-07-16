import type { MetadataRoute } from 'next'
import { SITE_DESCRIPTION, SITE_NAME } from '@/common/constants/seo.constants'

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: SITE_NAME,
		short_name: 'Tesla Lviv',
		description: SITE_DESCRIPTION,
		start_url: '/',
		display: 'standalone',
		background_color: '#0b0d10',
		theme_color: '#F59E0B',
		icons: [{ src: '/icon.png', sizes: '512x512', type: 'image/png' }]
	}
}
