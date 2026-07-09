'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ChevronDown, ImageOff, Package, ShoppingCart } from 'lucide-react'
import { useAuthStore } from '@/common/store/useAuthStore'
import { useCartStore } from '@/common/store/useCartStore'
import {
	UI_ROUTES,
	deliveryMethodLabel,
	orderStatusBadgeClass,
	orderStatusLabel,
	paymentMethodLabel
} from '@/common/constants'
import { formatMoney } from '@/common/utils/format'
import { ordersApi, type Order, type OrderItem } from '@/common/services/orders.api'
import { FullScreenLoader } from '@/common/components'

const formatDate = (iso: string) =>
	new Date(iso).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })

// Таби фільтрації за статусом; синоніми (done/canceled) — від старих записів
const TABS: { key: string; label: string; statuses?: string[] }[] = [
	{ key: 'all', label: 'Всі' },
	{ key: 'new', label: 'Нові' },
	{ key: 'processing', label: 'В обробці' },
	{ key: 'shipped', label: 'Відправлені' },
	{ key: 'completed', label: 'Виконані', statuses: ['completed', 'done'] },
	{ key: 'cancelled', label: 'Скасовані', statuses: ['cancelled', 'canceled'] }
]

const matchesTab = (order: Order, key: string): boolean => {
	if (key === 'all') return true
	const tab = TABS.find(t => t.key === key)
	return (tab?.statuses ?? [key]).includes(order.status)
}

// Гейт і навігація — в layout кабінету
export default function AccountOrdersPage() {
	const user = useAuthStore(s => s.user)
	const [tab, setTab] = useState('all')

	const { data, isPending, isError } = useQuery({
		queryKey: ['account-orders'],
		queryFn: ordersApi.accountOrders,
		enabled: !!user,
		staleTime: 30_000
	})

	if (!user) return null

	const orders = data ?? []
	const visible = orders.filter(o => matchesTab(o, tab))

	return (
		<>
			<h1 className='font-display text-2xl font-bold'>Мої замовлення</h1>
			<p className='text-muted-foreground mt-1 text-sm'>Історія та статуси замовлень</p>

			{/* Таби статусів */}
			<div className='border-border mt-6 flex gap-1 overflow-x-auto border-b'>
				{TABS.map(t => (
					<button
						key={t.key}
						type='button'
						onClick={() => setTab(t.key)}
						className={`-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
							tab === t.key
								? 'border-primary text-accent-text font-semibold'
								: 'text-muted-foreground hover:text-foreground border-transparent'
						}`}
					>
						{t.label}
					</button>
				))}
			</div>

			{isPending ? (
				<div className='py-20'>
					<FullScreenLoader />
				</div>
			) : isError ? (
				<p className='text-muted-foreground py-20 text-center text-sm'>
					Не вдалося завантажити замовлення. Спробуйте оновити сторінку.
				</p>
			) : visible.length === 0 ? (
				<div className='border-border bg-card mt-6 flex flex-col items-center rounded-2xl border px-6 py-16 text-center'>
					<div className='bg-muted mb-4 grid h-16 w-16 place-items-center rounded-full'>
						<Package className='text-muted-foreground h-8 w-8' />
					</div>
					<p className='text-lg font-semibold'>
						{orders.length === 0
							? 'Ви ще не робили замовлень'
							: 'Немає замовлень у цьому статусі'}
					</p>
					{orders.length === 0 && (
						<>
							<p className='text-muted-foreground mt-1 text-sm'>
								Оберіть запчастини в каталозі — і вони зʼявляться тут.
							</p>
							<Link
								href={UI_ROUTES.SHOP}
								className='bg-primary text-primary-foreground mt-6 flex h-11 items-center justify-center rounded-xl px-6 text-sm font-bold transition-opacity hover:opacity-90'
							>
								До каталогу
							</Link>
						</>
					)}
				</div>
			) : (
				<ul className='mt-6 flex flex-col gap-4'>
					{visible.map(order => (
						<OrderCard key={order.id} order={order} />
					))}
				</ul>
			)}
		</>
	)
}

