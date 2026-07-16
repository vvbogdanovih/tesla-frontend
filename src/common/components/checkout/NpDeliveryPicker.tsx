'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { API_BASE_URL, API_URLS } from '@/common/constants'
import { authInputClass } from '@/common/components/auth/parts'

export type NpWarehouseType = 'branch' | 'postomat' | 'cargo'

// Значення, які компонент комітить у форму чекауту (снапшот замовлення)
export interface NpDeliveryValue {
	city?: string
	cityRef?: string
	warehouse?: string
	warehouseRef?: string
	warehouseType?: NpWarehouseType
}

interface Option {
	value: string
	label: string
	sub?: string
}

interface CityRow {
	ref: string
	name: string
	area: string | null
}
interface WarehouseRow {
	ref: string
	number: string
	description: string
	type: NpWarehouseType
}

const npGet = async <T,>(url: string, params: Record<string, string>): Promise<T> => {
	const qs = new URLSearchParams(params).toString()
	const res = await fetch(`${API_BASE_URL}${url}?${qs}`)
	if (!res.ok) throw new Error('np fetch failed')
	return res.json()
}

// Асинхронний combobox: debounce-пошук, випадний список, вибір мишею
const AsyncSelect = ({
	fetcher,
	onSelect,
	placeholder,
	disabled = false,
	error,
	minChars = 1
}: {
	fetcher: (q: string) => Promise<Option[]>
	onSelect: (o: Option) => void
	placeholder: string
	disabled?: boolean
	error?: string
	minChars?: number
}) => {
	const [q, setQ] = useState('')
	const [items, setItems] = useState<Option[]>([])
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const skip = useRef(false) // не перезапускати пошук одразу після вибору
	const box = useRef<HTMLDivElement>(null)

	// синхронні оновлення items/loading живуть в onChange інпута —
	// в ефекті лишився тільки debounce-таймер із фетчем
	useEffect(() => {
		if (disabled) return
		if (skip.current) {
			skip.current = false
			return
		}
		const term = q.trim()
		if (term.length < minChars) return
		const t = setTimeout(async () => {
			try {
				const res = await fetcher(term)
				setItems(res)
				setOpen(true)
			} catch {
				setItems([])
			} finally {
				setLoading(false)
			}
		}, 250)
		return () => clearTimeout(t)
	}, [q, disabled, fetcher, minChars])

	useEffect(() => {
		const onClick = (e: MouseEvent) => {
			if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
		}
		document.addEventListener('mousedown', onClick)
		return () => document.removeEventListener('mousedown', onClick)
	}, [])

	const pick = (o: Option) => {
		skip.current = true
		setQ(o.label)
		setOpen(false)
		onSelect(o)
	}

	return (
		<div ref={box} className='relative'>
			<div className='relative'>
				<input
					className={`${authInputClass} ${error ? 'border-red-500' : ''}`}
					placeholder={placeholder}
					disabled={disabled}
					value={q}
					onChange={e => {
						const value = e.target.value
						setQ(value)
						if (value.trim().length < minChars) {
							setItems([])
							setLoading(false)
						} else {
							setLoading(true)
						}
					}}
					onFocus={() => items.length && setOpen(true)}
					autoComplete='off'
				/>
				{loading && (
					<Loader2 className='text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin' />
				)}
			</div>
			{open && items.length > 0 && (
				<ul className='border-border bg-card absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border py-1 shadow-lg'>
					{items.map(o => (
						<li key={o.value}>
							<button
								type='button'
								onClick={() => pick(o)}
								className='hover:bg-muted flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm'
							>
								<span className='font-medium'>{o.label}</span>
								{o.sub && (
									<span className='text-muted-foreground text-xs'>{o.sub}</span>
								)}
							</button>
						</li>
					))}
				</ul>
			)}
			{open && !loading && items.length === 0 && q.trim().length >= minChars && (
				<div className='border-border bg-card text-muted-foreground absolute z-20 mt-1 w-full rounded-xl border px-3 py-2 text-sm shadow-lg'>
					Нічого не знайдено
				</div>
			)}
		</div>
	)
}

const TypeButton = ({
	active,
	onClick,
	children
}: {
	active: boolean
	onClick: () => void
	children: React.ReactNode
}) => (
	<button
		type='button'
		onClick={onClick}
		className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
			active
				? 'border-primary bg-primary/5 text-accent-text'
				: 'border-border hover:bg-muted/50'
		}`}
	>
		{children}
	</button>
)

// Вибір адреси Нової Пошти: місто (з довідника) → тип → відділення/поштомат.
// Дані беруться з нашого дзеркала (ADR-0014), не з АПІ Пошти напряму.
export const NpDeliveryPicker = ({
	onChange,
	cityError,
	warehouseError
}: {
	onChange: (patch: NpDeliveryValue) => void
	cityError?: string
	warehouseError?: string
}) => {
	const [cityRef, setCityRef] = useState<string>()
	const [type, setType] = useState<NpWarehouseType>('branch')

	const cityFetcher = useCallback(async (q: string): Promise<Option[]> => {
		const rows = await npGet<CityRow[]>(API_URLS.NOVA_POSHTA.CITIES, { q })
		return rows.map(c => ({ value: c.ref, label: c.name, sub: c.area ?? undefined }))
	}, [])

	const warehouseFetcher = useCallback(
		async (q: string): Promise<Option[]> => {
			if (!cityRef) return []
			const rows = await npGet<WarehouseRow[]>(API_URLS.NOVA_POSHTA.WAREHOUSES, {
				cityRef,
				type,
				q
			})
			return rows.map(w => ({ value: w.ref, label: w.description, sub: `№${w.number}` }))
		},
		[cityRef, type]
	)

	const chooseType = (next: NpWarehouseType) => {
		setType(next)
		onChange({ warehouse: '', warehouseRef: '', warehouseType: next })
	}

	return (
		<div className='mt-2.5 grid gap-3'>
			<div>
				<label className='mb-1.5 block text-sm font-medium'>Місто</label>
				<AsyncSelect
					placeholder='Почніть вводити місто'
					error={cityError}
					minChars={2}
					fetcher={cityFetcher}
					onSelect={o => {
						setCityRef(o.value)
						onChange({
							city: o.label,
							cityRef: o.value,
							warehouse: '',
							warehouseRef: ''
						})
					}}
				/>
				{cityError && <p className='mt-1 text-xs text-red-500'>{cityError}</p>}
			</div>

			<div className='flex gap-2'>
				<TypeButton active={type === 'branch'} onClick={() => chooseType('branch')}>
					Відділення
				</TypeButton>
				<TypeButton active={type === 'postomat'} onClick={() => chooseType('postomat')}>
					Поштомат
				</TypeButton>
			</div>

			<div>
				<label className='mb-1.5 block text-sm font-medium'>
					{type === 'postomat' ? 'Поштомат' : 'Відділення'}
				</label>
				<AsyncSelect
					// remount при зміні міста/типу → скидає введений текст і список
					key={`${cityRef ?? 'none'}-${type}`}
					placeholder={cityRef ? 'Оберіть зі списку' : 'Спершу оберіть місто'}
					disabled={!cityRef}
					error={warehouseError}
					fetcher={warehouseFetcher}
					onSelect={o =>
						onChange({ warehouse: o.label, warehouseRef: o.value, warehouseType: type })
					}
				/>
				{warehouseError && <p className='mt-1 text-xs text-red-500'>{warehouseError}</p>}
			</div>
		</div>
	)
}
