import Link from 'next/link'
import Image from 'next/image'
import { Camera, ImageOff } from 'lucide-react'
import { UI_ROUTES } from '@/common/constants'
import { CONDITION_LABEL, TYPE_LABEL, discountPercent, formatMoney } from '@/common/utils/format'
import { AddToCart } from './AddToCart'
import { WishlistButton } from './WishlistButton'
import type { CatalogProduct } from '@/common/types'

export const ProductCard = ({ product: p }: { product: CatalogProduct }) => {
	const img = p.images[0]
	const discount = p.onSale ? discountPercent(p.price, p.oldPrice) : null

	return (
		<div className='group border-border bg-card relative flex flex-col overflow-hidden rounded-2xl border transition-shadow hover:shadow-lg'>
			{/* розтягнуте посилання на товар (під кнопкою кошика) */}
			<Link
				href={UI_ROUTES.PRODUCT(p.slug)}
				aria-label={p.name}
				className='absolute inset-0 z-10'
			/>

			<div className='p-4 pb-0'>
				<div className='bg-muted relative aspect-square w-full overflow-hidden rounded-xl'>
					{img ? (
						<Image
							src={img.url}
							alt={img.alt ?? p.name}
							fill
							sizes='(max-width:640px) 50vw, (max-width:1024px) 33vw, 300px'
							className='object-cover transition-transform duration-300 group-hover:scale-105'
						/>
					) : (
						<ImageOff className='text-muted-foreground absolute inset-0 m-auto h-8 w-8' />
					)}
					{discount && (
						<span className='bg-primary text-primary-foreground absolute top-2 left-2 rounded-md px-1.5 py-0.5 text-xs font-bold'>
							−{discount}%
						</span>
					)}
					{/* ♡-тумблер обраного — поверх посилання-оверлею (z-20) */}
					<WishlistButton product={p} />
				</div>
			</div>

			<div className='flex flex-1 flex-col p-4'>
				<div className='mb-2 flex flex-wrap gap-1.5'>
					<Badge>{TYPE_LABEL[p.type]}</Badge>
					{p.condition !== 'new' && <Badge>{CONDITION_LABEL[p.condition]}</Badge>}
					{/* сигнал «є живі фото» — у тому ж рядку, що й тип/стан */}
					{p.hasLivePhotos && (
						<span className='text-accent-text inline-flex items-center gap-1 rounded-full border border-amber-300 px-2 py-0.5 text-[11px] font-semibold dark:border-amber-700'>
							<Camera className='h-3 w-3' /> Живі фото
						</span>
					)}
				</div>

				<h3 className='group-hover:text-accent-text line-clamp-2 text-sm font-semibold transition-colors'>
					{p.name}
				</h3>
				<p className='text-muted-foreground mt-1 font-mono text-xs'>{p.sku}</p>

				<div className='mt-auto flex items-baseline gap-2 pt-3'>
					<span className='text-lg font-bold'>{formatMoney(p.price)}</span>
					{p.onSale && p.oldPrice && (
						<span className='text-muted-foreground text-sm line-through'>
							{formatMoney(p.oldPrice)}
						</span>
					)}
				</div>

				{/* кнопка кошика — поверх посилання-оверлею */}
				<div className='relative z-20 mt-3'>
					<AddToCart
						variant='card'
						product={{
							productId: p.id,
							slug: p.slug,
							name: p.name,
							sku: p.sku,
							price: Number(p.price),
							image: img?.url ?? null,
							stockQty: p.stockQty
						}}
					/>
				</div>
			</div>
		</div>
	)
}

const Badge = ({ children, muted }: { children: React.ReactNode; muted?: boolean }) => (
	<span
		className={
			muted
				? 'bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[11px] font-medium'
				: 'border-border text-muted-foreground rounded-full border px-2 py-0.5 text-[11px] font-medium'
		}
	>
		{children}
	</span>
)
