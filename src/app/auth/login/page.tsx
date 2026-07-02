'use client'

import Link from 'next/link'
import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { authApi } from '@/common/services/auth.api'
import { useAuthStore } from '@/common/store/useAuthStore'
import { UI_ROUTES } from '@/common/constants/ui-routes.constants'
import { AuthShell, AuthField, authInputClass } from '@/common/components/auth/parts'

const schema = z.object({
	email: z.string().email('Некоректний email'),
	password: z.string().min(1, 'Введіть пароль')
})

type FormValues = z.infer<typeof schema>

const safeNext = (next: string | null) => (next && next.startsWith('/') ? next : UI_ROUTES.HOME)

const LoginForm = () => {
	const router = useRouter()
	const params = useSearchParams()
	const next = safeNext(params.get('next'))

	const user = useAuthStore(s => s.user)
	const login = useAuthStore(s => s.login)

	// Уже авторизований — не показуємо форму.
	useEffect(() => {
		if (user) router.replace(next)
	}, [user, next, router])

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting }
	} = useForm<FormValues>({ resolver: zodResolver(schema) })

	const onSubmit = handleSubmit(async values => {
		try {
			const { user } = await authApi.login(values)
			login(user)
			toast.success('Вітаємо!')
			router.replace(next)
		} catch (err) {
			toast.error((err as Error)?.message || 'Невірний email або пароль')
		}
	})

	return (
		<AuthShell
			title='Вхід'
			subtitle='Увійдіть, щоб зберігати товари та бачити свої замовлення'
			footer={
				<>
					Немає акаунта?{' '}
					<Link
						href={`${UI_ROUTES.REGISTER}?next=${encodeURIComponent(next)}`}
						className='text-accent-text font-medium hover:underline'
					>
						Зареєструватися
					</Link>
				</>
			}
		>
			<form onSubmit={onSubmit} className='flex flex-col gap-4' noValidate>
				<AuthField label='Email' error={errors.email?.message}>
					<input
						className={authInputClass}
						type='email'
						autoComplete='email'
						placeholder='you@example.com'
						{...register('email')}
					/>
				</AuthField>
				<AuthField label='Пароль' error={errors.password?.message}>
					<input
						className={authInputClass}
						type='password'
						autoComplete='current-password'
						placeholder='••••••••'
						{...register('password')}
					/>
				</AuthField>
				<button
					type='submit'
					disabled={isSubmitting}
					className='bg-primary text-primary-foreground mt-2 flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60'
				>
					{isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
					{isSubmitting ? 'Вхід…' : 'Увійти'}
				</button>
			</form>
		</AuthShell>
	)
}

export default function LoginPage() {
	// react-hook-form v7 несумісний із React Compiler (ламає відстеження полів) — вимикаємо
	'use no memo'

	return (
		<Suspense>
			<LoginForm />
		</Suspense>
	)
}
