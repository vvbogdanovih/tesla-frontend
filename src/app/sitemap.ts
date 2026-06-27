import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/common/constants/seo.constants'

// Базовий sitemap зі статичних сторінок. Динамічні (категорії, товари, блог)
// додаються пізніше з даних API.
export default function sitemap(): MetadataRoute.Sitemap {
	const routes = ['', '/shop', '/about', '/contacts', '/delivery', '/returns', '/blog']
	return routes.map(route => ({
		url: `${SITE_URL}${route}`,
		lastModified: new Date(),
		changeFrequency: 'weekly',
		priority: route === '' ? 1 : 0.7
	}))
}
