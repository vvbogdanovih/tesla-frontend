import type { Metadata } from 'next'
import { catalogApi } from '@/common/services/catalog.api'
import { ProductCard } from '@/common/components/catalog/ProductCard'
import { CatalogFilters } from '@/common/components/catalog/CatalogFilters'
import { SortSelect } from '@/common/components/catalog/SortSelect'
import { Pagination } from '@/common/components/catalog/Pagination'

export const metadata: Metadata = {
	title: 'Каталог запчастин Tesla',
	description:
		'Оригінальні та аналогові запчастини Tesla (Model 3 · Y · S · X) — фільтри за моделлю, типом, наявністю та ціною.'
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
