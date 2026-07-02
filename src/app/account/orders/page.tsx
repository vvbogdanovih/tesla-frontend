'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronLeft, Package } from 'lucide-react'
import { useAuthStore } from '@/common/store/useAuthStore'
import {
	UI_ROUTES,
	orderStatusBadgeClass,
	orderStatusLabel,
	paymentMethodLabel
} from '@/common/constants'
import { formatMoney } from '@/common/utils/format'
import { ordersApi, type Order } from '@/common/services/orders.api'
import { FullScreenLoader } from '@/common/components'

const formatDate = (iso: string) =>
	new Date(iso).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })

export default function AccountOrdersPage() {
	const router = useRouter()
	const user = useAuthStore(s => s.user)
	const isAuthLoading = useAuthStore(s => s.isLoading)

	// Гейт: неавторизованих ведемо на вхід із поверненням до історії замовлень.
	useEffect(() => {
		if (!isAuthLoading && !user) {
			router.replace(
				`${UI_ROUTES.LOGIN}?next=${encodeURIComponent(UI_ROUTES.ACCOUNT_ORDERS)}`
			)
		}
	}, [isAuthLoading, user, router])

	const { data, isPending, isError } = useQuery({
		queryKey: ['account-orders'],
		queryFn: ordersApi.accountOrders,
		enabled: !!user,
		staleTime: 30_000
	})

	if (isAuthLoading || !user) return <FullScreenLoader />

	const orders = data ?? []

	return (
		<main className='mx-auto max-w-[840px] px-6 py-10'>
			<Link
				href={UI_ROUTES.ACCOUNT}
				className='text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm'
			>
				<ChevronLeft className='h-4 w-4' />
				Кабінет
			</Link>
			<h1 className='font-display text-2xl font-bold'>Мої замовлення</h1>
			<p className='text-muted-foreground mt-1 text-sm'>Історія та статуси замовлень</p>

			{isPending ? (
				<div className='py-20'>
					<FullScreenLoader />
				</div>
			) : isError ? (
				<p className='text-muted-foreground py-20 text-center text-sm'>
					Не вдалося завантажити замовлення. Спробуйте оновити сторінку.
				</p>
			) : orders.length === 0 ? (
				<div className='border-border bg-card mt-8 flex flex-col items-center rounded-2xl border px-6 py-16 text-center'>
					<div className='bg-muted mb-4 grid h-16 w-16 place-items-center rounded-full'>
						<Package className='text-muted-foreground h-8 w-8' />
					</div>
					<p className='text-lg font-semibold'>Ви ще не робили замовлень</p>
					<p className='text-muted-foreground mt-1 text-sm'>
						Оберіть запчастини в каталозі — і вони зʼявляться тут.
					</p>
					<Link
						href={UI_ROUTES.SHOP}
						className='bg-primary text-primary-foreground mt-6 flex h-11 items-center justify-center rounded-xl px-6 text-sm font-bold transition-opacity hover:opacity-90'
					>
						До каталогу
					</Link>
				</div>
			) : (
				<ul className='mt-8 flex flex-col gap-4'>
					{orders.map(order => (
						<OrderCard key={order.id} order={order} />
					))}
				</ul>
			)}
		</main>
	)
}

const OrderCard = ({ order }: { order: Order }) => (
	<li className='border-border bg-card rounded-2xl border'>
		<details className='group'>
			<summary className='flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-2 p-5 [&::-webkit-details-marker]:hidden'>
				<div className='min-w-0'>
					<p className='font-semibold'>№{order.orderNumber}</p>
					<p className='text-muted-foreground text-xs'>{formatDate(order.createdAt)}</p>
				</div>
				<span
					className={`rounded-full px-3 py-1 text-xs font-bold ${orderStatusBadgeClass(order.status)}`}
				>
					{orderStatusLabel(order.status)}
				</span>
				<div className='ml-auto text-right'>
					<p className='font-extrabold'>{formatMoney(order.total)}</p>
					<p className='text-muted-foreground text-xs'>
						{paymentMethodLabel(order.payment.method)}
					</p>
				</div>
				<ChevronDown className='text-muted-foreground h-5 w-5 shrink-0 transition-transform group-open:rotate-180' />
			</summary>

			<div className='border-border border-t px-5 py-4'>
				<ul className='flex flex-col gap-2 text-sm'>
					{order.items.map(i => (
						<li key={i.id} className='flex items-baseline justify-between gap-3'>
							<span className='text-muted-foreground'>
								{i.name} <span className='whitespace-nowrap'>×{i.qty}</span>
							</span>
							<span className='shrink-0 font-semibold'>
								{formatMoney(Number(i.price) * i.qty)}
							</span>
						</li>
					))}
				</ul>
				{order.comment && (
					<p className='text-muted-foreground mt-3 text-xs'>Коментар: {order.comment}</p>
				)}
			</div>
		</details>
	</li>
)
