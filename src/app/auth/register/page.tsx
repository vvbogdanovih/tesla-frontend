'use client'

import Link from 'next/link'
import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { authApi, type RegisterPayload } from '@/common/services/auth.api'
import { useAuthStore } from '@/common/store/useAuthStore'
import { UI_ROUTES } from '@/common/constants/ui-routes.constants'
import { AuthShell, AuthField, authInputClass } from '@/common/components/auth/parts'

const schema = z
	.object({
		firstName: z.string().optional(),
		lastName: z.string().optional(),
		email: z.string().email('Некоректний email'),
		phone: z.string().optional(),
		password: z.string().min(6, 'Пароль має містити щонайменше 6 символів'),
		confirmPassword: z.string().min(1, 'Підтвердіть пароль')
	})
	.refine(data => data.password === data.confirmPassword, {
		message: 'Паролі не збігаються',
		path: ['confirmPassword']
	})

type FormValues = z.infer<typeof schema>

const safeNext = (next: string | null) => (next && next.startsWith('/') ? next : UI_ROUTES.HOME)

// Порожні необовʼязкові поля не надсилаємо (бекенд очікує undefined, не '').
const trimOptional = (v?: string) => {
	const t = v?.trim()
	return t ? t : undefined
}

const RegisterForm = () => {
	const router = useRouter()
	const params = useSearchParams()
	const next = safeNext(params.get('next'))

	const user = useAuthStore(s => s.user)
	const login = useAuthStore(s => s.login)

	useEffect(() => {
		if (user) router.replace(next)
	}, [user, next, router])

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting }
	} = useForm<FormValues>({ resolver: zodResolver(schema) })

	const onSubmit = handleSubmit(async values => {
		const payload: RegisterPayload = {
			email: values.email.trim(),
			password: values.password,
			firstName: trimOptional(values.firstName),
			lastName: trimOptional(values.lastName),
			phone: trimOptional(values.phone)
		}
		try {
			const { user } = await authApi.register(payload)
			login(user)
			toast.success('Акаунт створено!')
			router.replace(next)
		} catch (err) {
			toast.error((err as Error)?.message || 'Не вдалося зареєструватися')
		}
	})

	return (
		<AuthShell
			title='Реєстрація'
			subtitle='Створіть акаунт, щоб зберігати товари та відстежувати замовлення'
			footer={
				<>
					Уже маєте акаунт?{' '}
					<Link
						href={`${UI_ROUTES.LOGIN}?next=${encodeURIComponent(next)}`}
						className='text-accent-text font-medium hover:underline'
					>
						Увійти
					</Link>
				</>
			}
		>
			<form onSubmit={onSubmit} className='flex flex-col gap-4' noValidate>
				<div className='grid grid-cols-2 gap-3'>
					<AuthField label="Ім'я" error={errors.firstName?.message}>
						<input
							className={authInputClass}
							autoComplete='given-name'
							placeholder='Іван'
							{...register('firstName')}
						/>
					</AuthField>
					<AuthField label='Прізвище' error={errors.lastName?.message}>
						<input
							className={authInputClass}
							autoComplete='family-name'
							placeholder='Коваль'
							{...register('lastName')}
						/>
					</AuthField>
				</div>
				<AuthField label='Email' error={errors.email?.message}>
					<input
						className={authInputClass}
						type='email'
						autoComplete='email'
						placeholder='you@example.com'
						{...register('email')}
					/>
				</AuthField>
				<AuthField label='Телефон' error={errors.phone?.message}>
					<input
						className={authInputClass}
						type='tel'
						autoComplete='tel'
						placeholder='+380…'
						{...register('phone')}
					/>
				</AuthField>
				<AuthField label='Пароль' error={errors.password?.message}>
					<input
						className={authInputClass}
						type='password'
						autoComplete='new-password'
						placeholder='Мінімум 6 символів'
						{...register('password')}
					/>
				</AuthField>
				<AuthField label='Підтвердження паролю' error={errors.confirmPassword?.message}>
					<input
						className={authInputClass}
						type='password'
						autoComplete='new-password'
						placeholder='Повторіть пароль'
						{...register('confirmPassword')}
					/>
				</AuthField>
				<button
					type='submit'
					disabled={isSubmitting}
					className='bg-primary text-primary-foreground mt-2 flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60'
				>
					{isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
					{isSubmitting ? 'Створення…' : 'Зареєструватися'}
				</button>
			</form>
		</AuthShell>
	)
}

export default function RegisterPage() {
	return (
		<Suspense>
			<RegisterForm />
		</Suspense>
	)
}
