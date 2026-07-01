'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Check } from 'lucide-react'
import type { Car, Category } from '@/common/types'

type Option = { v: string; l: string }

export const CatalogFilters = ({ categories, cars }: { categories: Category[]; cars: Car[] }) => {
	const router = useRouter()
	const sp = useSearchParams()

	const setParam = (key: string, value: string) => {
		const params = new URLSearchParams(sp.toString())
		if (value) params.set(key, value)
		else params.delete(key)
		params.delete('page') // фільтр змінився — на першу сторінку
		router.push(`/shop?${params.toString()}`)
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

	return (
		<aside className='border-border bg-card sticky top-20 flex h-fit flex-col gap-5 rounded-2xl border p-5'>
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
		</aside>
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
