'use client'

import { useEffect, useRef, useState } from 'react'
import { Minus, Plus } from 'lucide-react'

interface Props {
	qty: number
	stockQty: number // 0 = «під замовлення», без верхньої межі
	onSet: (qty: number) => void // має клампити/видаляти при <=0 (store.setQty)
	size?: 'sm' | 'md'
	block?: boolean // на всю ширину (інпут розтягується)
	className?: string
}

const SIZES = {
	sm: { h: 'h-9', btn: 'w-9', icon: 'h-3.5 w-3.5', input: 'w-7', round: 'rounded-lg', rl: 'rounded-l-lg', rr: 'rounded-r-lg' },
	md: { h: 'h-11', btn: 'w-11', icon: 'h-4 w-4', input: 'w-10', round: 'rounded-xl', rl: 'rounded-l-xl', rr: 'rounded-r-xl' }
} as const

export const QtyStepper = ({ qty, stockQty, onSet, size = 'md', block, className }: Props) => {
	const [draft, setDraft] = useState(String(qty))
	const [warn, setWarn] = useState<string | null>(null)
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => setDraft(String(qty)), [qty])
	useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])

	const s = SIZES[size]
	const max = stockQty

	// інлайн-попередження, що зникає за 5с
	const showWarn = () => {
		setWarn(`В наявності тільки ${stockQty}`)
		if (timer.current) clearTimeout(timer.current)
		timer.current = setTimeout(() => setWarn(null), 5000)
	}

	const commit = (raw: string) => {
		const n = parseInt(raw, 10)
		if (!Number.isFinite(n) || n < 1) {
			setDraft(String(qty)) // невалідне — повертаємо поточне
			return
		}
		if (n > max) {
			showWarn()
			onSet(stockQty)
			setDraft(String(stockQty))
			return
		}
		onSet(n)
	}

	const inc = () => {
		if (qty >= max) showWarn()
		else onSet(qty + 1)
	}

	return (
		<div className={`relative ${block ? 'w-full' : 'w-fit'} ${className ?? ''}`}>
			<div className={`border-border flex items-center border shadow-lg ${s.h} ${s.round}`}>
				<button
					type='button'
					onClick={() => onSet(qty - 1)}
					aria-label='Менше'
					className={`hover:bg-muted flex h-full items-center justify-center ${s.btn} ${s.rl}`}
				>
					<Minus className={s.icon} />
				</button>
				<input
					inputMode='numeric'
					value={draft}
					onChange={e => setDraft(e.target.value.replace(/[^0-9]/g, ''))}
					onBlur={e => commit(e.target.value)}
					onKeyDown={e => {
						if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
					}}
					aria-label='Кількість'
					className={`h-full bg-transparent text-center text-sm font-bold tabular-nums outline-none ${
						block ? 'flex-1' : s.input
					}`}
				/>
				<button
					type='button'
					onClick={inc}
					aria-label='Більше'
					className={`hover:bg-muted flex h-full items-center justify-center ${s.btn} ${s.rr}`}
				>
					<Plus className={s.icon} />
				</button>
			</div>
			{warn && (
				<p className='absolute left-0 top-full mt-1 whitespace-nowrap text-xs font-medium text-red-500'>
					{warn}
				</p>
			)}
		</div>
	)
}
