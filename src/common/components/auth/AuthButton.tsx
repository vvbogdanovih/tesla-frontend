'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { LogIn, LogOut, User } from 'lucide-react'
import { UI_ROUTES } from '@/common/constants/ui-routes.constants'
import { useAuthStore } from '@/common/store/useAuthStore'

// Кнопка-іконка в хедері.
// Залогінений → значок акаунта з меню (Кабінет / Вийти).
// Неавторизований → значок входу (→ /auth/login). Поки триває checkAuth — плейсхолдер.
export const AuthButton = () => {
	const isLoggedIn = useAuthStore(s => !!s.user)
	const isLoading = useAuthStore(s => s.isLoading)
	const logOut = useAuthStore(s => s.logOut)
	const pathname = usePathname()
	const router = useRouter()

	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	// Закриття меню по кліку поза ним та по Esc.
	useEffect(() => {
		if (!open) return
		const onClick = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
		}
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
		document.addEventListener('mousedown', onClick)
		window.addEventListener('keydown', onKey)
		return () => {
			document.removeEventListener('mousedown', onClick)
			window.removeEventListener('keydown', onKey)
		}
	}, [open])

	const handleLogout = async () => {
		setOpen(false)
		await logOut()
		toast.success('Ви вийшли')
		router.push(UI_ROUTES.HOME)
	}

	if (isLoading) {
		return <span aria-hidden className='bg-muted h-5 w-5 rounded-full' />
	}

	if (isLoggedIn) {
		return (
			<div ref={ref} className='relative'>
				<button
					type='button'
					onClick={() => setOpen(o => !o)}
					aria-label='Акаунт'
					aria-haspopup='menu'
					aria-expanded={open}
					className='cursor-pointer'
				>
					<User className='h-5 w-5' />
				</button>
				{open && (
					<div
						role='menu'
						className='bg-card border-border text-foreground absolute top-full right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border py-1 shadow-xl'
					>
						<Link
							href={UI_ROUTES.ACCOUNT}
							role='menuitem'
							onClick={() => setOpen(false)}
							className='hover:bg-muted flex items-center gap-2 px-4 py-2.5 text-sm'
						>
							<User className='h-4 w-4' />
							Кабінет
						</Link>
						<button
							type='button'
							role='menuitem'
							onClick={handleLogout}
							className='hover:bg-muted flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm'
						>
							<LogOut className='h-4 w-4' />
							Вийти
						</button>
					</div>
				)}
			</div>
		)
	}

	const next = encodeURIComponent(pathname || UI_ROUTES.HOME)

	return (
		<Link
			href={`${UI_ROUTES.LOGIN}?next=${next}`}
			aria-label='Увійти'
			className='cursor-pointer'
		>
			<LogIn className='h-5 w-5' />
		</Link>
	)
}
