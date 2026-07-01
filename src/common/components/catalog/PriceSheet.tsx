'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ImageOff, Loader2 } from 'lucide-react'
import { catalogApi } from '@/common/services/catalog.api'
import { UI_ROUTES } from '@/common/constants'
import { CONDITION_LABEL, TYPE_LABEL, discountPercent, formatMoney } from '@/common/utils/format'
import type { CartProduct } from '@/common/store/useCartStore'
import type { CatalogProduct, CatalogResponse } from '@/common/types'
import { AddToCart } from './AddToCart'
import { WishlistButton } from './WishlistButton'
import { SortSelect } from './SortSelect'

interface Props {
	initial: CatalogResponse
	baseQuery: string // параметри без page (include=fitment, sort, limit, фільтри)
}

const toCartProduct = (p: CatalogProduct): CartProduct => ({
	productId: p.id,
	slug: p.slug,
	name: p.name,
	sku: p.sku,
	price: Number(p.price),
	image: p.images[0]?.url ?? null,
	stockQty: p.stockQty
})

const compatLabel = (models?: string[]): string => {
	if (!models?.length) return '—'
	if (models.length <= 2) return models.join(', ')
	return `${models.slice(0, 2).join(', ')} +${models.length - 2}`
}

export const PriceSheet = ({ initial, baseQuery }: Props) => {
	const [items, setItems] = useState(initial.items)
	const [total, setTotal] = useState(initial.total)
	const [page, setPage] = useState(1)
	const [loadingMore, setLoadingMore] = useState(false)
	const [error, setError] = useState(false)

	const loadingRef = useRef(false)
	const sentinelRef = useRef<HTMLDivElement>(null)

	const hasMore = items.length < total
	// зміна фільтрів/сортування перемонтовує компонент через key={baseQuery} (у page.tsx),
	// тож стан ініціалізується свіжою 1-ю сторінкою без ефекту-скидання

	const loadMore = useCallback(async () => {
		if (loadingRef.current || items.length >= total) return
		loadingRef.current = true
		setLoadingMore(true)
		setError(false)
		try {
			const next = page + 1
			const data = await catalogApi.products(`${baseQuery}&page=${next}`)
			setItems(prev => [...prev, ...data.items])
			setTotal(data.total)
			setPage(next)
		} catch {
			setError(true)
		} finally {
			loadingRef.current = false
			setLoadingMore(false)
		}
	}, [baseQuery, page, items.length, total])

	// нескінченний скрол — довантаження при наближенні до кінця списку
	useEffect(() => {
		const el = sentinelRef.current
		if (!el || !hasMore) return
		const io = new IntersectionObserver(entries => entries[0].isIntersecting && loadMore(), {
			rootMargin: '600px'
		})
		io.observe(el)
		return () => io.disconnect()
	}, [loadMore, hasMore])

	return (
		<div>
			<div className='mb-5 flex items-center justify-between gap-3'>
				<span className='text-muted-foreground text-sm'>
					{total === 0 ? 'Нічого не знайдено' : `Показано ${items.length} із ${total}`}
				</span>
				<SortSelect basePath={UI_ROUTES.PRICE_SHEET} />
			</div>

			{items.length === 0 ? (
				<div className='border-border text-muted-foreground rounded-2xl border border-dashed py-20 text-center'>
					За обраними фільтрами нічого не знайдено.
				</div>
			) : (
				<>
					{/* Десктоп — таблиця зі sticky-заголовком */}
					<div className='border-border hidden rounded-2xl border md:block'>
						<table className='w-full border-separate border-spacing-0 text-sm'>
							<thead className='text-muted-foreground sticky top-16 z-20 text-left text-xs uppercase'>
								<tr className='[&>th]:bg-card [&>th]:border-border [&>th]:border-b [&>th]:px-3 [&>th]:py-3 [&>th]:font-semibold'>
									<th className='w-16'>Фото</th>
									<th>Назва</th>
									<th>Артикул</th>
									<th>Категорія</th>
									<th>Сумісність</th>
									<th>Тип</th>
									<th>Стан</th>
									<th className='!text-right'>Ціна</th>
									<th className='!text-right'>Наявність</th>
									<th className='w-40'></th>
								</tr>
							</thead>
							<tbody>
								{items.map(p => (
									<Row key={p.id} p={p} />
								))}
							</tbody>
						</table>
					</div>

					{/* Мобільний — картковий список */}
					<ul className='flex flex-col gap-3 md:hidden'>
						{items.map(p => (
							<MobileCard key={p.id} p={p} />
						))}
					</ul>
				</>
			)}

			{/* Сентинел скролу + стани довантаження */}
			<div ref={sentinelRef} className='py-6 text-center'>
				{loadingMore && (
					<Loader2 className='text-muted-foreground mx-auto h-5 w-5 animate-spin' />
				)}
				{error && (
					<button
						type='button'
						onClick={loadMore}
						className='border-border hover:bg-muted rounded-lg border px-4 py-2 text-sm'
					>
						Помилка завантаження — спробувати ще раз
					</button>
				)}
				{!hasMore && items.length > 0 && !loadingMore && (
					<span className='text-muted-foreground text-xs'>Це всі товари ({total})</span>
				)}
			</div>
		</div>
	)
}

