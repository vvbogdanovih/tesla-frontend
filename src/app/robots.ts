import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/common/constants/seo.constants'

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: '*',
			allow: '/',
			disallow: ['/cart', '/checkout', '/account', '/search', '/auth']
		},
		sitemap: `${SITE_URL}/sitemap.xml`
	}
}
