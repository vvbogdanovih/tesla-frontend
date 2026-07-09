'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { authInputClass, AuthField } from '@/common/components/auth/parts'
import { isValidUaPhone, normalizePhone } from '@/common/utils/phone'
import { profileApi } from '@/common/services/profile.api'
import { useAuthStore } from '@/common/store/useAuthStore'
import type { User } from '@/common/types/user.type'

// Редагування контактних даних профілю. Локальний стан (не RHF) — як AddressForm.
export const ProfileForm = ({ user, onClose }: { user: User; onClose: () => void }) => {
	const setUser = useAuthStore(s => s.setUser)
	const [firstName, setFirstName] = useState(user.firstName ?? '')
	const [lastName, setLastName] = useState(user.lastName ?? '')
	const [phone, setPhone] = useState(user.phone ?? '')
	const [error, setError] = useState<string>()
	const [submitting, setSubmitting] = useState(false)

	const submit = async () => {
		if (phone.trim() && !isValidUaPhone(phone)) {
			setError('Телефон у форматі +380 XX XXX XX XX')
			return
		}
		setError(undefined)
		setSubmitting(true)
		try {
			const updated = await profileApi.update({
				firstName: firstName.trim(),
				lastName: lastName.trim(),
				phone: phone.trim() ? normalizePhone(phone) : ''
			})
			setUser(updated)
			toast.success('Профіль оновлено')
			onClose()
		} catch {
			// текст помилки показав error-toast httpService
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className='grid gap-4'>
			<div className='grid gap-3 sm:grid-cols-2'>
				<AuthField label="Ім'я">
					<input
						className={authInputClass}
						autoComplete='given-name'
						placeholder="Ім'я"
						value={firstName}
						onChange={e => setFirstName(e.target.value)}
					/>
				</AuthField>
				<AuthField label='Прізвище'>
					<input
						className={authInputClass}
						autoComplete='family-name'
						placeholder='Прізвище'
						value={lastName}
						onChange={e => setLastName(e.target.value)}
					/>
				</AuthField>
				<AuthField label='Телефон'>
					<input
						className={authInputClass}
						type='tel'
						autoComplete='tel'
						placeholder='+380 XX XXX XX XX'
						value={phone}
						onChange={e => setPhone(e.target.value)}
					/>
				</AuthField>
				<AuthField label='Email'>
					{/* Email — логін, не редагується */}
					<input className={authInputClass} value={user.email ?? ''} disabled />
				</AuthField>
			</div>

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
					onClick={onClose}
					className='border-border hover:bg-muted h-11 rounded-xl border px-5 text-sm font-medium transition-colors'
				>
					Скасувати
				</button>
			</div>
		</div>
	)
}
