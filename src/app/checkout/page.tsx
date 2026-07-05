'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Loader2, MapPin, UserCheck } from 'lucide-react'
import { UI_ROUTES } from '@/common/constants'
import { formatMoney } from '@/common/utils/format'
import { useAuthStore } from '@/common/store/useAuthStore'
import { useCartStore, useCartTotal } from '@/common/store/useCartStore'
import { ordersApi, stashLastOrder, type CreateOrderPayload } from '@/common/services/orders.api'
import { AuthField, authInputClass } from '@/common/components/auth/parts'
import { IbanRequisites } from '@/common/components/checkout/IbanRequisites'
import { NpDeliveryPicker } from '@/common/components/checkout/NpDeliveryPicker'

// Український мобільний: +380XXXXXXXXX (приймаємо 0XX…, 380…, з пробілами/дужками)
const cleanPhone = (raw: string) => raw.replace(/[\s\-()]/g, '')
const normalizePhone = (raw: string) => {
	const p = cleanPhone(raw)
	if (p.startsWith('+380')) return p
	if (p.startsWith('380')) return `+${p}`
	if (p.startsWith('0')) return `+38${p}`
	return p
}

const schema = z
	.object({
		name: z.string().trim().min(2, 'Вкажіть ПІБ (мінімум 2 символи)'),
		phone: z
			.string()
			.trim()
			.min(1, 'Вкажіть телефон')
			.refine(v => /^(\+?380|0)\d{9}$/.test(cleanPhone(v)), 'Формат: +380 XX XXX XX XX'),
		email: z.string().trim().email('Некоректний email').optional().or(z.literal('')),
		delivery: z.enum(['np', 'ukrposhta', 'pickup']),
		city: z.string().trim().optional(),
		warehouse: z.string().trim().optional(),
		// Nova Poshta — обрані з довідника (ADR-0014)
		cityRef: z.string().optional(),
		warehouseRef: z.string().optional(),
		warehouseType: z.enum(['branch', 'postomat', 'cargo']).optional(),
		paymentMethod: z.enum(['cod', 'iban', 'cash', 'card']),
		comment: z.string().trim().max(1000, 'Занадто довгий коментар').optional()
	})
	.superRefine((values, ctx) => {
		if (values.delivery === 'np') {
			// НП — обовʼязково вибір із довідника (є ref), а не довільний текст
			if (!values.cityRef) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['city'],
					message: 'Оберіть місто зі списку'
				})
			}
			if (!values.warehouseRef) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['warehouse'],
					message: 'Оберіть відділення або поштомат'
				})
			}
		} else if (values.delivery === 'ukrposhta') {
			if (!values.city) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['city'],
					message: 'Вкажіть місто'
				})
			}
			if (!values.warehouse) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['warehouse'],
					message: 'Вкажіть відділення'
				})
			}
		}
	})

type FormValues = z.infer<typeof schema>

