'use client'

import { useRouter, useSearchParams } from 'next/navigation'
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

	return (
		<aside className='flex flex-col gap-5'>
			<Group label='Категорія'>
				<Select
					value={sp.get('category') ?? ''}
					onChange={v => setParam('category', v)}
					options={[{ v: '', l: 'Усі категорії' }, ...categories.map(c => ({ v: c.slug, l: c.name }))]}
				/>
			</Group>
			<Group label='Модель авто'>
				<Select
					value={sp.get('car') ?? ''}
					onChange={v => setParam('car', v)}
					options={[{ v: '', l: 'Усі моделі' }, ...cars.map(c => ({ v: c.slug, l: carLabel(c) }))]}
				/>
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

			<label className='flex cursor-pointer items-center gap-2 text-sm font-medium'>
				<input
					type='checkbox'
					className='h-4 w-4'
					checked={sp.get('inStock') === 'true'}
					onChange={e => setParam('inStock', e.target.checked ? 'true' : '')}
				/>
				Лише в наявності
			</label>
		</aside>
	)
}

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
