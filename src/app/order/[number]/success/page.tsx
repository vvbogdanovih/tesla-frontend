'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, PackageSearch } from 'lucide-react'
import {
	UI_ROUTES,
	deliveryMethodLabel,
	orderStatusBadgeClass,
	orderStatusLabel,
	paymentMethodLabel
} from '@/common/constants'
import { formatMoney } from '@/common/utils/format'
import { ordersApi, readLastOrder, type Order } from '@/common/services/orders.api'
import { IbanRequisites } from '@/common/components/checkout/IbanRequisites'
import { FullScreenLoader } from '@/common/components'

// sessionStorage — зовнішнє сховище: читаємо через useSyncExternalStore
// (серверний снапшот null → без розбіжностей із SSR-розміткою).
// Кеш стабілізує посилання, щоб getSnapshot не створював новий обʼєкт щорендера.
const emptySubscribe = () => () => {}
let stashCache: { key: string; value: Order | null } | undefined
const getStash = (orderNumber: string): Order | null => {
	if (!stashCache || stashCache.key !== orderNumber) {
		stashCache = { key: orderNumber, value: readLastOrder(orderNumber) }
	}
	return stashCache.value
}

export default function OrderSuccessPage() {
	const params = useParams<{ number: string }>()
	const orderNumber = decodeURIComponent(params.number)

	// Основне джерело — замовлення, збережене чекаутом у sessionStorage
	const stashed = useSyncExternalStore(
		emptySubscribe,
		() => getStash(orderNumber),
		() => null
	)

	// Фолбек — публічний lookup безпечних полів
	const { data: fetched, isPending } = useQuery({
		queryKey: ['order-summary', orderNumber],
		queryFn: () => ordersApi.byNumber(orderNumber),
		enabled: stashed === null,
		retry: false
	})

	const order = stashed ?? fetched

	if (!order && isPending) return <FullScreenLoader />

	if (!order) {
		return (
			<main className='mx-auto max-w-[640px] px-6 py-16 text-center'>
				<PackageSearch className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
				<h1 className='font-display text-2xl font-medium'>Замовлення не знайдено</h1>
				<p className='text-muted-foreground mt-2 text-sm'>
					Не вдалося знайти замовлення №{orderNumber}. Якщо ви щойно його оформили —
					напишіть нам, і ми допоможемо.
				</p>
				<div className='mt-8 flex flex-wrap justify-center gap-3'>
					<Ctas />
				</div>
			</main>
		)
	}

	return (
		<main className='mx-auto max-w-[640px] px-6 py-12'>
			<div className='border-border bg-card rounded-2xl border p-6 text-center sm:p-8'>
				<CheckCircle2 className='text-success mx-auto mb-4 h-14 w-14' />
				<h1 className='font-display text-2xl font-medium'>Замовлення оформлено</h1>
				<p className='text-muted-foreground mt-2 text-sm'>
					Дякуємо! Ми вже його обробляємо.
				</p>

				<p className='font-display mt-5 text-3xl font-bold tracking-wide'>
					№{order.orderNumber}
				</p>
				<span
					className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${orderStatusBadgeClass(order.status)}`}
				>
					{orderStatusLabel(order.status)}
				</span>

				<dl className='border-border mt-6 border-t pt-5 text-left text-sm'>
					<div className='flex justify-between py-1.5'>
						<dt className='text-muted-foreground'>До сплати</dt>
						<dd className='font-extrabold'>{formatMoney(order.total)}</dd>
					</div>
					<div className='flex justify-between py-1.5'>
						<dt className='text-muted-foreground'>Оплата</dt>
						<dd className='font-semibold'>
							{paymentMethodLabel(order.payment.method)}
						</dd>
					</div>
					{stashed && (
						<div className='flex justify-between gap-4 py-1.5'>
							<dt className='text-muted-foreground'>Доставка</dt>
							<dd className='text-right font-semibold'>
								{deliveryMethodLabel(stashed.delivery.method)}
								{stashed.delivery.city ? `, ${stashed.delivery.city}` : ''}
								{stashed.delivery.warehouse
									? `, ${stashed.delivery.warehouse}`
									: ''}
							</dd>
						</div>
					)}
				</dl>

				{stashed && stashed.items.length > 0 && (
					<div className='border-border mt-2 border-t pt-4 text-left'>
						<p className='text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase'>
							Склад замовлення
						</p>
						<ul className='flex flex-col gap-2 text-sm'>
							{stashed.items.map(i => (
								<li
									key={i.id}
									className='flex items-baseline justify-between gap-3'
								>
									<span className='text-muted-foreground'>
										{i.name} <span className='whitespace-nowrap'>×{i.qty}</span>
									</span>
									<span className='shrink-0 font-semibold'>
										{formatMoney(Number(i.price) * i.qty)}
									</span>
								</li>
							))}
						</ul>
					</div>
				)}

				{order.payment.method === 'iban' && (
					<div className='mt-4 text-left'>
						<IbanRequisites orderNumber={order.orderNumber} />
					</div>
				)}

				<div className='mt-8 flex flex-wrap justify-center gap-3'>
					<Ctas />
				</div>
			</div>
		</main>
	)
}

const Ctas = () => (
	<>
		<Link
			href={UI_ROUTES.SHOP}
			className='bg-primary text-primary-foreground flex h-12 items-center rounded-xl px-6 text-sm font-bold transition-opacity hover:opacity-90'
		>
			До каталогу
		</Link>
		<Link
			href={UI_ROUTES.HOME}
			className='border-border hover:bg-muted flex h-12 items-center rounded-xl border px-6 text-sm font-bold transition-colors'
		>
			На головну
		</Link>
	</>
)
