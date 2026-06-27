import Link from 'next/link'
import { ShoppingCart, Heart, Search } from 'lucide-react'
import { UI_ROUTES } from '@/common/constants/ui-routes.constants'

export const Header = () => {
	return (
		<header className='border-border bg-card sticky top-0 z-20 border-b'>
			<div className='mx-auto flex max-w-[1240px] items-center gap-5 px-6 py-3.5'>
				<Link href={UI_ROUTES.HOME} className='font-display text-lg font-bold tracking-wide'>
					TESLA LVIV
				</Link>
				<nav className='flex gap-4 text-sm font-medium'>
					<Link href={UI_ROUTES.SHOP}>Магазин</Link>
					<Link href={UI_ROUTES.ABOUT}>Про нас</Link>
					<Link href={UI_ROUTES.CONTACTS}>Контакти</Link>
				</nav>
				<div className='bg-muted text-muted-foreground mx-auto flex max-w-md flex-1 items-center gap-2 rounded-lg px-3.5 py-2 text-sm'>
					<Search className='h-4 w-4' /> Пошук за назвою або артикулом…
				</div>
				<div className='flex items-center gap-3'>
					<Link href={UI_ROUTES.ACCOUNT} aria-label='Кабінет'>
						<Heart className='h-5 w-5' />
					</Link>
					<Link href={UI_ROUTES.CART} aria-label='Кошик'>
						<ShoppingCart className='h-5 w-5' />
					</Link>
				</div>
			</div>
		</header>
	)
}
