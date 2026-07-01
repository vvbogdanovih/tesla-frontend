'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Heart, LogOut, Package, User } from 'lucide-react'
import { useAuthStore } from '@/common/store/useAuthStore'
import { UI_ROUTES } from '@/common/constants/ui-routes.constants'
import { FullScreenLoader } from '@/common/components'

export default function AccountPage() {
	const router = useRouter()
	const user = useAuthStore(s => s.user)
	const isLoading = useAuthStore(s => s.isLoading)
	const logOut = useAuthStore(s => s.logOut)

	// Гейт: неавторизованих ведемо на вхід із поверненням у кабінет.
	useEffect(() => {
		if (!isLoading && !user) {
			router.replace(`${UI_ROUTES.LOGIN}?next=${encodeURIComponent(UI_ROUTES.ACCOUNT)}`)
		}
	}, [isLoading, user, router])

	const handleLogout = async () => {
		await logOut()
		toast.success('Ви вийшли')
		router.push(UI_ROUTES.HOME)
	}

	if (isLoading || !user) return <FullScreenLoader />

	const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Вітаємо!'

	return (
		<main className='mx-auto max-w-[1240px] px-6 py-10'>
			<div className='flex flex-wrap items-center justify-between gap-4'>
				<div className='flex items-center gap-4'>
					<div className='bg-muted grid h-14 w-14 place-items-center rounded-full'>
						<User className='h-7 w-7' />
					</div>
					<div>
						<h1 className='font-display text-2xl font-bold'>{fullName}</h1>
						{user.email && (
							<p className='text-muted-foreground text-sm'>{user.email}</p>
						)}
					</div>
				</div>
				<button
					type='button'
					onClick={handleLogout}
					className='border-border hover:bg-muted flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors'
				>
					<LogOut className='h-4 w-4' />
					Вийти
				</button>
			</div>

			{/* Профіль */}
			<section className='bg-card border-border mt-8 rounded-2xl border p-6'>
				<h2 className='font-display mb-4 text-lg font-bold'>Профіль</h2>
				<dl className='grid gap-x-8 gap-y-4 sm:grid-cols-2'>
					<Info label="Ім'я" value={user.firstName} />
					<Info label='Прізвище' value={user.lastName} />
					<Info label='Email' value={user.email} />
					<Info label='Телефон' value={user.phone} />
				</dl>
			</section>

			{/* Розділи (заглушки — реалізація згодом) */}
			<div className='mt-6 grid gap-4 sm:grid-cols-2'>
				<Tile
					href={UI_ROUTES.ACCOUNT_ORDERS}
					icon={<Package className='h-5 w-5' />}
					title='Мої замовлення'
					subtitle='Історія та статуси замовлень'
				/>
				<Tile
					href={UI_ROUTES.WISHLIST}
					icon={<Heart className='h-5 w-5' />}
					title='Обране'
					subtitle='Збережені товари'
				/>
			</div>
		</main>
	)
}

const Info = ({ label, value }: { label: string; value?: string }) => (
	<div>
		<dt className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
			{label}
		</dt>
		<dd className='mt-0.5 text-sm'>{value || '—'}</dd>
	</div>
)

const Tile = ({
	href,
	icon,
	title,
	subtitle
}: {
	href: string
	icon: React.ReactNode
	title: string
	subtitle: string
}) => (
	<Link
		href={href}
		className='bg-card border-border hover:border-primary group flex items-start gap-4 rounded-2xl border p-5 transition-colors'
	>
		<div className='bg-muted text-accent-text grid h-11 w-11 shrink-0 place-items-center rounded-xl'>
			{icon}
		</div>
		<div>
			<p className='font-semibold'>{title}</p>
			<p className='text-muted-foreground text-sm'>{subtitle}</p>
		</div>
	</Link>
)
