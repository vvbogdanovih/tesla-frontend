'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface Props {
	open: boolean
	onClose: () => void
	title?: string
	ariaLabel?: string
	maxWidthClassName?: string
	children: React.ReactNode
}

// Спільне модальне вікно: Escape, scroll-lock на body, фокус на панель при
// відкритті та повернення фокуса на попередній активний елемент (тригер)
// при закритті. Повний focus-trap — свідомо поза скоупом (див. PLAN-P2 F3).
// З title — рядок заголовка з кнопкою закриття; без title — кнопка у куті
// (aria-ім'я тоді дає ariaLabel).
export const Modal = ({
	open,
	onClose,
	title,
	ariaLabel,
	maxWidthClassName = 'max-w-md',
	children
}: Props) => {
	const panelRef = useRef<HTMLDivElement>(null)
	const restoreRef = useRef<HTMLElement | null>(null)

	useEffect(() => {
		if (!open) return
		restoreRef.current = document.activeElement as HTMLElement | null
		document.body.style.overflow = 'hidden'
		panelRef.current?.focus()
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
		window.addEventListener('keydown', onKey)
		return () => {
			document.body.style.overflow = ''
			window.removeEventListener('keydown', onKey)
			restoreRef.current?.focus()
		}
	}, [open, onClose])

	if (!open) return null

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
			<div aria-hidden className='absolute inset-0 bg-black/50' onClick={onClose} />
			<div
				ref={panelRef}
				tabIndex={-1}
				role='dialog'
				aria-modal='true'
				aria-label={ariaLabel ?? title}
				className={`bg-card border-border text-foreground relative z-10 w-full ${maxWidthClassName} rounded-2xl border p-6 shadow-xl outline-none`}
			>
				{title ? (
					<div className='mb-4 flex items-center justify-between'>
						<h2 className='font-display text-lg font-bold'>{title}</h2>
						<button
							type='button'
							onClick={onClose}
							className='hover:bg-muted rounded-md p-1'
							aria-label='Закрити'
						>
							<X className='h-5 w-5' />
						</button>
					</div>
				) : (
					<button
						type='button'
						onClick={onClose}
						className='hover:bg-muted absolute top-3 right-3 rounded-md p-1'
						aria-label='Закрити'
					>
						<X className='h-5 w-5' />
					</button>
				)}
				{children}
			</div>
		</div>
	)
}
