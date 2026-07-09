'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { authInputClass, AuthField } from '@/common/components/auth/parts'
import { profileApi } from '@/common/services/profile.api'

// Зміна пароля: поточний + новий ×2. Помилки бекенда показуємо інлайн
// (profileApi.changePassword — із skipErrorToast).
export const PasswordForm = ({ onClose }: { onClose: () => void }) => {
	const [current, setCurrent] = useState('')
	const [next, setNext] = useState('')
	const [repeat, setRepeat] = useState('')
	const [error, setError] = useState<string>()
	const [submitting, setSubmitting] = useState(false)

	const submit = async () => {
		if (next.length < 6) {
			setError('Новий пароль має містити щонайменше 6 символів')
			return
		}
		if (next !== repeat) {
			setError('Паролі не збігаються')
			return
		}
		setError(undefined)
		setSubmitting(true)
		try {
			await profileApi.changePassword({ currentPassword: current, newPassword: next })
			toast.success('Пароль змінено')
			onClose()
		} catch (err) {
			setError((err as Error)?.message || 'Не вдалося змінити пароль')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className='grid gap-4'>
			<div className='grid gap-3 sm:grid-cols-2'>
				<div className='sm:col-span-2'>
					<AuthField label='Поточний пароль'>
						<input
							className={authInputClass}
							type='password'
							autoComplete='current-password'
							value={current}
							onChange={e => setCurrent(e.target.value)}
						/>
					</AuthField>
				</div>
				<AuthField label='Новий пароль'>
					<input
						className={authInputClass}
						type='password'
						autoComplete='new-password'
						value={next}
						onChange={e => setNext(e.target.value)}
					/>
				</AuthField>
				<AuthField label='Повторіть новий пароль'>
					<input
						className={authInputClass}
						type='password'
						autoComplete='new-password'
						value={repeat}
						onChange={e => setRepeat(e.target.value)}
					/>
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
					Змінити пароль
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
