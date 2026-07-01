export type ProductType = 'original' | 'analog'
export type ProductCondition = 'new' | 'used' | 'clearance'

export interface CatalogImage {
	url: string
	alt: string | null
}

export interface CatalogProduct {
	id: string
	slug: string
	sku: string
	name: string
	price: string
	oldPrice: string | null
	onSale: boolean
	type: ProductType
	condition: ProductCondition
	stockQty: number
	category: { name: string; slug: string } | null
	images: CatalogImage[]
	// чи має товар «живі фото» — для плашки на картці (опційне; старіший API може не віддавати)
	hasLivePhotos?: boolean
	// перелік сумісних моделей — лише коли запит із include=fitment (прайс-лист)
	compatibility?: string[]
}

export interface CatalogResponse {
	items: CatalogProduct[]
	total: number
	page: number
	limit: number
	pages: number
}

export interface ProductCar {
	id: string
	model: string
	generation: string | null
	slug: string
}

export interface ProductDetail {
	id: string
	slug: string
	sku: string
	name: string
	price: string
	oldPrice: string | null
	onSale: boolean
	type: ProductType
	condition: ProductCondition
	stockQty: number
	attributes: Record<string, string>
	descriptionHtml: string | null
	seo?: { title?: string; description?: string }
	category: { name: string; slug: string } | null
	images: CatalogImage[]
	// «Живі фото» — реальні знімки екземпляра; окремий блок, лише за наявності.
	// Опційне: старіші відповіді API можуть не містити поля (тоді трактуємо як [])
	livePhotos?: CatalogImage[]
	cars: ProductCar[]
}

export interface SearchItem {
	id: string
	slug: string
	sku: string
	name: string
	price: string
	images: { url: string }[]
}

export interface Category {
	id: string
	slug: string
	name: string
	sortOrder: number
	_count?: { products: number }
}

export interface Car {
	id: string
	brand: string
	model: string
	generation: string | null
	slug: string
	imageUrl: string | null
}

export interface ContentBlock {
	key: string
	title: string
	bodyHtml: string | null
}
