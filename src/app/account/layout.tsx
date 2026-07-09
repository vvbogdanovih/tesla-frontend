'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Heart, LogOut, MapPin, Package, User } from 'lucide-react'
import { useAuthStore } from '@/common/store/useAuthStore'
import { UI_ROUTES } from '@/common/constants'
import { FullScreenLoader } from '@/common/components'

// Заголовки сторінок кабінету — для хлібних крихт
const TITLES: Record<string, string> = {
	[UI_ROUTES.ACCOUNT]: 'Огляд акаунта',
	[UI_ROUTES.ACCOUNT_ORDERS]: 'Мої замовлення',
	[UI_ROUTES.ACCOUNT_ADDRESSES]: 'Адреси доставки'
}

// Спільний каркас кабінету: єдиний auth-гейт, хлібні крихти,
// сайдбар-навігація (на мобільному — горизонтальна стрічка) + контент.
export default function AccountLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter()
	const pathname = usePathname()
	const user = useAuthStore(s => s.user)
	const isLoading = useAuthStore(s => s.isLoading)
	const logOut = useAuthStore(s => s.logOut)

	// Гейт: неавторизованих ведемо на вхід із поверненням на поточну сторінку
	useEffect(() => {
		if (!isLoading && !user) {
			router.replace(`${UI_ROUTES.LOGIN}?next=${encodeURIComponent(pathname)}`)
		}
	}, [isLoading, user, router, pathname])

	if (isLoading || !user) return <FullScreenLoader />

	const handleLogout = async () => {
		await logOut()
		toast.success('Ви вийшли')
		router.push(UI_ROUTES.HOME)
	}

	const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Мій акаунт'

	return (
		<main className='mx-auto max-w-[1240px] px-6 py-8'>
			<nav className='text-muted-foreground mb-6 flex items-center gap-1.5 text-sm'>
				<Link href={UI_ROUTES.HOME} className='hover:text-foreground transition-colors'>
					Головна
				</Link>
				<span>/</span>
				<span className='text-foreground font-semibold'>
					{TITLES[pathname] ?? 'Кабінет'}
				</span>
			</nav>

			<div className='grid items-start gap-6 lg:grid-cols-[280px_1fr]'>
				<aside className='border-border bg-card rounded-2xl border p-4 lg:sticky lg:top-24'>
					<div className='mb-3 flex items-center gap-3 px-2 pt-1'>
						<div className='bg-muted grid h-10 w-10 shrink-0 place-items-center rounded-full'>
							<User className='h-5 w-5' />
						</div>
						<div className='min-w-0'>
							<p className='truncate text-sm font-semibold'>{fullName}</p>
							{user.email && (
								<p className='text-muted-foreground truncate text-xs'>
									{user.email}
								</p>
							)}
						</div>
					</div>

					<nav className='flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0'>
						<NavItem
							href={UI_ROUTES.ACCOUNT}
							active={pathname === UI_ROUTES.ACCOUNT}
							icon={<User className='h-4 w-4' />}
						>
							Огляд акаунта
						</NavItem>

						<SectionLabel>Акаунт</SectionLabel>
						<NavItem
							href={UI_ROUTES.ACCOUNT_ORDERS}
							active={pathname === UI_ROUTES.ACCOUNT_ORDERS}
							icon={<Package className='h-4 w-4' />}
						>
							Мої замовлення
						</NavItem>
						<NavItem
							href={UI_ROUTES.ACCOUNT_ADDRESSES}
							active={pathname === UI_ROUTES.ACCOUNT_ADDRESSES}
							icon={<MapPin className='h-4 w-4' />}
						>
							Адреси доставки
						</NavItem>

						<SectionLabel>Списки</SectionLabel>
						<NavItem
							href={UI_ROUTES.WISHLIST}
							active={false}
							icon={<Heart className='h-4 w-4' />}
						>
							Обране
						</NavItem>

						<div className='border-border my-2 hidden border-t lg:block' />
						<button
							type='button'
							onClick={handleLogout}
							className='hover:bg-muted flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors'
						>
							<LogOut className='h-4 w-4' />
							Вийти
						</button>
					</nav>
				</aside>

				<div className='min-w-0'>{children}</div>
			</div>
		</main>
	)
}

const NavItem = ({
	href,
	active,
	icon,
	children
}: {
	href: string
	active: boolean
	icon: React.ReactNode
	children: React.ReactNode
}) => (
	<Link
		href={href}
		className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
			active ? 'bg-muted text-accent-text font-semibold' : 'hover:bg-muted/50 font-medium'
		}`}
	>
		{icon}
		{children}
	</Link>
)

// Підпис секції — лише на десктопі (у мобільній стрічці зайвий)
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
	<p className='text-muted-foreground mt-3 mb-1 hidden px-3 text-xs font-medium tracking-wide uppercase lg:block'>
		{children}
	</p>
)
