import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { CreditCard, ShieldCheck } from 'lucide-react'
import { catalogApi } from '@/common/services/catalog.api'
import { Accordion } from '@/common/components/catalog/Accordion'
import { ProductGallery } from '@/common/components/catalog/ProductGallery'
import { LivePhotos } from '@/common/components/catalog/LivePhotos'
import { ProductCard } from '@/common/components/catalog/ProductCard'
import { LeadButton } from '@/common/components/catalog/LeadButton'
import { AddToCart } from '@/common/components/catalog/AddToCart'
import { WishlistButton } from '@/common/components/catalog/WishlistButton'
import { CopySku } from '@/common/components/catalog/CopySku'
import { SITE_URL, UI_ROUTES } from '@/common/constants'
import type { CatalogProduct } from '@/common/types'
import { CONDITION_LABEL, TYPE_LABEL, discountPercent, formatMoney } from '@/common/utils/format'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const { slug } = await params
	const p = await catalogApi.bySlug(slug)
	if (!p) return { title: 'Товар не знайдено' }
	return {
		title: p.seo?.title || p.name,
		description: p.seo?.description || `${p.name} — артикул ${p.sku}. Запчастина Tesla.`,
		alternates: { canonical: `${SITE_URL}${UI_ROUTES.PRODUCT(p.slug)}` },
		openGraph: {
			title: p.seo?.title || p.name,
			images: p.images[0]?.url ? [p.images[0].url] : []
		}
	}
}

