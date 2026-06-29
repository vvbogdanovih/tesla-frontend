import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { catalogApi } from '@/common/services/catalog.api'
import { ProductGallery } from '@/common/components/catalog/ProductGallery'
import { SITE_URL, UI_ROUTES } from '@/common/constants'
import {
	CONDITION_LABEL,
	TYPE_LABEL,
	discountPercent,
	formatMoney
} from '@/common/utils/format'

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

	const inStock = p.stockQty > 0
	const discount = p.onSale ? discountPercent(p.price, p.oldPrice) : null
	const compat = p.cars.map(c => (c.generation ? `${c.model} · ${c.generation}` : c.model))
	const attrs = Object.entries(p.attributes ?? {})

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: p.name,
		sku: p.sku,
		image: p.images.map(i => i.url),
		category: p.category?.name,
		offers: {
			'@type': 'Offer',
			price: Number(p.price),
			priceCurrency: 'UAH',
			availability: inStock
				? 'https://schema.org/InStock'
				: 'https://schema.org/PreOrder',
			url: `${SITE_URL}${UI_ROUTES.PRODUCT(p.slug)}`
		}
	}

	return (
		<div className='mx-auto max-w-[1240px] px-6 py-10'>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>

			<nav className='text-muted-foreground mb-6 text-sm'>
				<a href={UI_ROUTES.SHOP} className='hover:text-accent-text'>
					Каталог
				</a>
				{p.category && <span> / {p.category.name}</span>}
			</nav>

			<div className='grid grid-cols-1 gap-10 lg:grid-cols-2'>
				<ProductGallery images={p.images} name={p.name} />

				<div>
					<div className='mb-3 flex flex-wrap gap-1.5'>
						<Badge>{TYPE_LABEL[p.type]}</Badge>
						{p.condition !== 'new' && <Badge>{CONDITION_LABEL[p.condition]}</Badge>}
						<Badge accent={inStock}>{inStock ? 'В наявності' : 'Під замовлення'}</Badge>
					</div>

					<h1 className='font-display text-2xl font-medium tracking-tight'>{p.name}</h1>
					<p className='text-muted-foreground mt-1 font-mono text-sm'>Артикул: {p.sku}</p>

					{compat.length > 0 && (
						<p className='mt-4 text-sm'>
							<span className='text-muted-foreground'>Підходить до: </span>
							<span className='font-medium'>{compat.join(', ')}</span>
						</p>
					)}

					<div className='mt-5 flex items-baseline gap-3'>
						<span className='text-3xl font-bold'>{formatMoney(p.price)}</span>
						{p.onSale && p.oldPrice && (
							<>
								<span className='text-muted-foreground text-lg line-through'>
									{formatMoney(p.oldPrice)}
								</span>
								{discount && (
									<span className='bg-primary text-primary-foreground rounded-md px-2 py-0.5 text-sm font-bold'>
										−{discount}%
									</span>
								)}
							</>
						)}
					</div>

					<button
						type='button'
						className='bg-primary text-primary-foreground mt-6 h-12 w-full rounded-xl text-sm font-bold transition-opacity hover:opacity-90 sm:w-auto sm:px-8'
					>
						Додати в кошик
					</button>

					{attrs.length > 0 && (
						<table className='mt-8 w-full text-sm'>
							<tbody>
								{attrs.map(([k, v]) => (
									<tr key={k} className='border-border border-b'>
										<td className='text-muted-foreground py-2 pr-4'>{k}</td>
										<td className='py-2 font-medium'>{v}</td>
									</tr>
								))}
							</tbody>
						</table>
					)}

					<div className='mt-6 flex flex-col gap-2'>
						{warranty?.bodyHtml && <Accordion title={warranty.title} html={warranty.bodyHtml} />}
						{delivery?.bodyHtml && <Accordion title={delivery.title} html={delivery.bodyHtml} />}
					</div>
				</div>
			</div>

			{p.descriptionHtml && (
				<section className='mt-12 max-w-3xl'>
					<h2 className='font-display mb-3 text-xl font-medium'>Опис</h2>
					<div className='rich' dangerouslySetInnerHTML={{ __html: p.descriptionHtml }} />
				</section>
			)}
		</div>
	)
}

const Badge = ({ children, accent }: { children: React.ReactNode; accent?: boolean }) => (
	<span
		className={
			accent
				? 'rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700'
				: 'border-border text-muted-foreground rounded-full border px-2.5 py-0.5 text-xs font-medium'
		}
	>
		{children}
	</span>
)

const Accordion = ({ title, html }: { title: string; html: string }) => (
	<details className='border-border rounded-xl border px-4 py-3'>
		<summary className='cursor-pointer text-sm font-semibold'>{title}</summary>
		<div className='rich text-muted-foreground mt-2 text-sm' dangerouslySetInnerHTML={{ __html: html }} />
	</details>
)
