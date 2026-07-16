'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart } from 'lucide-react'
import { Modal } from '@/common/components/ui/Modal'
import { UI_ROUTES } from '@/common/constants/ui-routes.constants'

interface Props {
	open: boolean
	onClose: () => void
	title?: string
	description?: string
}

// Попап, що пропонує увійти/зареєструватися для дій, доступних лише авторизованим
// (напр. додавання у список бажаного). Повертає користувача назад через ?next=.
export const LoginGateModal = ({
	open,
	onClose,
	title = 'Увійдіть, щоб зберегти',
	description = 'Список бажаного доступний авторизованим користувачам. Увійдіть або створіть акаунт — це швидко.'
}: Props) => {
	const pathname = usePathname()
	const next = encodeURIComponent(pathname || UI_ROUTES.HOME)

	return (
		<Modal open={open} onClose={onClose} ariaLabel={title} maxWidthClassName='max-w-sm'>
			<div className='text-center'>
				<div className='bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full'>
					<Heart className='text-accent-text h-6 w-6' />
				</div>

				<h2 className='font-display text-lg font-bold'>{title}</h2>
				<p className='text-muted-foreground mt-2 text-sm'>{description}</p>

				<div className='mt-6 flex flex-col gap-3'>
					<Link
						href={`${UI_ROUTES.LOGIN}?next=${next}`}
						onClick={onClose}
						className='bg-primary text-primary-foreground flex h-12 items-center justify-center rounded-xl text-sm font-bold transition-opacity hover:opacity-90'
					>
						Увійти
					</Link>
					<Link
						href={`${UI_ROUTES.REGISTER}?next=${next}`}
						onClick={onClose}
						className='border-border hover:bg-muted flex h-12 items-center justify-center rounded-xl border text-sm font-bold transition-colors'
					>
						Зареєструватися
					</Link>
				</div>
			</div>
		</Modal>
	)
}
