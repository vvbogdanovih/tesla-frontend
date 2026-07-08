'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { authInputClass, AuthField } from '@/common/components/auth/parts'
import { NpDeliveryPicker } from '@/common/components/checkout/NpDeliveryPicker'
import type { Address, AddressPayload } from '@/common/services/addresses.api'

type Method = 'np' | 'ukrposhta'

// Форма створення/редагування збереженої адреси (ADR-0017).
// Локальний стан (не RHF) — простіше й без конфлікту з React Compiler.
export const AddressForm = ({
	initial,
	onSubmit,
	onCancel,
	submitting
}: {
	initial?: Address
	onSubmit: (payload: AddressPayload) => void
	onCancel: () => void
	submitting?: boolean
}) => {
	const [label, setLabel] = useState(initial?.label ?? '')
	const [method, setMethod] = useState<Method>(
		initial?.method === 'ukrposhta' ? 'ukrposhta' : 'np'
	)
	const [recipient, setRecipient] = useState(initial?.recipient ?? '')
	const [phone, setPhone] = useState(initial?.phone ?? '')
	const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false)

	// Адресні поля (для НП підхоплюються з combobox; при редагуванні — з initial)
	const [city, setCity] = useState(initial?.city ?? '')
	const [warehouse, setWarehouse] = useState(initial?.warehouse ?? '')
	const [cityRef, setCityRef] = useState(initial?.cityRef ?? '')
	const [warehouseRef, setWarehouseRef] = useState(initial?.warehouseRef ?? '')
	const [warehouseType, setWarehouseType] = useState(initial?.warehouseType ?? undefined)

	const [error, setError] = useState<string>()

	const submit = () => {
		if (method === 'np') {
			if (!cityRef || !warehouseRef) {
				setError('Оберіть місто та відділення/поштомат зі списку')
				return
			}
		} else if (!city.trim() || !warehouse.trim()) {
			setError('Вкажіть місто та відділення')
			return
		}
		setError(undefined)

		onSubmit({
			method,
			label: label.trim() || undefined,
			recipient: recipient.trim() || undefined,
			phone: phone.trim() || undefined,
			isDefault,
			city: city.trim() || undefined,
			warehouse: warehouse.trim() || undefined,
			...(method === 'np'
				? { cityRef, warehouseRef, warehouseType }
				: { cityRef: undefined, warehouseRef: undefined, warehouseType: undefined })
		})
	}

	return (
		<div className='grid gap-4'>
			<AuthField label='Назва (необовʼязково)'>
				<input
					className={authInputClass}
					placeholder='Напр., Дім, Робота'
					value={label}
					onChange={e => setLabel(e.target.value)}
				/>
			</AuthField>

			{/* Спосіб доставки */}
			<div className='flex gap-2'>
				<MethodButton active={method === 'np'} onClick={() => setMethod('np')}>
					Нова Пошта
				</MethodButton>
				<MethodButton active={method === 'ukrposhta'} onClick={() => setMethod('ukrposhta')}>
					Укрпошта
				</MethodButton>
			</div>

			{method === 'np' ? (
				<>
					{initial?.method === 'np' && (initial.city || initial.warehouse) && (
						<p className='text-muted-foreground text-xs'>
							Поточна: <b>{initial.city}</b>
							{initial.warehouse ? `, ${initial.warehouse}` : ''}. Оберіть заново, щоб
							змінити.
						</p>
					)}
					<NpDeliveryPicker
						onChange={patch => {
							if (patch.city !== undefined) setCity(patch.city)
							if (patch.cityRef !== undefined) setCityRef(patch.cityRef)
							if (patch.warehouse !== undefined) setWarehouse(patch.warehouse)
							if (patch.warehouseRef !== undefined) setWarehouseRef(patch.warehouseRef)
							if (patch.warehouseType !== undefined)
								setWarehouseType(patch.warehouseType)
						}}
					/>
				</>
			) : (
				<div className='grid gap-3 sm:grid-cols-2'>
					<AuthField label='Місто'>
						<input
							className={authInputClass}
							placeholder='Напр., Львів'
							value={city}
							onChange={e => setCity(e.target.value)}
						/>
					</AuthField>
					<AuthField label='Відділення'>
						<input
							className={authInputClass}
							placeholder='Напр., Відділення №1'
							value={warehouse}
							onChange={e => setWarehouse(e.target.value)}
						/>
					</AuthField>
				</div>
			)}

			<div className='grid gap-3 sm:grid-cols-2'>
				<AuthField label='Отримувач (необовʼязково)'>
					<input
						className={authInputClass}
						placeholder="Прізвище Ім'я"
						value={recipient}
						onChange={e => setRecipient(e.target.value)}
					/>
				</AuthField>
				<AuthField label='Телефон (необовʼязково)'>
					<input
						className={authInputClass}
						type='tel'
						placeholder='+380 XX XXX XX XX'
						value={phone}
						onChange={e => setPhone(e.target.value)}
					/>
				</AuthField>
			</div>

			<label className='flex cursor-pointer items-center gap-2.5 text-sm'>
				<input
					type='checkbox'
					className='accent-primary h-4 w-4'
					checked={isDefault}
					onChange={e => setIsDefault(e.target.checked)}
				/>
				Зробити основною адресою
			</label>

			{error && <p className='text-sm text-red-500'>{error}</p>}

			<div className='flex gap-3'>
				<button
					type='button'
					onClick={submit}
					disabled={submitting}
					className='bg-primary text-primary-foreground flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60'
				>
					{submitting && <Loader2 className='h-4 w-4 animate-spin' />}
					Зберегти
				</button>
				<button
					type='button'
					onClick={onCancel}
					className='border-border hover:bg-muted h-11 rounded-xl border px-5 text-sm font-medium transition-colors'
				>
					Скасувати
				</button>
			</div>
		</div>
	)
}

const MethodButton = ({
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
			active ? 'border-primary bg-primary/5 text-accent-text' : 'border-border hover:bg-muted/50'
		}`}
	>
		{children}
	</button>
)
