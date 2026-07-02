'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ImageOff, ShoppingCart, Trash2 } from 'lucide-react'
import { UI_ROUTES } from '@/common/constants'
import { formatMoney } from '@/common/utils/format'
import { useCartStore, useCartTotal } from '@/common/store/useCartStore'
import { QtyStepper } from '@/common/components/catalog/QtyStepper'

export default function CartPage() {
	const items = useCartStore(s => s.items)
	const hydrated = useCartStore(s => s.hasHydrated)
	const setQty = useCartStore(s => s.setQty)
	const remove = useCartStore(s => s.remove)
	const clear = useCartStore(s => s.clear)
	const total = useCartTotal()

	// до гідрації persist — не блимаємо «порожнім кошиком»
	if (!hydrated) {
		return <div className='mx-auto min-h-[40vh] max-w-[1240px] px-6 py-10' />
	}

	if (items.length === 0) {
		return (
			<div className='mx-auto max-w-[1240px] px-6 py-16 text-center'>
				<ShoppingCart className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
				<h1 className='font-display text-2xl font-medium'>Кошик порожній</h1>
				<p className='text-muted-foreground mt-2'>Додайте запчастини з каталогу.</p>
				<Link
					href={UI_ROUTES.SHOP}
					className='bg-primary text-primary-foreground mt-6 inline-flex h-12 items-center rounded-xl px-8 text-sm font-bold transition-opacity hover:opacity-90'
				>
					До каталогу
				</Link>
			</div>
		)
	}

	return (
		<div className='mx-auto max-w-[1240px] px-6 py-10'>
			<h1 className='font-display mb-6 text-2xl font-medium'>Кошик</h1>

			<div className='grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]'>
				<ul className='flex flex-col gap-3'>
					{items.map(i => (
						<li
							key={i.productId}
							className='border-border bg-card flex gap-4 rounded-2xl border p-3'
						>
							<Link
								href={UI_ROUTES.PRODUCT(i.slug)}
								className='bg-muted relative h-24 w-24 shrink-0 overflow-hidden rounded-xl'
							>
								{i.image ? (
									<Image
										src={i.image}
										alt={i.name}
										fill
										sizes='96px'
										className='object-cover'
									/>
								) : (
									<ImageOff className='text-muted-foreground absolute inset-0 m-auto h-6 w-6' />
								)}
							</Link>

							<div className='flex flex-1 flex-col'>
								<Link
									href={UI_ROUTES.PRODUCT(i.slug)}
									className='hover:text-accent-text line-clamp-2 text-sm font-semibold'
								>
									{i.name}
								</Link>
								<p className='text-muted-foreground mt-0.5 font-mono text-xs'>
									{i.sku}
								</p>

								<div className='mt-auto flex items-end justify-between pt-2'>
									<QtyStepper
										qty={i.qty}
										stockQty={i.stockQty}
										onSet={q => setQty(i.productId, q)}
										size='md'
									/>

									<div className='text-right'>
										<p className='font-bold'>{formatMoney(i.price * i.qty)}</p>
										{i.qty > 1 && (
											<p className='text-muted-foreground text-xs'>
												{formatMoney(i.price)} / шт
											</p>
										)}
									</div>
								</div>
							</div>

							<button
								type='button'
								onClick={() => remove(i.productId)}
								aria-label='Видалити'
								className='text-muted-foreground hover:text-foreground self-start'
							>
								<Trash2 className='h-5 w-5' />
							</button>
						</li>
					))}

					<button
						type='button'
						onClick={clear}
						className='text-muted-foreground hover:text-foreground mt-1 self-start text-sm'
					>
						Очистити кошик
					</button>
				</ul>

				<aside className='border-border bg-card h-fit rounded-2xl border p-5 lg:sticky lg:top-20'>
					<div className='flex items-baseline justify-between'>
						<span className='text-muted-foreground text-sm'>Разом</span>
						<span className='text-2xl font-extrabold'>{formatMoney(total)}</span>
					</div>
					<Link
						href={UI_ROUTES.CHECKOUT}
						className='bg-primary text-primary-foreground mt-5 flex h-12 w-full items-center justify-center rounded-xl text-sm font-bold transition-opacity hover:opacity-90'
					>
						Оформити замовлення
					</Link>
					<Link
						href={UI_ROUTES.SHOP}
						className='text-muted-foreground hover:text-foreground mt-3 block text-center text-sm'
					>
						Продовжити покупки
					</Link>
				</aside>
			</div>
		</div>
	)
}