export default function CheckoutPage() {
	// react-hook-form v7 несумісний із React Compiler (мемоізація ламає
	// відстеження полів після reset) — вимикаємо компілятор для цієї сторінки
	'use no memo'

	const router = useRouter()
	const user = useAuthStore(s => s.user)
	const items = useCartStore(s => s.items)
	const hydrated = useCartStore(s => s.hasHydrated)
	const clear = useCartStore(s => s.clear)
	const total = useCartTotal()

	// щоб редірект «порожній кошик → /cart» не спрацював після успішного оформлення
	const [placed, setPlaced] = useState(false)

	useEffect(() => {
		if (hydrated && items.length === 0 && !placed) {
			router.replace(UI_ROUTES.CART)
		}
	}, [hydrated, items.length, placed, router])

	const {
		register,
		handleSubmit,
		control,
		setValue,
		trigger,
		reset,
		formState: { errors, isSubmitting, isDirty, isSubmitted }
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: '',
			phone: '',
			email: '',
			delivery: 'np',
			city: '',
			warehouse: '',
			cityRef: '',
			warehouseRef: '',
			paymentMethod: 'cod',
			comment: ''
		}
	})

	// Передзаповнення для авторизованого — рівно один раз, і лише поки
	// користувач нічого не ввів (щоб reset не стер введене)
	const prefilled = useRef(false)
	useEffect(() => {
		if (!user || prefilled.current) return
		prefilled.current = true
		if (isDirty) return
		reset(values => ({
			...values,
			name: [user.firstName, user.lastName].filter(Boolean).join(' '),
			phone: user.phone ?? '',
			email: user.email ?? ''
		}))
	}, [user, isDirty, reset])

	const delivery = useWatch({ control, name: 'delivery' })
	const paymentMethod = useWatch({ control, name: 'paymentMethod' })

	// Готівка доступна лише при самовивозі — інакше повертаємо накладений платіж
	useEffect(() => {
		if (delivery !== 'pickup' && paymentMethod === 'cash') {
			setValue('paymentMethod', 'cod')
		}
	}, [delivery, paymentMethod, setValue])

	// Зміна способу доставки скидає адресні поля (щоб НП-снапшот не «протік» в Укрпошту)
	const prevDelivery = useRef(delivery)
	useEffect(() => {
		if (prevDelivery.current === delivery) return
		prevDelivery.current = delivery
		setValue('city', '')
		setValue('warehouse', '')
		setValue('cityRef', '')
		setValue('warehouseRef', '')
		setValue('warehouseType', undefined)
	}, [delivery, setValue])

	const onSubmit = handleSubmit(async values => {
		const payload: CreateOrderPayload = {
			items: items.map(i => ({ productId: i.productId, qty: i.qty })),
			customer: {
				name: values.name,
				phone: normalizePhone(values.phone),
				...(values.email ? { email: values.email } : {})
			},
			delivery: {
				method: values.delivery,
				...(values.delivery !== 'pickup'
					? {
							city: values.city,
							warehouse: values.warehouse,
							...(values.cityRef ? { cityRef: values.cityRef } : {}),
							...(values.warehouseRef ? { warehouseRef: values.warehouseRef } : {}),
							...(values.warehouseType ? { warehouseType: values.warehouseType } : {})
						}
					: {})
			},
			paymentMethod: values.paymentMethod,
			...(values.comment ? { comment: values.comment } : {})
		}

		try {
			const order = await ordersApi.create(payload)
			stashLastOrder(order)
			setPlaced(true)
			clear()
			// Онлайн-оплата: бекенд повернув посилання на monopay — ведемо на оплату.
			// Після оплати monopay поверне на /order/{n}/success (redirectUrl інвойсу).
			if (order.paymentUrl) {
				window.location.assign(order.paymentUrl)
				return
			}
			router.replace(`/order/${encodeURIComponent(order.orderNumber)}/success`)
		} catch (err) {
			// 400/409 (нестача залишків тощо) — українське повідомлення з бекенда; кошик не чистимо
			toast.error((err as Error)?.message || 'Не вдалося оформити замовлення')
		}
	})

	// до гідрації persist — не блимаємо
	if (!hydrated || items.length === 0) {
		return <div className='mx-auto min-h-[40vh] max-w-[1240px] px-6 py-10' />
	}

	const userName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') : ''

	return (
		<div className='mx-auto max-w-[1240px] px-6 py-10'>
			<h1 className='font-display mb-6 text-2xl font-medium'>Оформлення замовлення</h1>

			<form onSubmit={onSubmit} noValidate>
				<div className='grid grid-cols-1 gap-7 lg:grid-cols-[1fr_380px]'>
					<div>
						{/* 1 · Контактні дані */}
						<Block num={1} title='Контактні дані'>
							{user && (
								<div className='bg-muted border-border mb-4 flex items-center gap-2.5 rounded-xl border p-3.5 text-sm'>
									<UserCheck className='text-accent-text h-4 w-4 shrink-0' />
									<span>
										Ви увійшли як <b>{userName || user.email}</b>
										{user.email && userName ? ` / ${user.email}` : ''}
									</span>
								</div>
							)}
							<div className='grid gap-3 sm:grid-cols-2'>
								<div className='sm:col-span-2'>
									<AuthField label='ПІБ' error={errors.name?.message}>
										<input
											className={authInputClass}
											autoComplete='name'
											placeholder="Прізвище Ім'я По батькові"
											{...register('name')}
										/>
									</AuthField>
								</div>
								<AuthField label='Телефон' error={errors.phone?.message}>
									<input
										className={authInputClass}
										type='tel'
										autoComplete='tel'
										placeholder='+380 XX XXX XX XX'
										{...register('phone')}
									/>
								</AuthField>
								<AuthField
									label='Email (необовʼязково)'
									error={errors.email?.message}
								>
									<input
										className={authInputClass}
										type='email'
										autoComplete='email'
										placeholder='you@example.com'
										{...register('email')}
									/>
								</AuthField>
							</div>
							{!user && (
								<p className='text-muted-foreground mt-3 text-xs leading-relaxed'>
									Оформлення доступне без реєстрації. Або{' '}
									<Link
										href={`${UI_ROUTES.LOGIN}?next=${encodeURIComponent(UI_ROUTES.CHECKOUT)}`}
										className='text-accent-text font-medium hover:underline'
									>
										увійдіть
									</Link>
									, щоб бачити історію замовлень.
								</p>
							)}
						</Block>

						{/* 2 · Доставка */}
						<Block num={2} title='Доставка'>
							<RadioCard
								checked={delivery === 'np'}
								title='Нова Пошта'
								desc='Відділення / поштомат · 1–2 дні'
								price='за тарифом'
								inputProps={{ value: 'np', ...register('delivery') }}
							/>
							<RadioCard
								checked={delivery === 'ukrposhta'}
								title='Укрпошта'
								desc='Відділення · 2–4 дні'
								price='за тарифом'
								inputProps={{ value: 'ukrposhta', ...register('delivery') }}
							/>
							<RadioCard
								checked={delivery === 'pickup'}
								title='Самовивіз'
								desc='м. Львів'
								price='0 ₴'
								inputProps={{ value: 'pickup', ...register('delivery') }}
							/>

							{delivery === 'pickup' ? (
								<div className='bg-muted border-border mt-2.5 flex items-center gap-2.5 rounded-xl border p-4 text-sm'>
									<MapPin className='text-accent-text h-4 w-4 shrink-0' />
									<span>
										Забрати у магазині, <b>м. Львів</b>. Ми повідомимо, коли
										замовлення буде готове до видачі.
									</span>
								</div>
							) : delivery === 'np' ? (
								<NpDeliveryPicker
									cityError={errors.city?.message}
									warehouseError={errors.warehouse?.message}
									onChange={patch => {
										for (const [k, v] of Object.entries(patch)) {
											setValue(k as keyof FormValues, v as never, {
												shouldDirty: true
											})
										}
										// помилки висять на city/warehouse, а змінюються cityRef/warehouseRef —
										// ре-валідуємо саме ці поля (лише після спроби сабміту, щоб не блимати завчасно)
										if (isSubmitted) void trigger(['city', 'warehouse'])
									}}
								/>
							) : (
								<div className='mt-2.5 grid gap-3 sm:grid-cols-2'>
									<AuthField label='Місто' error={errors.city?.message}>
										<input
											className={authInputClass}
											placeholder='Напр., Львів'
											{...register('city')}
										/>
									</AuthField>
									<AuthField label='Відділення' error={errors.warehouse?.message}>
										<input
											className={authInputClass}
											placeholder='Напр., Відділення №1'
											{...register('warehouse')}
										/>
									</AuthField>
								</div>
							)}
						</Block>

						{/* 3 · Оплата */}
						<Block num={3} title='Оплата'>
							<RadioCard
								checked={paymentMethod === 'card'}
								title='Картка онлайн'
								desc='Visa / Mastercard, Apple Pay, Google Pay (mono)'
								inputProps={{ value: 'card', ...register('paymentMethod') }}
							/>
							<RadioCard
								checked={paymentMethod === 'cod'}
								title='Накладений платіж'
								desc='Оплата при отриманні на пошті'
								inputProps={{ value: 'cod', ...register('paymentMethod') }}
							/>
							<RadioCard
								checked={paymentMethod === 'iban'}
								title='Оплата за реквізитами (IBAN)'
								desc='Безготівковий переказ'
								inputProps={{ value: 'iban', ...register('paymentMethod') }}
							/>
							{delivery === 'pickup' && (
								<RadioCard
									checked={paymentMethod === 'cash'}
									title='Готівка при отриманні'
									desc='Оплата готівкою в магазині (тільки самовивіз)'
									inputProps={{ value: 'cash', ...register('paymentMethod') }}
								/>
							)}
							{paymentMethod === 'iban' && <IbanRequisites />}
						</Block>

						{/* 4 · Коментар */}
						<Block num={4} title='Коментар'>
							<AuthField
								label='Коментар до замовлення (необовʼязково)'
								error={errors.comment?.message}
							>
								<textarea
									className={`${authInputClass} min-h-24 resize-y`}
									placeholder='Побажання щодо замовлення чи доставки'
									{...register('comment')}
								/>
							</AuthField>
						</Block>
					</div>

					{/* Підсумок */}
					<aside className='border-border bg-card h-fit rounded-2xl border p-5 lg:sticky lg:top-20'>
						<h3 className='font-display mb-4 text-lg font-bold'>Ваше замовлення</h3>
						<ul className='flex flex-col gap-2.5'>
							{items.map(i => (
								<li
									key={i.productId}
									className='flex items-baseline justify-between gap-3 text-sm'
								>
									<span className='text-muted-foreground line-clamp-2'>
										{i.name} <span className='whitespace-nowrap'>×{i.qty}</span>
									</span>
									<span className='shrink-0 font-semibold'>
										{formatMoney(i.price * i.qty)}
									</span>
								</li>
							))}
						</ul>
						<div className='border-border mt-4 border-t pt-4'>
							<div className='flex items-baseline justify-between text-sm'>
								<span className='text-muted-foreground'>Разом</span>
								<span className='font-semibold'>{formatMoney(total)}</span>
							</div>
							<div className='mt-2 flex items-baseline justify-between gap-3 text-sm'>
								<span className='text-muted-foreground'>Доставка</span>
								<span className='text-right font-semibold'>
									{delivery === 'pickup' ? '0 ₴' : 'за тарифом перевізника'}
								</span>
							</div>
							<div className='border-border mt-4 flex items-baseline justify-between border-t pt-4'>
								<span className='font-semibold'>До сплати</span>
								<span className='text-2xl font-extrabold'>
									{formatMoney(total)}
								</span>
							</div>
						</div>
						<button
							type='submit'
							disabled={isSubmitting}
							className='bg-primary text-primary-foreground mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60'
						>
							{isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
							{isSubmitting ? 'Оформлюємо…' : 'Підтвердити замовлення'}
						</button>
						<p className='text-muted-foreground mt-3 text-xs leading-relaxed'>
							Натискаючи, ви погоджуєтесь з умовами оферти.
						</p>
					</aside>
				</div>
			</form>
		</div>
	)
}

