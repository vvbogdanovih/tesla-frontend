'use client'

import { authInputClass } from '@/common/components/auth/parts'

// Поля адреси Укрпошти: той самий вертикальний флоу, що й NpDeliveryPicker
// (місто → відділення, відділення активується після міста), але без підказок —
// довідник УП поки не дзеркалимо, значення вільним текстом (FR-6.2a).
export const UpDeliveryFields = ({
	cityInputProps,
	warehouseInputProps,
	cityError,
	warehouseError,
	warehouseDisabled = false
}: {
	cityInputProps: React.InputHTMLAttributes<HTMLInputElement>
	warehouseInputProps: React.InputHTMLAttributes<HTMLInputElement>
	cityError?: string
	warehouseError?: string
	warehouseDisabled?: boolean
}) => (
	<div className='mt-2.5 grid gap-3'>
		<div>
			<label className='mb-1.5 block text-sm font-medium'>Місто</label>
			<input
				className={`${authInputClass} ${cityError ? 'border-red-500' : ''}`}
				placeholder='Напр., Львів'
				autoComplete='off'
				{...cityInputProps}
			/>
			{cityError && <p className='mt-1 text-xs text-red-500'>{cityError}</p>}
		</div>

		<div>
			<label className='mb-1.5 block text-sm font-medium'>Відділення</label>
			<input
				className={`${authInputClass} ${warehouseError ? 'border-red-500' : ''}`}
				placeholder={
					warehouseDisabled
						? 'Спершу вкажіть місто'
						: 'Напр., Відділення №4 (індекс 79005)'
				}
				disabled={warehouseDisabled}
				autoComplete='off'
				{...warehouseInputProps}
			/>
			{warehouseError && <p className='mt-1 text-xs text-red-500'>{warehouseError}</p>}
		</div>
	</div>
)
