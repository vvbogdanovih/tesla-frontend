import type { Metadata } from 'next'
import { catalogApi } from '@/common/services/catalog.api'
import { ProductCard } from '@/common/components/catalog/ProductCard'
import { CatalogFilters } from '@/common/components/catalog/CatalogFilters'
import { SortSelect } from '@/common/components/catalog/SortSelect'
import { Pagination } from '@/common/components/catalog/Pagination'
import { SITE_URL } from '@/common/constants/seo.constants'
import { UI_ROUTES } from '@/common/constants'

// Динамічні meta + canonical (ADR/seo-strategy):
//  • базова /shop та /shop?category= → index, self-canonical на чистий шлях;
//  • інші фасети/сортування/пагінація → noindex,follow + canonical на базу.
export async function generateMetadata({
	searchParams
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
	const sp = await searchParams
	const s = (k: string) => (typeof sp[k] === 'string' ? (sp[k] as string) : undefined)
	const categorySlug = s('category')
	const carSlug = s('car')
	const page = s('page')

	let title = 'Каталог запчастин Tesla'
	const parts: string[] = []
	if (categorySlug) {
		const cats = await catalogApi.categories().catch(() => [])
		const c = cats.find(x => x.slug === categorySlug)
		if (c) {
			title = `${c.name} — запчастини Tesla`
			parts.push(c.name)
		}
	}
	if (carSlug) {
		const cars = await catalogApi.cars().catch(() => [])
		const car = cars.find(x => x.slug === carSlug)
		if (car) parts.push(car.generation ?? car.model)
	}
	if (page && page !== '1') title += ` — сторінка ${page}`

	// canonical: лише category → категорійна база; решта фасетів → чиста /shop
	const canonical = categorySlug
		? `${SITE_URL}${UI_ROUTES.SHOP}?category=${categorySlug}`
		: `${SITE_URL}${UI_ROUTES.SHOP}`

	// фасети/сортування/пагінація → noindex,follow
	const isFaceted = Boolean(
		carSlug ||
			s('sort') ||
			s('inStock') ||
			s('minPrice') ||
			s('maxPrice') ||
			s('type') ||
			s('condition') ||
			(page && page !== '1')
	)

	return {
		title,
		description: parts.length
			? `Запчастини Tesla ${parts.join(' · ')} — фільтри за моделлю, типом, наявністю та ціною.`
			: 'Оригінальні та аналогові запчастини Tesla (Model 3 · Y · S · X) — фільтри за моделлю, типом, наявністю та ціною.',
		alternates: { canonical },
		robots: isFaceted ? { index: false, follow: true } : undefined
	}
}

const FILTER_KEYS = [
	'q',
	'category',
	'car',
	'type',
	'condition',
	'inStock',
	'minPrice',
	'maxPrice',
	'sort',
	'page'
]

export default async function ShopPage({
	searchParams
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
	const sp = await searchParams
	const params = new URLSearchParams()
	for (const key of FILTER_KEYS) {
		const v = sp[key]
		if (typeof v === 'string' && v) params.set(key, v)
	}

	const [data, categories, cars] = await Promise.all([
		catalogApi.products(params.toString()),
		catalogApi.categories(),
		catalogApi.cars()
	])

	const from = data.total === 0 ? 0 : (data.page - 1) * data.limit + 1
	const to = Math.min(data.page * data.limit, data.total)

	const query = params.get('q')

	return (
		<div className='mx-auto max-w-[1240px] px-6 py-10'>
			<h1 className='font-display mb-1 text-3xl font-medium tracking-tight'>
				{query ? `Результати за «${query}»` : 'Каталог запчастин'}
			</h1>
			<p className='text-muted-foreground mb-8 text-sm'>
				Показано {from}–{to} із {data.total}
			</p>

			<div className='grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]'>
				<CatalogFilters categories={categories} cars={cars} />

				<div>
					<div className='mb-5 flex items-center justify-between'>
						<span className='text-muted-foreground text-sm'>{data.total} товарів</span>
						<SortSelect />
					</div>

					{data.items.length === 0 ? (
						<div className='border-border text-muted-foreground rounded-2xl border border-dashed py-20 text-center'>
							За обраними фільтрами нічого не знайдено.
						</div>
					) : (
						<div className='grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4'>
							{data.items.map(p => (
								<ProductCard key={p.id} product={p} />
							))}
						</div>
					)}

					<Pagination page={data.page} pages={data.pages} params={params} />
				</div>
			</div>
		</div>
	)
}
