import { API_BASE_URL, API_URLS } from '@/common/constants'
import type {
	CatalogResponse,
	Category,
	Car,
	ContentBlock,
	ProductDetail,
	SearchItem
} from '@/common/types'

// Серверний фетч (для SSR/ISR). Кидає на 5xx; 404 повертає null окремими методами.
async function getJson<T>(path: string, revalidate = 60): Promise<T> {
	const res = await fetch(`${API_BASE_URL}${path}`, { next: { revalidate } })
	if (!res.ok) throw new Error(`API ${res.status} ${path}`)
	return res.json() as Promise<T>
}

export const catalogApi = {
	products: (query: string) =>
		getJson<CatalogResponse>(`${API_URLS.CATALOG.PRODUCTS}${query ? `?${query}` : ''}`),

	async bySlug(slug: string): Promise<ProductDetail | null> {
		const res = await fetch(`${API_BASE_URL}${API_URLS.CATALOG.BY_SLUG(slug)}`, {
			next: { revalidate: 60 }
		})
		if (res.status === 404) return null
		if (!res.ok) throw new Error(`API ${res.status}`)
		return res.json()
	},

	search: (q: string) =>
		getJson<SearchItem[]>(`${API_URLS.CATALOG.SEARCH}?q=${encodeURIComponent(q)}`, 30),

	categories: () => getJson<Category[]>(API_URLS.CATEGORIES.BASE, 300),
	cars: () => getJson<Car[]>(API_URLS.CARS.BASE, 300),

	async contentBlock(key: string): Promise<ContentBlock | null> {
		const res = await fetch(`${API_BASE_URL}${API_URLS.CONTENT_BLOCKS.BY_KEY(key)}`, {
			next: { revalidate: 300 }
		})
		if (!res.ok) return null
		return res.json()
	}
}