const Thumb = ({ p, size }: { p: CatalogProduct; size: number }) => {
	const img = p.images[0]
	return (
		<div
			className='bg-muted relative shrink-0 overflow-hidden rounded-lg'
			style={{ width: size, height: size }}
		>
			{img ? (
				<Image
					src={img.url}
					alt={img.alt ?? p.name}
					fill
					sizes={`${size}px`}
					className='object-cover'
				/>
			) : (
				<ImageOff className='text-muted-foreground absolute inset-0 m-auto h-5 w-5' />
			)}
		</div>
	)
}

const StockDot = ({ inStock }: { inStock: boolean }) => (
	<span
		className={
			'inline-block h-2 w-2 shrink-0 rounded-full ' + (inStock ? 'bg-green-500' : 'bg-border')
		}
		aria-hidden
	/>
)

const Row = ({ p }: { p: CatalogProduct }) => {
	const inStock = p.stockQty > 0
	const discount = p.onSale ? discountPercent(p.price, p.oldPrice) : null
	const img = p.images[0]
	return (
		<tr className='group hover:bg-muted [&>td]:border-border transition-colors [&>td]:border-t'>
			<td className='relative px-3 py-2'>
				<Link href={UI_ROUTES.PRODUCT(p.slug)}>
					<Thumb p={p} size={44} />
				</Link>
				{/* збільшене превʼю при наведенні на рядок */}
				{img && (
					<div className='pointer-events-none absolute top-1/2 left-14 z-30 -translate-y-1/2 scale-90 opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100'>
						<div className='border-border bg-card relative h-72 w-72 overflow-hidden rounded-xl border shadow-2xl'>
							<Image
								src={img.url}
								alt={img.alt ?? p.name}
								fill
								sizes='288px'
								className='object-contain'
							/>
						</div>
					</div>
				)}
			</td>
			<td className='px-3 py-2'>
				<Link
					href={UI_ROUTES.PRODUCT(p.slug)}
					className='hover:text-accent-text flex items-center gap-2 font-medium'
				>
					<StockDot inStock={inStock} />
					<span className='line-clamp-2'>{p.name}</span>
				</Link>
			</td>
			<td className='text-muted-foreground px-3 py-2 font-mono text-xs'>{p.sku}</td>
			<td className='text-muted-foreground px-3 py-2'>{p.category?.name ?? '—'}</td>
			<td className='text-muted-foreground px-3 py-2 text-xs'>
				{compatLabel(p.compatibility)}
			</td>
			<td className='px-3 py-2'>{TYPE_LABEL[p.type]}</td>
			<td className='px-3 py-2'>
				{p.condition === 'new' ? '—' : CONDITION_LABEL[p.condition]}
			</td>
			<td className='px-3 py-2 text-right'>
				<span className='font-bold'>{formatMoney(p.price)}</span>
				{discount && p.oldPrice && (
					<span className='text-muted-foreground block text-xs line-through'>
						{formatMoney(p.oldPrice)}
					</span>
				)}
			</td>
			<td className='px-3 py-2 text-right'>
				{inStock ? (
					<span>{p.stockQty} шт</span>
				) : (
					<span className='text-muted-foreground'>Немає</span>
				)}
			</td>
			<td className='px-3 py-2'>
				<div className='flex items-center gap-2'>
					<div className='flex-1'>
						<AddToCart product={toCartProduct(p)} variant='card' />
					</div>
					<WishlistButton product={p} variant='inline' />
				</div>
			</td>
		</tr>
	)
}

const MobileCard = ({ p }: { p: CatalogProduct }) => {
	const inStock = p.stockQty > 0
	return (
		<li className='border-border bg-card flex gap-3 rounded-2xl border p-3'>
			<Link href={UI_ROUTES.PRODUCT(p.slug)}>
				<Thumb p={p} size={64} />
			</Link>
			<div className='flex min-w-0 flex-1 flex-col gap-1'>
				<div className='flex items-start justify-between gap-2'>
					<Link
						href={UI_ROUTES.PRODUCT(p.slug)}
						className='line-clamp-2 text-sm font-semibold'
					>
						{p.name}
					</Link>
					<span className='shrink-0 text-sm font-bold'>{formatMoney(p.price)}</span>
				</div>
				<p className='text-muted-foreground text-xs'>
					{TYPE_LABEL[p.type]}
					{p.condition !== 'new' && ` · ${CONDITION_LABEL[p.condition]}`}
					{p.category?.name && ` · ${p.category.name}`}
				</p>
				{p.compatibility?.length ? (
					<p className='text-muted-foreground text-xs'>{compatLabel(p.compatibility)}</p>
				) : null}
				<p className='text-muted-foreground font-mono text-xs'>{p.sku}</p>
				<div className='mt-1 flex items-center justify-between gap-2'>
					<span className='flex items-center gap-1.5 text-xs'>
						<StockDot inStock={inStock} />
						{inStock ? `${p.stockQty} шт` : 'Немає'}
					</span>
					<div className='flex items-center gap-2'>
						<div className='w-32'>
							<AddToCart product={toCartProduct(p)} variant='card' />
						</div>
						<WishlistButton product={p} variant='inline' />
					</div>
				</div>
			</div>
		</li>
	)
}
