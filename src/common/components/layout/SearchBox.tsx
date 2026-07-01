'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Loader2, Search } from 'lucide-react'
import { API_BASE_URL, API_URLS, UI_ROUTES } from '@/common/constants'
import { formatMoney } from '@/common/utils/format'
import type { SearchItem } from '@/common/types'

export const SearchBox = ({
	transparent = false,
	large = false,
	className
}: {
	transparent?: boolean
	large?: boolean
	className?: string
}) => {
	const router = useRouter()
	const ref = useRef<HTMLDivElement>(null)
	const [q, setQ] = useState('')
	const [items, setItems] = useState<SearchItem[]>([])
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)

	// debounced автодоповнення (pg_trgm)
	useEffect(() => {
		const term = q.trim()
		if (term.length < 2) {
			setItems([])
			setLoading(false)
			return
		}
		setLoading(true)
		const t = setTimeout(async () => {
			try {
				const res = await fetch(
					`${API_BASE_URL}${API_URLS.CATALOG.SEARCH}?q=${encodeURIComponent(term)}`
				)
				setItems(res.ok ? await res.json() : [])
			} catch {
				setItems([])
			} finally {
				setLoading(false)
			}
		}, 250)
		return () => clearTimeout(t)
	}, [q])

	useEffect(() => {
		const onClick = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
		}
		document.addEventListener('mousedown', onClick)
		return () => document.removeEventListener('mousedown', onClick)
	}, [])

	const goToResults = () => {
		const term = q.trim()
		if (!term) return
		router.push(`${UI_ROUTES.SHOP}?q=${encodeURIComponent(term)}`)
		setOpen(false)
	}

	const term = q.trim()

	return (
		<div ref={ref} className={className ?? 'relative mx-auto max-w-md flex-1'}>
			<form
				onSubmit={e => {
					e.preventDefault()
					goToResults()
				}}
				className={
					'flex items-center gap-2 transition-colors ' +
					(large ? 'rounded-2xl px-5 py-4 text-base ' : 'rounded-lg px-3.5 py-2 ') +
					(transparent
						? 'border border-white/20 bg-white/10 text-white backdrop-blur'
						: 'bg-muted text-muted-foreground')
				}
			>
				<Search className='h-4 w-4 shrink-0 opacity-70' />
				<input
					value={q}
					onChange={e => {
						setQ(e.target.value)
						setOpen(true)
					}}
					onFocus={() => setOpen(true)}
					placeholder='Пошук за назвою або артикулом…'
					className={
						'w-full bg-transparent text-sm outline-none ' +
						(transparent
							? 'text-white placeholder:text-white/60'
							: 'text-foreground placeholder:text-muted-foreground')
					}
				/>
				{loading && <Loader2 className='text-muted-foreground h-4 w-4 shrink-0 animate-spin' />}
			</form>

			{open && term.length >= 2 && (
				<div className='border-border bg-card text-foreground absolute top-full right-0 left-0 z-30 mt-2 overflow-hidden rounded-xl border shadow-xl'>
					{items.length === 0 ? (
						<div className='text-muted-foreground p-4 text-sm'>
							{loading ? 'Пошук…' : 'Нічого не знайдено'}
						</div>
					) : (
						<>
							{items.map(it => (
								<Link
									key={it.id}
									href={UI_ROUTES.PRODUCT(it.slug)}
									onClick={() => setOpen(false)}
									className='hover:bg-muted flex items-center gap-3 px-3 py-2'
								>
									<div className='bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded-md'>
										{it.images[0] && (
											<Image
												src={it.images[0].url}
												alt={it.name}
												fill
												sizes='40px'
												className='object-cover'
											/>
										)}
									</div>
									<div className='min-w-0 flex-1'>
										<div className='truncate text-sm font-medium'>{it.name}</div>
										<div className='text-muted-foreground font-mono text-xs'>{it.sku}</div>
									</div>
									<div className='shrink-0 text-sm font-semibold'>{formatMoney(it.price)}</div>
								</Link>
							))}
							<button
								type='button'
								onClick={goToResults}
								className='border-border text-accent-text hover:bg-muted w-full border-t px-3 py-2.5 text-left text-sm font-semibold'
							>
								Усі результати за «{term}» →
							</button>
						</>
					)}
				</div>
			)}
		</div>
	)
}
