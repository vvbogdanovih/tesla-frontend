'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ShoppingCart, Heart } from 'lucide-react'
import { UI_ROUTES } from '@/common/constants/ui-routes.constants'
import { useCartCount, useCartStore } from '@/common/store/useCartStore'
import { SearchBox } from './SearchBox'

export const Header = () => {
	const pathname = usePathname()
	const isHome = pathname === '/'
	const [scrolled, setScrolled] = useState(false)
	const count = useCartCount()
	const hydrated = useCartStore(s => s.hasHydrated)
	const openCart = useCartStore(s => s.open)

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 20)
		onScroll()
		window.addEventListener('scroll', onScroll, { passive: true })
		return () => window.removeEventListener('scroll', onScroll)
	}, [])

	// Прозорий лише на головній зверху (над темним hero); далі — суцільний
	const transparent = isHome && !scrolled

	return (
		<>
			<header
				className={
					'fixed inset-x-0 top-0 z-30 transition-colors duration-300 ' +
					(transparent
						? 'border-b border-transparent bg-transparent text-white'
						: 'border-border bg-card text-foreground border-b')
				}
			>
				<div className='mx-auto flex h-16 max-w-[1240px] items-center gap-5 px-6'>
					<Link href={UI_ROUTES.HOME} className='font-display text-lg font-bold tracking-wide'>
						TESLA LVIV
					</Link>
					<nav className='hidden gap-4 text-sm font-medium md:flex'>
						<Link href={UI_ROUTES.SHOP}>Магазин</Link>
						<Link href={UI_ROUTES.ABOUT}>Про нас</Link>
						<Link href={UI_ROUTES.CONTACTS}>Контакти</Link>
					</nav>
					<SearchBox transparent={transparent} />
					<div className='flex items-center gap-3'>
						<Link href={UI_ROUTES.ACCOUNT} aria-label='Кабінет'>
							<Heart className='h-5 w-5' />
						</Link>
						<button
							type='button'
							onClick={openCart}
							aria-label='Кошик'
							className='relative cursor-pointer'
						>
							<ShoppingCart className='h-5 w-5' />
							{hydrated && count > 0 && (
								<span className='bg-primary text-primary-foreground absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold leading-none'>
									{count}
								</span>
							)}
						</button>
					</div>
				</div>
			</header>
			{/* відступ під фіксований хедер (на головній hero заходить під нього) */}
			{!isHome && <div className='h-16' />}
		</>
	)
}
