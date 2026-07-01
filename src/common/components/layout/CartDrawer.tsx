'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ImageOff, ShoppingCart, Trash2, X } from 'lucide-react'
import { UI_ROUTES } from '@/common/constants'
import { formatMoney } from '@/common/utils/format'
import { useCartStore, useCartTotal } from '@/common/store/useCartStore'
import { QtyStepper } from '@/common/components/catalog/QtyStepper'

export const CartDrawer = () => {
	const pathname = usePathname()
	const items = useCartStore(s => s.items)
	const isOpen = useCartStore(s => s.isOpen)
	const close = useCartStore(s => s.close)
	const setQty = useCartStore(s => s.setQty)
	const remove = useCartStore(s => s.remove)
	const total = useCartTotal()
	const count = items.reduce((n, i) => n + i.qty, 0)

	// блокування скролу body + закриття на Esc
	useEffect(() => {
		if (!isOpen) return
		document.body.style.overflow = 'hidden'
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
		window.addEventListener('keydown', onKey)
		return () => {
			document.body.style.overflow = ''
			window.removeEventListener('keydown', onKey)
		}
	}, [isOpen, close])

	// закривати при зміні маршруту
	useEffect(() => {
		close()
	}, [pathname, close])

	return (
		<>
			{/* бекдроп */}
			<div
				aria-hidden
				onClick={close}
				className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
					isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
				}`}
			/>

			{/* панель */}
			<aside
				role='dialog'
				aria-label='Кошик'
				aria-hidden={!isOpen}
				className={`bg-card fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col shadow-xl transition-transform duration-300 ${
					isOpen ? 'translate-x-0' : 'translate-x-full'
				}`}
			>
				<div className='border-border flex h-16 shrink-0 items-center justify-between border-b px-5'>
					<h2 className='font-display text-lg font-medium'>
						Кошик{count > 0 && <span className='text-muted-foreground'> ({count})</span>}
					</h2>
					<button
						type='button'
						onClick={close}
						aria-label='Закрити'
						className='hover:bg-muted -mr-2 flex h-10 w-10 items-center justify-center rounded-xl'
					>
						<X className='h-5 w-5' />
					</button>
				</div>

				{items.length === 0 ? (
					<div className='flex flex-1 flex-col items-center justify-center px-5 text-center'>
						<ShoppingCart className='text-muted-foreground mb-3 h-10 w-10' />
						<p className='font-medium'>Кошик порожній</p>
						<button
							type='button'
							onClick={close}
							className='text-accent-text mt-2 text-sm font-medium hover:underline'
						>
							Продовжити покупки
						</button>
					</div>
				) : (
					<>
						<ul className='flex-1 overflow-y-auto px-3 py-3'>
							{items.map(i => (
								<li key={i.productId} className='flex gap-3 px-2 py-3'>
									<Link
										href={UI_ROUTES.PRODUCT(i.slug)}
										className='bg-muted relative h-20 w-20 shrink-0 overflow-hidden rounded-xl'
									>
										{i.image ? (
											<Image src={i.image} alt={i.name} fill sizes='80px' className='object-cover' />
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
										<p className='text-muted-foreground mt-0.5 font-mono text-xs'>{i.sku}</p>

										<div className='mt-auto flex items-center justify-between pt-2'>
											<QtyStepper
												qty={i.qty}
												stockQty={i.stockQty}
												onSet={q => setQty(i.productId, q)}
												size='sm'
											/>
											<span className='text-sm font-bold'>{formatMoney(i.price * i.qty)}</span>
										</div>
									</div>

									<button
										type='button'
										onClick={() => remove(i.productId)}
										aria-label='Видалити'
										className='text-muted-foreground hover:text-foreground self-start'
									>
										<Trash2 className='h-4 w-4' />
									</button>
								</li>
							))}
						</ul>

						<div className='border-border shrink-0 border-t p-5'>
							<div className='mb-4 flex items-baseline justify-between'>
								<span className='text-muted-foreground text-sm'>Разом</span>
								<span className='text-2xl font-extrabold'>{formatMoney(total)}</span>
							</div>
							<Link
								href={UI_ROUTES.CART}
								className='bg-primary text-primary-foreground flex h-12 w-full items-center justify-center rounded-xl text-sm font-bold transition-opacity hover:opacity-90'
							>
								Перейти до кошика
							</Link>
						</div>
					</>
				)}
			</aside>
		</>
	)
}
