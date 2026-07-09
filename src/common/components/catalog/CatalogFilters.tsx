'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, SlidersHorizontal, X } from 'lucide-react'
import type { Car, Category } from '@/common/types'

type Option = { v: string; l: string }

export const CatalogFilters = ({
	categories,
	cars,
	basePath = '/shop'
}: {
	categories: Category[]
	cars: Car[]
	basePath?: string
}) => {
	const router = useRouter()
	const sp = useSearchParams()
	const [open, setOpen] = useState(false)

	// блокування скролу body + закриття на Esc, поки відкрита мобільна панель
	useEffect(() => {
		if (!open) return
		document.body.style.overflow = 'hidden'
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
		window.addEventListener('keydown', onKey)
		return () => {
			document.body.style.overflow = ''
			window.removeEventListener('keydown', onKey)
		}
	}, [open])

	const setParam = (key: string, value: string) => {
		const params = new URLSearchParams(sp.toString())
		if (value) params.set(key, value)
		else params.delete(key)
		params.delete('page') // фільтр змінився — на першу сторінку
		router.push(`${basePath}?${params.toString()}`)
	}

	const carLabel = (c: Car) => (c.generation ? `${c.model} · ${c.generation}` : c.model)
	const activeCategory = sp.get('category') ?? ''
	const inStock = sp.get('inStock') === 'true'

	// Модель авто — мульти-вибір (кілька slug через кому)
	const selectedCars = (sp.get('car') ?? '').split(',').filter(Boolean)
	const toggleCar = (slug: string) => {
		const next = selectedCars.includes(slug)
			? selectedCars.filter(s => s !== slug)
			: [...selectedCars, slug]
		setParam('car', next.join(','))
	}

	// кількість активних фільтрів — для бейджа на мобільній кнопці
	const activeCount =
		selectedCars.length +
		(sp.get('type') ? 1 : 0) +
		(sp.get('condition') ? 1 : 0) +
		(inStock ? 1 : 0) +
		(activeCategory ? 1 : 0)

	const content = (
		<>
			<Group label='Модель авто'>
				<div className='flex flex-wrap gap-2'>
					{cars.map(c => {
						const active = selectedCars.includes(c.slug)
						return (
							<button
								key={c.id}
								type='button'
								onClick={() => toggleCar(c.slug)}
								className={
									'rounded-full px-3 py-1.5 text-sm transition-colors ' +
									(active
										? 'bg-primary text-primary-foreground font-medium'
										: 'border-border hover:bg-muted border')
								}
							>
								{carLabel(c)}
							</button>
						)
					})}
				</div>
			</Group>
			<Group label='Тип'>
				<Select
					value={sp.get('type') ?? ''}
					onChange={v => setParam('type', v)}
					options={[
						{ v: '', l: 'Будь-який' },
						{ v: 'original', l: 'Оригінал' },
						{ v: 'analog', l: 'Аналог' }
					]}
				/>
			</Group>
			<Group label='Стан'>
				<Select
					value={sp.get('condition') ?? ''}
					onChange={v => setParam('condition', v)}
					options={[
						{ v: '', l: 'Будь-який' },
						{ v: 'new', l: 'Новий' },
						{ v: 'used', l: 'Б/у' },
						{ v: 'clearance', l: 'Уцінка' }
					]}
				/>
			</Group>

			<label className='flex cursor-pointer items-center gap-2.5 text-sm font-medium select-none'>
				<input
					type='checkbox'
					className='sr-only'
					checked={inStock}
					onChange={e => setParam('inStock', e.target.checked ? 'true' : '')}
				/>
				<span
					className={
						'flex h-5 w-5 items-center justify-center rounded-md border transition-colors ' +
						(inStock ? 'bg-primary border-primary' : 'border-border')
					}
				>
					{inStock && <Check className='text-primary-foreground h-3.5 w-3.5' strokeWidth={3} />}
				</span>
				Лише в наявності
			</label>

			{/* Категорії — маркований список, унизу */}
			<div className='border-border border-t pt-5'>
				<p className='mb-2 text-sm font-semibold'>Категорія</p>
				<ul className='flex flex-col gap-0.5'>
					<CatItem active={!activeCategory} onClick={() => setParam('category', '')}>
						Усі категорії
					</CatItem>
					{categories.map(c => (
						<CatItem
							key={c.id}
							active={activeCategory === c.slug}
							onClick={() => setParam('category', c.slug)}
						>
							{c.name}
						</CatItem>
					))}
				</ul>
			</div>
		</>
	)

	return (
		<>
			{/* Десктоп — статичний сайдбар */}
			<aside className='border-border bg-card sticky top-20 hidden h-fit flex-col gap-5 rounded-2xl border p-5 lg:flex'>
				{content}
			</aside>

			{/* Мобайл — кнопка, що відкриває панель фільтрів */}
			<button
				type='button'
				onClick={() => setOpen(true)}
				className='border-border bg-card hover:bg-muted flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors lg:hidden'
			>
				<SlidersHorizontal className='h-4 w-4' />
				Фільтри
				{activeCount > 0 && (
					<span className='bg-primary text-primary-foreground flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold'>
						{activeCount}
					</span>
				)}
			</button>

			{/* Мобайл — бекдроп */}
			<div
				aria-hidden
				onClick={() => setOpen(false)}
				className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${
					open ? 'opacity-100' : 'pointer-events-none opacity-0'
				}`}
			/>

			{/* Мобайл — панель */}
			<aside
				role='dialog'
				aria-label='Фільтри'
				aria-hidden={!open}
				className={`bg-card fixed inset-y-0 left-0 z-50 flex w-full max-w-sm flex-col shadow-xl transition-transform duration-300 lg:hidden ${
					open ? 'translate-x-0' : '-translate-x-full'
				}`}
			>
				<div className='border-border flex h-16 shrink-0 items-center justify-between border-b px-5'>
					<h2 className='font-display text-lg font-medium'>Фільтри</h2>
					<button
						type='button'
						onClick={() => setOpen(false)}
						aria-label='Закрити'
						className='hover:bg-muted -mr-2 flex h-10 w-10 items-center justify-center rounded-xl'
					>
						<X className='h-5 w-5' />
					</button>
				</div>

				<div className='flex flex-1 flex-col gap-5 overflow-y-auto p-5'>{content}</div>

				<div className='border-border shrink-0 border-t p-5'>
					<button
						type='button'
						onClick={() => setOpen(false)}
						className='bg-primary text-primary-foreground flex h-12 w-full items-center justify-center rounded-xl text-sm font-bold transition-opacity hover:opacity-90'
					>
						Показати результати
					</button>
				</div>
			</aside>
		</>
	)
}

const CatItem = ({
	active,
	onClick,
	children
}: {
	active: boolean
	onClick: () => void
	children: React.ReactNode
}) => (
	<li>
		<button
			type='button'
			onClick={onClick}
			className={
				'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ' +
				(active ? 'text-accent-text font-semibold' : 'hover:bg-muted')
			}
		>
			<span
				className={
					'h-1.5 w-1.5 shrink-0 rounded-full ' + (active ? 'bg-accent-text' : 'bg-border')
				}
			/>
			{children}
		</button>
	</li>
)

const Group = ({ label, children }: { label: string; children: React.ReactNode }) => (
	<div>
		<p className='mb-1.5 text-sm font-semibold'>{label}</p>
		{children}
	</div>
)

const Select = ({
	value,
	onChange,
	options
}: {
	value: string
	onChange: (v: string) => void
	options: Option[]
}) => (
	<select
		value={value}
		onChange={e => onChange(e.target.value)}
		className='border-border bg-card focus:border-primary h-10 w-full rounded-lg border px-3 text-sm outline-none'
	>
		{options.map(o => (
			<option key={o.v} value={o.v}>
				{o.l}
			</option>
		))}
	</select>
)