export default async function ProductPage({ params }: Params) {
	const { slug } = await params
	const p = await catalogApi.bySlug(slug)
	if (!p) notFound()

	const [warranty, delivery] = await Promise.all([
		catalogApi.contentBlock('warranty'),
		catalogApi.contentBlock('delivery_payment')
	])

	// «Схожі товари» — з тієї ж категорії, без поточного (FR-3.11)
	let related: CatalogProduct[] = []
	if (p.category) {
		try {
			const res = await catalogApi.products(`category=${p.category.slug}&limit=5`)
			related = res.items.filter(i => i.id !== p.id).slice(0, 4)
		} catch {
			related = []
		}
	}

	const inStock = p.stockQty > 0
	const discount = p.onSale ? discountPercent(p.price, p.oldPrice) : null
	const compat = p.cars.map(c => (c.generation ? `${c.model} · ${c.generation}` : c.model))
	const attrs = Object.entries(p.attributes ?? {})
	const productUrl = `${SITE_URL}${UI_ROUTES.PRODUCT(p.slug)}`

	// Характеристики (FR-3.7): базові поля + кастомні атрибути.
	// Атрибути з адмінки, що дублюють базові поля (Стан, Тип, артикул…), відкидаємо.
	const baseRows: Array<[string, string, boolean?]> = [
		['Стан', CONDITION_LABEL[p.condition]],
		...(compat.length ? ([['Сумісність', compat.join(' · ')]] as [string, string][]) : []),
		['Код запчастини (артикул)', p.sku, true],
		['Тип запчастини', TYPE_LABEL[p.type]],
		...(p.category ? ([['Категорія', p.category.name]] as [string, string][]) : [])
	]
	const norm = (s: string) => s.toLowerCase().replace(/[^a-zа-яіїєґ0-9]/gi, '')
	const baseKeys = baseRows.map(r => norm(r[0]))
	const extra = attrs.filter(([k]) => {
		const nk = norm(k)
		return !baseKeys.some(bk => bk === nk || bk.includes(nk))
	})
	const specs: Array<[string, string, boolean?]> = [
		...baseRows,
		...extra.map(([k, v]) => [k, v] as [string, string, boolean?])
	]

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: p.name,
		sku: p.sku,
		image: [...p.images, ...(p.livePhotos ?? [])].map(i => i.url),
		category: p.category?.name,
		offers: {
			'@type': 'Offer',
			price: Number(p.price),
			priceCurrency: 'UAH',
			availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
			url: productUrl
		}
	}

	const breadcrumbLd = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Головна', item: SITE_URL },
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Каталог',
				item: `${SITE_URL}${UI_ROUTES.SHOP}`
			},
			...(p.category ? [{ '@type': 'ListItem', position: 3, name: p.category.name }] : []),
			{ '@type': 'ListItem', position: p.category ? 4 : 3, name: p.name, item: productUrl }
		]
	}

	const galleryBadges = (
		<>
			<Badge variant='accent'>{CONDITION_LABEL[p.condition]}</Badge>
			<Badge>{TYPE_LABEL[p.type]}</Badge>
		</>
	)

	return (
		<div className='mx-auto max-w-[1240px] px-6'>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
			/>

			{/* Хлібні крихти (FR-3.3) */}
			<nav className='text-muted-foreground flex flex-wrap items-center gap-2 pt-[18px] pb-1.5 text-[13px]'>
				<Link href={UI_ROUTES.HOME} className='hover:text-accent-text'>
					Головна
				</Link>
				<span className='opacity-50'>/</span>
				<Link href={UI_ROUTES.SHOP} className='hover:text-accent-text'>
					Каталог
				</Link>
				{p.category && (
					<>
						<span className='opacity-50'>/</span>
						<span>{p.category.name}</span>
					</>
				)}
				<span className='opacity-50'>/</span>
				<span className='text-foreground'>{p.name}</span>
			</nav>

			<div className='grid items-start gap-10 pt-3.5 pb-10 lg:grid-cols-[1fr_440px]'>
				{/* Ліва колонка: галерея + контент під фото */}
				<div className='min-w-0'>
					<ProductGallery images={p.images} name={p.name} badges={galleryBadges} />

					{/* Живі фото — реальні знімки екземпляра (перед описом; лише за наявності) */}
					<LivePhotos photos={p.livePhotos ?? []} productName={p.name} />

					<div className='border-border bg-card mt-10 flex flex-col gap-9 rounded-2xl border p-6 sm:p-8'>
						{p.descriptionHtml && (
							<section>
								<h2 className='mb-3.5 text-xl font-bold'>Опис</h2>
								<div
									className='rich'
									dangerouslySetInnerHTML={{ __html: p.descriptionHtml }}
								/>
							</section>
						)}

						{specs.length > 0 && (
							<section>
								<h2 className='mb-3.5 text-xl font-bold'>Характеристики</h2>
								<table className='w-full border-collapse'>
									<tbody>
										{specs.map(([k, v, mono]) => (
											<tr key={k} className='border-border border-b'>
												<td className='text-muted-foreground w-60 py-3 pr-4 align-top text-sm'>
													{k}
												</td>
												<td
													className={`py-3 text-sm font-semibold ${mono ? 'font-mono' : ''}`}
												>
													{v}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</section>
						)}

						{(warranty?.bodyHtml || delivery?.bodyHtml) && (
							<section>
								<h2 className='mb-3.5 text-xl font-bold'>Гарантія та доставка</h2>
								<div className='border-border divide-border divide-y overflow-hidden rounded-xl border'>
									{warranty?.bodyHtml && (
										<Accordion
											title={warranty.title}
											html={warranty.bodyHtml}
											defaultOpen
										/>
									)}
									{delivery?.bodyHtml && (
										<Accordion
											title={delivery.title}
											html={delivery.bodyHtml}
										/>
									)}
								</div>
							</section>
						)}
					</div>
				</div>

				{/* Права колонка: інфо + купівля (sticky) */}
				<div className='lg:sticky lg:top-[84px]'>
					<div className='mb-3 flex flex-wrap items-center gap-1.5'>
						<Badge variant='accent'>{CONDITION_LABEL[p.condition]}</Badge>
						<Badge>{TYPE_LABEL[p.type]}</Badge>
					</div>

					<h1 className='mb-2 text-[26px] leading-[1.25] font-bold tracking-[-0.01em]'>
						{p.name}
					</h1>

					<div className='text-muted-foreground mb-3.5 flex flex-wrap items-center gap-2 text-sm'>
						<span>Артикул:</span>
						<span className='text-accent-text font-mono text-sm font-bold tracking-wide'>
							{p.sku}
						</span>
						<CopySku sku={p.sku} />
						{p.category && (
							<>
								<span className='opacity-50'>·</span>
								<span>
									Категорія:{' '}
									<b className='text-foreground font-semibold'>
										{p.category.name}
									</b>
								</span>
							</>
						)}
					</div>

					{inStock ? (
						<div className='text-success mb-3.5 inline-flex items-center gap-2 text-[13px] font-semibold'>
							<span className='bg-success h-2 w-2 rounded-full' />В наявності —
							відправка сьогодні
						</div>
					) : (
						<div className='text-muted-foreground mb-3.5 inline-flex items-center gap-2 text-[13px] font-semibold'>
							<span className='bg-muted-foreground h-2 w-2 rounded-full' />
							Немає в наявності
						</div>
					)}

					{compat.length > 0 && (
						<div className='mb-[18px] flex flex-wrap items-center gap-2'>
							<span className='text-muted-foreground text-[13px] font-semibold'>
								Сумісність:
							</span>
							{compat.map(c => (
								<span
									key={c}
									className='border-border bg-muted rounded-full border px-[11px] py-[5px] text-xs font-semibold'
								>
									{c}
								</span>
							))}
						</div>
					)}

					<div className='border-border bg-muted rounded-[14px] border p-[18px]'>
						<div className='flex flex-wrap items-baseline gap-3'>
							<span className='text-[34px] leading-none font-extrabold tracking-[-0.02em]'>
								{formatMoney(p.price)}
							</span>
							{p.onSale && p.oldPrice && (
								<>
									<span className='text-muted-foreground text-[17px] line-through'>
										{formatMoney(p.oldPrice)}
									</span>
									{discount && (
										<span className='bg-destructive rounded-md px-2 py-0.5 text-[13px] font-extrabold text-white'>
											−{discount}%
										</span>
									)}
								</>
							)}
						</div>

						{inStock && (
							<>
								<div className='mt-4'>
									<AddToCart
										variant='full'
										product={{
											productId: p.id,
											slug: p.slug,
											name: p.name,
											sku: p.sku,
											price: Number(p.price),
											image: p.images[0]?.url ?? null,
											stockQty: p.stockQty
										}}
									/>
								</div>

								<LeadButton
									type='contact'
									productId={p.id}
									label='⚡ Купити в 1 клік'
									title='Купити в 1 клік'
									className='border-border hover:bg-muted mt-2.5 flex h-12 w-full items-center justify-center rounded-xl border text-sm font-bold shadow-lg'
								/>
							</>
						)}

						<div className='mt-2.5'>
							<WishlistButton
								variant='detail'
								product={{
									id: p.id,
									slug: p.slug,
									sku: p.sku,
									name: p.name,
									price: p.price,
									oldPrice: p.oldPrice,
									onSale: p.onSale,
									type: p.type,
									condition: p.condition,
									stockQty: p.stockQty,
									category: p.category,
									images: p.images,
									hasLivePhotos: (p.livePhotos?.length ?? 0) > 0
								}}
							/>
						</div>

						<div className='mt-4 flex flex-wrap gap-5'>
							<LeadButton
								type='price_match'
								productId={p.id}
								label='Знайшли дешевше?'
								title='Знайшли дешевше?'
								className='text-muted-foreground hover:text-accent-text text-[13px] font-semibold'
							/>
							<LeadButton
								type='price_subscribe'
								productId={p.id}
								label='Стежити за ціною'
								title='Стежити за ціною'
								className='text-muted-foreground hover:text-accent-text text-[13px] font-semibold'
							/>
						</div>
					</div>

					<div className='text-muted-foreground mt-[18px] flex flex-wrap gap-[18px] text-xs'>
						<div className='flex items-center gap-1.5'>
							<Image
								src='/logos/nova-poshta.png'
								alt='Нова Пошта'
								width={16}
								height={16}
								className='h-4 w-4 object-contain'
							/>
							Нова Пошта
							<span className='opacity-50'>/</span>
							<Image
								src='/logos/ukrposhta.png'
								alt='Укрпошта'
								width={16}
								height={16}
								className='h-4 w-4 rounded-sm object-contain'
							/>
							Укрпошта
						</div>
						<div className='flex items-center gap-1.5'>
							<CreditCard className='h-4 w-4' /> Visa · Mastercard · накладений
						</div>
						<div className='flex items-center gap-1.5'>
							<ShieldCheck className='h-4 w-4' /> Гарантія
						</div>
					</div>
				</div>
			</div>

			{/* Схожі товари (FR-3.11) */}
			{related.length > 0 && (
				<section className='border-border mt-2 border-t pt-[34px] pb-12'>
					<h2 className='mb-[18px] text-[22px] font-bold'>Схожі товари</h2>
					<div className='grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4'>
						{related.map(r => (
							<ProductCard key={r.id} product={r} />
						))}
					</div>
				</section>
			)}
		</div>
	)
}

const Badge = ({
	children,
	variant = 'dark'
}: {
	children: React.ReactNode
	variant?: 'dark' | 'accent'
}) => (
	<span
		className={
			'inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide ' +
			(variant === 'accent'
				? 'bg-primary text-primary-foreground'
				: 'bg-foreground text-background')
		}
	>
		{children}
	</span>
)
