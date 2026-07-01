'use client'

import Link from 'next/link'
import toast from 'react-hot-toast'
import { Check, ShoppingCart, Trash2 } from 'lucide-react'
import { UI_ROUTES } from '@/common/constants'
import { useCartStore, type CartProduct } from '@/common/store/useCartStore'
import { QtyStepper } from './QtyStepper'

interface Props {
	product: CartProduct
	variant?: 'card' | 'full'
}

export const AddToCart = ({ product, variant = 'card' }: Props) => {
	const item = useCartStore(s => s.items.find(i => i.productId === product.productId))
	const add = useCartStore(s => s.add)
	const setQty = useCartStore(s => s.setQty)
	const removeItem = useCartStore(s => s.remove)
	const qty = item?.qty ?? 0

	const onAdd = () => {
		const res = add(product, 1)
		if (res.ok) toast.success('Додано в кошик')
		else toast.error(`Доступно лише ${res.max} шт`)
	}

	const sizeCls =
		variant === 'full'
			? 'flex h-12 w-full items-center justify-center gap-2 rounded-xl px-8 text-sm font-bold'
			: 'flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold'

	// немає на складі — додати неможливо
	if (product.stockQty <= 0) {
		return (
			<button
				type='button'
				disabled
				className={`${sizeCls} border-border text-muted-foreground cursor-not-allowed border opacity-70`}
			>
				Немає в наявності
			</button>
		)
	}

	// ще не в кошику — кнопка додавання
	if (qty === 0) {
		return (
			<button
				type='button'
				onClick={onAdd}
				className={`${sizeCls} bg-primary text-primary-foreground shadow-lg transition-opacity hover:opacity-90`}
			>
				<ShoppingCart className='h-4 w-4' />
				{variant === 'full' ? 'Додати в кошик' : 'У кошик'}
			</button>
		)
	}

	const onSet = (q: number) => setQty(product.productId, q)

	// вже в кошику — лічильник; для full — ще й перехід у кошик
	if (variant === 'full') {
		return (
			<div className='flex items-center gap-3'>
				<QtyStepper qty={qty} stockQty={product.stockQty} onSet={onSet} size='md' />
				<Link
					href={UI_ROUTES.CART}
					className='border-border hover:bg-muted flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border px-6 text-sm font-bold shadow-lg'
				>
					<Check className='text-accent-text h-4 w-4' /> У кошику — перейти
				</Link>
			</div>
		)
	}

	// card: «В кошику», при наведенні → «Видалити з кошика» (клік видаляє)
	const onRemove = () => {
		removeItem(product.productId)
		toast.success('Видалено з кошика')
	}
	return (
		<button
			type='button'
			onClick={onRemove}
			aria-label='Видалити з кошика'
			className='group/cart border-border relative flex h-10 w-full items-center justify-center overflow-hidden rounded-xl border text-sm font-bold shadow-lg transition-colors duration-200 hover:border-red-300 hover:bg-red-50'
		>
			<span className='absolute inset-0 flex items-center justify-center gap-2 opacity-100 transition-opacity duration-200 group-hover/cart:opacity-0'>
				<Check className='text-accent-text h-4 w-4' /> В кошику
			</span>
			<span className='absolute inset-0 flex items-center justify-center gap-2 text-red-600 opacity-0 transition-opacity duration-200 group-hover/cart:opacity-100'>
				<Trash2 className='h-4 w-4' /> Видалити з кошика
			</span>
		</button>
	)
}
