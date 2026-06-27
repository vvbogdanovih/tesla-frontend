import Link from 'next/link'
import { Button } from '@/common/components'
import { UI_ROUTES } from '@/common/constants/ui-routes.constants'

export default function NotFound() {
	return (
		<main className='flex min-h-screen flex-col items-center justify-center px-6 text-center'>
			<p className='font-display text-primary text-7xl font-medium'>404</p>
			<h1 className='mt-4 mb-2 text-2xl font-bold'>Сторінку не знайдено</h1>
			<p className='text-muted-foreground mb-8 max-w-md'>
				Можливо, її переміщено або видалено. Поверніться на головну або в каталог.
			</p>
			<div className='flex gap-3'>
				<Link href={UI_ROUTES.HOME}>
					<Button>На головну</Button>
				</Link>
				<Link href={UI_ROUTES.SHOP}>
					<Button variant='ghost'>Каталог</Button>
				</Link>
			</div>
		</main>
	)
}