// Нумерований блок форми (референс: .block + .num)
const Block = ({ num, title, children }: { num: number; title: string; children: ReactNode }) => (
	<section className='border-border bg-card mb-4 rounded-2xl border p-5 sm:p-6'>
		<h3 className='mb-4 flex items-center gap-2.5 text-base font-bold'>
			<span className='bg-primary text-primary-foreground grid h-6.5 w-6.5 shrink-0 place-items-center rounded-full text-xs font-extrabold'>
				{num}
			</span>
			{title}
		</h3>
		{children}
	</section>
)

// Радіо-картка (референс: .opt)
const RadioCard = ({
	checked,
	title,
	desc,
	price,
	inputProps
}: {
	checked: boolean
	title: string
	desc: string
	price?: string
	inputProps: React.InputHTMLAttributes<HTMLInputElement>
}) => (
	<label
		className={`mb-2.5 flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors last:mb-0 ${
			checked ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
		}`}
	>
		<input type='radio' className='sr-only' {...inputProps} />
		<span
			aria-hidden
			className={`relative h-5 w-5 shrink-0 rounded-full border-2 ${
				checked
					? 'border-primary after:bg-primary after:absolute after:inset-1 after:rounded-full'
					: 'border-muted-foreground/50'
			}`}
		/>
		<span className='min-w-0'>
			<span className='block text-sm font-semibold'>{title}</span>
			<span className='text-muted-foreground block text-xs'>{desc}</span>
		</span>
		{price && <span className='ml-auto shrink-0 text-sm font-bold'>{price}</span>}
	</label>
)
