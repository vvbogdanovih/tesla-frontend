'use client'

import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'

// Перемикач світла/темна тема. Клас `.dark` на <html> (див. globals.css),
// вибір зберігається в localStorage; початкове значення виставляє інлайн-скрипт
// у layout ще до гідрації (без миготіння / FOUC).
//
// Стан читаємо напряму з DOM через useSyncExternalStore (без setState в ефекті):
// MutationObserver стежить за класом <html>, серверний знімок — світла тема.
const subscribe = (cb: () => void) => {
	const obs = new MutationObserver(cb)
	obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
	return () => obs.disconnect()
}
const isDark = () => document.documentElement.classList.contains('dark')

export const ThemeToggle = () => {
	const dark = useSyncExternalStore(subscribe, isDark, () => false)

	const toggle = () => {
		const next = !isDark()
		document.documentElement.classList.toggle('dark', next)
		try {
			localStorage.setItem('theme', next ? 'dark' : 'light')
		} catch {
			// приватний режим — просто не зберігаємо вибір
		}
	}

	return (
		<button
			type='button'
			onClick={toggle}
			aria-label={dark ? 'Світла тема' : 'Темна тема'}
			className='hover:text-accent-text cursor-pointer transition-colors'
		>
			{dark ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
		</button>
	)
}
