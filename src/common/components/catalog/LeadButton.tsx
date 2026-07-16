'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { API_BASE_URL, API_URLS } from '@/common/constants'
import { Modal } from '@/common/components/ui/Modal'
import { leadSchema, type LeadFormValues } from './lead.schema'

type LeadType = 'fitment' | 'price_match' | 'price_subscribe' | 'contact'

interface Props {
	type: LeadType
	label: string
	title: string
	className?: string
	productId?: string
}

const DEFAULTS: LeadFormValues = {
	name: '',
	phone: '',
	email: '',
	vin: '',
	link: '',
	targetPrice: '',
	message: ''
}

export const LeadButton = ({ type, label, title, className, productId }: Props) => {
	// react-hook-form v7 несумісний із React Compiler (мемоізація ламає
	// відстеження полів після reset) — вимикаємо компілятор для цього компонента
	'use no memo'

	const [open, setOpen] = useState(false)

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting }
	} = useForm<LeadFormValues>({
		resolver: zodResolver(leadSchema),
		defaultValues: DEFAULTS
	})

	const showVin = type === 'fitment'
	const showLink = type === 'price_match'
	const showTarget = type === 'price_subscribe'
	const showMessage = type === 'fitment' || type === 'contact'

	const onSubmit = async (v: LeadFormValues) => {
		try {
			const body: Record<string, unknown> = {
				type,
				name: v.name,
				phone: v.phone
			}
			if (productId) body.productId = productId
			if (v.email) body.email = v.email
			if (showVin && v.vin) body.vin = v.vin
			if (showLink && v.link) body.link = v.link
			if (showTarget && v.targetPrice !== '') body.targetPrice = v.targetPrice
			if (showMessage && v.message) body.message = v.message

			const res = await fetch(`${API_BASE_URL}${API_URLS.LEADS.BASE}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			})
			if (!res.ok) throw new Error()
			toast.success('Заявку надіслано! Ми звʼяжемось з вами.')
			reset()
			setOpen(false)
		} catch {
			toast.error('Не вдалося надіслати. Спробуйте ще раз.')
		}
	}

	return (
		<>
			<button type='button' onClick={() => setOpen(true)} className={className}>
				{label}
			</button>

			<Modal open={open} onClose={() => setOpen(false)} title={title}>
				<form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-3' noValidate>
					<Field label="Ваше ім'я *" error={errors.name?.message}>
						<input
							className={`${INPUT} ${errors.name ? 'border-red-500' : ''}`}
							placeholder='Іван'
							{...register('name')}
						/>
					</Field>
					<Field label='Телефон *' error={errors.phone?.message}>
						<input
							className={`${INPUT} ${errors.phone ? 'border-red-500' : ''}`}
							placeholder='+380…'
							type='tel'
							{...register('phone')}
						/>
					</Field>
					{showVin && (
						<Field label='VIN або код запчастини' error={errors.vin?.message}>
							<input
								className={INPUT}
								placeholder='5YJ… або 1645989-00-A'
								{...register('vin')}
							/>
						</Field>
					)}
					{showLink && (
						<Field label='Посилання, де дешевше' error={errors.link?.message}>
							<input
								className={`${INPUT} ${errors.link ? 'border-red-500' : ''}`}
								placeholder='https://…'
								{...register('link')}
							/>
						</Field>
					)}
					{showTarget && (
						<Field label='Бажана ціна, ₴' error={errors.targetPrice?.message}>
							<input
								className={`${INPUT} ${errors.targetPrice ? 'border-red-500' : ''}`}
								type='number'
								min={0}
								placeholder='3000'
								{...register('targetPrice')}
							/>
						</Field>
					)}
					{showMessage && (
						<Field label='Коментар' error={errors.message?.message}>
							<textarea
								className={INPUT + ' min-h-20'}
								placeholder='Опишіть деталь або питання'
								{...register('message')}
							/>
						</Field>
					)}

					<button
						type='submit'
						disabled={isSubmitting}
						className='bg-primary text-primary-foreground mt-2 flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60'
					>
						{isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
						{isSubmitting ? 'Надсилання…' : 'Надіслати заявку'}
					</button>
				</form>
			</Modal>
		</>
	)
}

const INPUT =
	'border-border bg-background focus:border-primary w-full rounded-xl border px-4 py-2.5 text-sm outline-none'

const Field = ({
	label,
	error,
	children
}: {
	label: string
	error?: string
	children: React.ReactNode
}) => (
	<div>
		<label className='mb-1 block text-sm font-medium'>{label}</label>
		{children}
		{error && <p className='mt-1 text-xs text-red-500'>{error}</p>}
	</div>
)
