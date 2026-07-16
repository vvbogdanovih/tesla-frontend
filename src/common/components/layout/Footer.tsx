import Link from 'next/link'
import { UI_ROUTES } from '@/common/constants/ui-routes.constants'
import {
	CONTACT_CITY,
	CONTACT_EMAIL,
	CONTACT_PHONE_DISPLAY,
	CONTACT_PHONE_E164
} from '@/common/constants/contacts.constants'

export const Footer = () => {
	return (
		<footer className='border-border bg-card mt-16 border-t'>
			<div className='text-muted-foreground mx-auto grid max-w-[1240px] grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4'>
				<div>
					<div className='font-display text-foreground mb-3 text-lg font-bold'>
						TESLA LVIV
					</div>
					<p className='text-sm'>Оригінальні та аналогові запчастини Tesla в Україні.</p>
				</div>
				<div>
					<h4 className='text-foreground mb-3 text-sm font-bold'>Магазин</h4>
					<Link href={UI_ROUTES.SHOP} className='block py-1 text-sm'>
						Усі категорії
					</Link>
					<Link href={UI_ROUTES.PRICE_SHEET} className='block py-1 text-sm'>
						Прайс-лист
					</Link>
				</div>
				<div>
					<h4 className='text-foreground mb-3 text-sm font-bold'>Інформація</h4>
					<Link href={UI_ROUTES.ABOUT} className='block py-1 text-sm'>
						Про нас
					</Link>
					<Link href={UI_ROUTES.CONTACTS} className='block py-1 text-sm'>
						Контакти
					</Link>
				</div>
				<div>
					<h4 className='text-foreground mb-3 text-sm font-bold'>Контакти</h4>
					<p className='text-sm'>{CONTACT_CITY}</p>
					<a href={`tel:${CONTACT_PHONE_E164}`} className='block py-1 text-sm'>
						{CONTACT_PHONE_DISPLAY}
					</a>
					<a href={`mailto:${CONTACT_EMAIL}`} className='block py-1 text-sm'>
						{CONTACT_EMAIL}
					</a>
				</div>
			</div>
			<div className='border-border text-muted-foreground border-t py-4 text-center text-xs'>
				© {new Date().getFullYear()} Tesla Lviv. Усі права захищено.
			</div>
		</footer>
	)
}