const OrderCard = ({ order }: { order: Order }) => {
	const [expanded, setExpanded] = useState(false)
	const add = useCartStore(s => s.add)

	// «Купити ще раз»: додаємо в кошик позиції, які ще продаються;
	// ціна й наявність — поточні (з product), а не зі снапшоту замовлення
	const buyAgain = () => {
		let added = 0
		let skipped = 0
		for (const i of order.items) {
			const p = i.product
			if (!i.productId || !p || !p.isActive || p.stockQty <= 0) {
				skipped++
				continue
			}
			const res = add(
				{
					productId: i.productId,
					slug: p.slug,
					name: i.name,
					sku: i.sku,
					price: Number(p.price),
					image: p.image,
					stockQty: p.stockQty
				},
				i.qty
			)
			if (res.ok) added++
			else skipped++
		}
		if (added === 0) {
			toast.error('Цих товарів уже немає в наявності')
		} else if (skipped > 0) {
			toast.success(`Додано в кошик ${added} із ${added + skipped} позицій`)
		} else {
			toast.success('Товари додано в кошик')
		}
	}

	const canBuyAgain = order.items.some(
		i => i.productId && i.product && i.product.isActive && i.product.stockQty > 0
	)

	return (
		<li className='border-border bg-card rounded-2xl border p-5'>
			{/* Шапка: статус + дата/номер · разом */}
			<div className='flex flex-wrap items-center gap-x-4 gap-y-2'>
				<span
					className={`rounded-full px-3 py-1 text-xs font-bold ${orderStatusBadgeClass(order.status)}`}
				>
					{orderStatusLabel(order.status)}
				</span>
				<p className='text-muted-foreground text-sm'>
					{formatDate(order.createdAt)}
					<span className='mx-2'>·</span>№{order.orderNumber}
				</p>
				<p className='ml-auto text-sm'>
					Разом:{' '}
					<span className='text-base font-extrabold'>{formatMoney(order.total)}</span>
				</p>
			</div>

			<div className='border-border my-4 border-t' />

			{/* Превʼю позицій: 1 товар — рядок з деталями, кілька — мініатюри + лічильник */}
			{order.items.length === 1 ? (
				<SingleItemRow item={order.items[0]} />
			) : (
				<div className='flex items-center gap-3'>
					{order.items.slice(0, 2).map(i => (
						<ItemThumb key={i.id} item={i} />
					))}
					<div className='bg-muted text-muted-foreground grid h-20 w-20 shrink-0 place-items-center rounded-xl text-center text-xs font-semibold'>
						{order.items.length} поз.
					</div>
				</div>
			)}

			{/* Футер: деталі · купити ще раз */}
			<div className='mt-4 flex flex-wrap items-center justify-between gap-3'>
				<button
					type='button'
					onClick={() => setExpanded(v => !v)}
					className='text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm font-medium transition-colors'
				>
					Деталі
					<ChevronDown
						className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
					/>
				</button>
				{canBuyAgain && (
					<button
						type='button'
						onClick={buyAgain}
						className='border-border hover:bg-muted flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors'
					>
						<ShoppingCart className='h-4 w-4' />
						Купити ще раз
					</button>
				)}
			</div>

			{expanded && (
				<div className='border-border mt-4 border-t pt-4'>
					<ul className='flex flex-col gap-2 text-sm'>
						{order.items.map(i => (
							<li key={i.id} className='flex items-baseline justify-between gap-3'>
								<span className='text-muted-foreground'>
									<ItemName item={i} />{' '}
									<span className='whitespace-nowrap'>×{i.qty}</span>
								</span>
								<span className='shrink-0 font-semibold'>
									{formatMoney(Number(i.price) * i.qty)}
								</span>
							</li>
						))}
					</ul>
					<p className='text-muted-foreground mt-3 text-xs'>
						{deliveryMethodLabel(order.delivery.method)}
						{order.delivery.city ? ` · ${order.delivery.city}` : ''}
						{order.delivery.warehouse ? `, ${order.delivery.warehouse}` : ''}
						<span className='mx-2'>·</span>
						{paymentMethodLabel(order.payment.method)}
					</p>
					{order.comment && (
						<p className='text-muted-foreground mt-1 text-xs'>
							Коментар: {order.comment}
						</p>
					)}
				</div>
			)}
		</li>
	)
}

// Назва позиції: посилання на товар, поки він існує в каталозі
const ItemName = ({ item }: { item: OrderItem }) => {
	if (item.product?.slug && item.product.isActive) {
		return (
			<Link
				href={UI_ROUTES.PRODUCT(item.product.slug)}
				className='hover:text-accent-text transition-colors'
			>
				{item.name}
			</Link>
		)
	}
	return <>{item.name}</>
}

const ItemThumb = ({ item }: { item: OrderItem }) => {
	const img = item.product?.image
	const thumb = (
		<div className='bg-muted relative h-20 w-20 shrink-0 overflow-hidden rounded-xl'>
			{img ? (
				<Image src={img} alt={item.name} fill sizes='80px' className='object-cover' />
			) : (
				<ImageOff className='text-muted-foreground absolute inset-0 m-auto h-6 w-6' />
			)}
		</div>
	)
	if (item.product?.slug && item.product.isActive) {
		return (
			<Link href={UI_ROUTES.PRODUCT(item.product.slug)} title={item.name}>
				{thumb}
			</Link>
		)
	}
	return thumb
}

// Замовлення з однією позицією — рядок як у картці товару: фото, назва, ×qty, сума
const SingleItemRow = ({ item }: { item: OrderItem }) => (
	<div className='flex items-center gap-4'>
		<ItemThumb item={item} />
		<div className='min-w-0 flex-1'>
			<p className='truncate text-sm font-semibold'>
				<ItemName item={item} />
			</p>
			<p className='text-muted-foreground mt-0.5 font-mono text-xs'>{item.sku}</p>
		</div>
		<p className='text-muted-foreground shrink-0 text-sm'>×{item.qty}</p>
		<p className='shrink-0 font-semibold'>{formatMoney(Number(item.price) * item.qty)}</p>
	</div>
)
