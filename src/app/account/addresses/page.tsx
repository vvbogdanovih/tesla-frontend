'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/common/store/useAuthStore'
import { addressesApi, type Address, type AddressPayload } from '@/common/services/addresses.api'
import { AddressForm } from '@/common/components/account/AddressForm'
import { FullScreenLoader } from '@/common/components'

const methodLabel = (m: Address['method']) =>
	m === 'np' ? 'Нова Пошта' : m === 'ukrposhta' ? 'Укрпошта' : 'Самовивіз'

// «new» — форма створення; string — id адреси, що редагується; null — список
type Editing = 'new' | string | null

// Гейт і навігація — в layout кабінету
export default function AccountAddressesPage() {
	const user = useAuthStore(s => s.user)
	const qc = useQueryClient()
	const [editing, setEditing] = useState<Editing>(null)

	const { data, isPending, isError } = useQuery({
		queryKey: ['account-addresses'],
		queryFn: addressesApi.list,
		enabled: !!user,
		staleTime: 30_000
	})

	const invalidate = () => qc.invalidateQueries({ queryKey: ['account-addresses'] })

	const createMut = useMutation({
		mutationFn: (p: AddressPayload) => addressesApi.create(p),
		onSuccess: () => {
			toast.success('Адресу збережено')
			setEditing(null)
			invalidate()
		}
	})

	const updateMut = useMutation({
		mutationFn: ({ id, p }: { id: string; p: AddressPayload }) => addressesApi.update(id, p),
		onSuccess: () => {
			toast.success('Адресу оновлено')
			setEditing(null)
			invalidate()
		}
	})

	const removeMut = useMutation({
		mutationFn: (id: string) => addressesApi.remove(id),
		onSuccess: () => {
			toast.success('Адресу видалено')
			invalidate()
		}
	})

	const defaultMut = useMutation({
		mutationFn: (id: string) => addressesApi.setDefault(id),
		onSuccess: invalidate
	})

	if (!user) return null

	const addresses = data ?? []
	const submitting = createMut.isPending || updateMut.isPending

	return (
		<>
			<div className='flex flex-wrap items-center justify-between gap-3'>
				<div>
					<h1 className='font-display text-2xl font-bold'>Адреси доставки</h1>
					<p className='text-muted-foreground mt-1 text-sm'>
						Збережені адреси зʼявляться у формі оформлення замовлення
					</p>
				</div>
				{editing === null && (
					<button
						type='button'
						onClick={() => setEditing('new')}
						className='bg-primary text-primary-foreground flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold transition-opacity hover:opacity-90'
					>
						<Plus className='h-4 w-4' />
						Додати адресу
					</button>
				)}
			</div>

			{/* Форма створення */}
			{editing === 'new' && (
				<section className='border-border bg-card mt-6 rounded-2xl border p-6'>
					<h2 className='font-display mb-4 text-lg font-bold'>Нова адреса</h2>
					<AddressForm
						submitting={submitting}
						onSubmit={p => createMut.mutate(p)}
						onCancel={() => setEditing(null)}
					/>
				</section>
			)}

			{isPending ? (
				<div className='py-20'>
					<FullScreenLoader />
				</div>
			) : isError ? (
				<p className='text-muted-foreground py-20 text-center text-sm'>
					Не вдалося завантажити адреси. Спробуйте оновити сторінку.
				</p>
			) : addresses.length === 0 && editing === null ? (
				<div className='border-border bg-card mt-8 flex flex-col items-center rounded-2xl border px-6 py-16 text-center'>
					<div className='bg-muted mb-4 grid h-16 w-16 place-items-center rounded-full'>
						<MapPin className='text-muted-foreground h-8 w-8' />
					</div>
					<p className='text-lg font-semibold'>Збережених адрес поки немає</p>
					<p className='text-muted-foreground mt-1 text-sm'>
						Додайте адресу, щоб не вводити її під час кожного замовлення.
					</p>
				</div>
			) : (
				<ul className='mt-6 flex flex-col gap-4'>
					{addresses.map(a =>
						editing === a.id ? (
							<li key={a.id} className='border-border bg-card rounded-2xl border p-6'>
								<h2 className='font-display mb-4 text-lg font-bold'>
									Редагування адреси
								</h2>
								<AddressForm
									initial={a}
									submitting={submitting}
									onSubmit={p => updateMut.mutate({ id: a.id, p })}
									onCancel={() => setEditing(null)}
								/>
							</li>
						) : (
							<AddressCard
								key={a.id}
								address={a}
								disabled={editing !== null}
								onEdit={() => setEditing(a.id)}
								onDelete={() => {
									if (confirm('Видалити цю адресу?')) removeMut.mutate(a.id)
								}}
								onMakeDefault={() => defaultMut.mutate(a.id)}
							/>
						)
					)}
				</ul>
			)}
		</>
	)
}

const AddressCard = ({
	address: a,
	disabled,
	onEdit,
	onDelete,
	onMakeDefault
}: {
	address: Address
	disabled: boolean
	onEdit: () => void
	onDelete: () => void
	onMakeDefault: () => void
}) => (
	<li className='border-border bg-card rounded-2xl border p-5'>
		<div className='flex flex-wrap items-start justify-between gap-3'>
			<div className='min-w-0'>
				<div className='flex items-center gap-2'>
					<p className='font-semibold'>{a.label || methodLabel(a.method)}</p>
					{a.isDefault && (
						<span className='bg-primary/10 text-accent-text rounded-full px-2 py-0.5 text-xs font-bold'>
							Основна
						</span>
					)}
				</div>
				<p className='text-muted-foreground mt-1 text-sm'>
					{methodLabel(a.method)}
					{a.city ? ` · ${a.city}` : ''}
					{a.warehouse ? `, ${a.warehouse}` : ''}
				</p>
				{(a.recipient || a.phone) && (
					<p className='text-muted-foreground mt-0.5 text-sm'>
						{[a.recipient, a.phone].filter(Boolean).join(' · ')}
					</p>
				)}
			</div>
			<div className='flex shrink-0 items-center gap-1'>
				{!a.isDefault && (
					<button
						type='button'
						onClick={onMakeDefault}
						disabled={disabled}
						title='Зробити основною'
						className='hover:bg-muted text-muted-foreground grid h-9 w-9 place-items-center rounded-lg transition-colors disabled:opacity-50'
					>
						<Star className='h-4 w-4' />
					</button>
				)}
				<button
					type='button'
					onClick={onEdit}
					disabled={disabled}
					title='Редагувати'
					className='hover:bg-muted text-muted-foreground grid h-9 w-9 place-items-center rounded-lg transition-colors disabled:opacity-50'
				>
					<Pencil className='h-4 w-4' />
				</button>
				<button
					type='button'
					onClick={onDelete}
					disabled={disabled}
					title='Видалити'
					className='hover:bg-muted grid h-9 w-9 place-items-center rounded-lg text-red-500 transition-colors disabled:opacity-50'
				>
					<Trash2 className='h-4 w-4' />
				</button>
			</div>
		</div>
	</li>
)
