import type { Metadata } from 'next'
import { catalogApi } from '@/common/services/catalog.api'
import { CatalogFilters } from '@/common/components/catalog/CatalogFilters'
import { PriceSheet } from '@/common/components/catalog/PriceSheet'
import { UI_ROUTES } from '@/common/constants'

export const metadata: Metadata = {
	title: 'Прайс-лист запчастин Tesla',
	description:
		'Повний прайс-лист запчастин Tesla (Model 3 · Y · S · X) — таблиця з артикулами, сумісністю, цінами та наявністю. Фільтри за моделлю, типом і станом.'
}

// ті самі фільтри, що й у каталозі; стан — в URL
const FILTER_KEYS = ['q', 'category', 'car', 'type', 'condition', 'inStock', 'minPrice', 'maxPrice', 'sort']

const PAGE_SIZE = 50

export default async function PriceSheetPage({
	searchParams
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
	const sp = await searchParams

	// базові параметри запиту (без page) — спільні для SSR-першої сторінки та довантаження на клієнті
	const base = new URLSearchParams()
	for (const key of FILTER_KEYS) {
		const v = sp[key]
		if (typeof v === 'string' && v) base.set(key, v)
	}
	base.set('include', 'fitment') // потрібна колонка «Сумісність»
	if (!base.get('sort')) base.set('sort', 'stock') // за замовчуванням — спочатку в наявності
	base.set('limit', String(PAGE_SIZE))

	const baseQuery = base.toString()

	const [initial, categories, cars] = await Promise.all([
		catalogApi.products(`${baseQuery}&page=1`),
		catalogApi.categories(),
		catalogApi.cars()
	])

	return (
		<>
			<h1 className='font-display mb-1 text-3xl font-medium tracking-tight'>Прайс-лист</h1>
			<p className='text-muted-foreground mb-8 text-sm'>
				Усі запчастини таблицею — артикул, сумісність, ціна та наявність.{' '}
				<a href={UI_ROUTES.SHOP} className='text-accent-text underline-offset-2 hover:underline'>
					Перейти до каталогу карток
				</a>
			</p>

			<div className='grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]'>
				<CatalogFilters categories={categories} cars={cars} basePath={UI_ROUTES.PRICE_SHEET} />
				<PriceSheet key={baseQuery} initial={initial} baseQuery={baseQuery} />
			</div>
		</>
	)
}
