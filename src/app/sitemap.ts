import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/common/constants/seo.constants'
import { UI_ROUTES } from '@/common/constants'
import { catalogApi } from '@/common/services/catalog.api'

// Динамічний sitemap: статичні сторінки + усі активні товари й категорії з API.
// Помилка бекенда не валить білд — статичні маршрути віддаються завжди.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const now = new Date()

	// Усі активні товари (пагінація по 60 — MAX_LIMIT бекенда)
	const products: { slug: string }[] = []
	try {
		let page = 1
		let pages = 1
		do {
			const res = await catalogApi.products(`page=${page}&limit=60`)
			products.push(...res.items.map(i => ({ slug: i.slug })))
			pages = res.pages
			page++
		} while (page <= pages)
	} catch {
		// бекенд недоступний — лишаємо лише статичні маршрути
	}

	const categories = await catalogApi.categories().catch(() => [])

	const staticRoutes: MetadataRoute.Sitemap = [
		'',
		UI_ROUTES.SHOP,
		UI_ROUTES.PRICE_SHEET,
		UI_ROUTES.ABOUT,
		UI_ROUTES.CONTACTS
	].map(route => ({
		url: `${SITE_URL}${route}`,
		lastModified: now,
		changeFrequency: 'weekly',
		priority: route === '' ? 1 : 0.8
	}))

	const productRoutes: MetadataRoute.Sitemap = products.map(p => ({
		url: `${SITE_URL}${UI_ROUTES.PRODUCT(p.slug)}`,
		lastModified: now,
		changeFrequency: 'weekly',
		priority: 0.7
	}))

	const categoryRoutes: MetadataRoute.Sitemap = categories.map(c => ({
		url: `${SITE_URL}${UI_ROUTES.SHOP}?category=${c.slug}`,
		lastModified: now,
		changeFrequency: 'weekly',
		priority: 0.6
	}))

	return [...staticRoutes, ...productRoutes, ...categoryRoutes]
}
