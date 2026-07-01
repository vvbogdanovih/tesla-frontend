'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Heart, X } from 'lucide-react'
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

	useEffect(() => {
		if (!open) return
		document.body.style.overflow = 'hidden'
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
		window.addEventListener('keydown', onKey)
		return () => {
			document.body.style.overflow = ''
			window.removeEventListener('keydown', onKey)
		}
	}, [open, onClose])

	if (!open) return null

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
			<div aria-hidden className='absolute inset-0 bg-black/50' onClick={onClose} />
			<div
				role='dialog'
				aria-modal='true'
				aria-label={title}
				className='bg-card border-border text-foreground relative z-10 w-full max-w-sm rounded-2xl border p-6 text-center shadow-xl'
			>
				<button
					type='button'
					onClick={onClose}
					aria-label='Закрити'
					className='hover:bg-muted absolute top-3 right-3 rounded-md p-1'
				>
					<X className='h-5 w-5' />
				</button>

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
		</div>
	)
}
