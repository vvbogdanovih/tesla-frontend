'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const OPTIONS = [
	{ v: 'default', l: 'За замовчуванням' },
	{ v: 'newest', l: 'Спочатку нові' },
	{ v: 'price_asc', l: 'Дешевші спершу' },
	{ v: 'price_desc', l: 'Дорожчі спершу' }
]

export const SortSelect = () => {
	const router = useRouter()
	const sp = useSearchParams()

	const onChange = (value: string) => {
		const params = new URLSearchParams(sp.toString())
		if (value && value !== 'default') params.set('sort', value)
		else params.delete('sort')
		params.delete('page')
		router.push(`/shop?${params.toString()}`)
	}

	return (
		<select
			value={sp.get('sort') ?? 'default'}
			onChange={e => onChange(e.target.value)}
			className='border-border bg-card focus:border-primary h-10 rounded-lg border px-3 text-sm outline-none'
		>
			{OPTIONS.map(o => (
				<option key={o.v} value={o.v}>
					{o.l}
				</option>
			))}
		</select>
	)
}
