'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2, X } from 'lucide-react'
import { API_BASE_URL, API_URLS } from '@/common/constants'

type LeadType = 'fitment' | 'price_match' | 'price_subscribe' | 'contact'

interface Props {
	type: LeadType
	label: string
	title: string
	className?: string
	productId?: string
}

export const LeadButton = ({ type, label, title, className, productId }: Props) => {
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const [form, setForm] = useState({
		name: '',
		phone: '',
		email: '',
		vin: '',
		link: '',
		targetPrice: '',
		message: ''
	})

	const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
		setForm(f => ({ ...f, [k]: e.target.value }))

	const showVin = type === 'fitment'
	const showLink = type === 'price_match'
	const showTarget = type === 'price_subscribe'
	const showMessage = type === 'fitment' || type === 'contact'

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (form.name.trim().length < 2 || form.phone.trim().length < 5) {
			toast.error('Вкажіть імʼя та телефон')
			return
		}
		setLoading(true)
		try {
			const body: Record<string, unknown> = {
				type,
				name: form.name.trim(),
				phone: form.phone.trim()
			}
			if (productId) body.productId = productId
			if (form.email.trim()) body.email = form.email.trim()
			if (showVin && form.vin.trim()) body.vin = form.vin.trim()
			if (showLink && form.link.trim()) body.link = form.link.trim()
			if (showTarget && form.targetPrice) body.targetPrice = Number(form.targetPrice)
			if (showMessage && form.message.trim()) body.message = form.message.trim()

			const res = await fetch(`${API_BASE_URL}${API_URLS.LEADS.BASE}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			})
			if (!res.ok) throw new Error()
			toast.success('Заявку надіслано! Ми звʼяжемось з вами.')
			setOpen(false)
			setForm({ name: '', phone: '', email: '', vin: '', link: '', targetPrice: '', message: '' })
		} catch {
			toast.error('Не вдалося надіслати. Спробуйте ще раз.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<>
			<button type='button' onClick={() => setOpen(true)} className={className}>
				{label}
			</button>

			{open && (
				<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
					<div className='absolute inset-0 bg-black/50' onClick={() => setOpen(false)} />
					<div className='bg-card border-border relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-xl'>
						<div className='mb-4 flex items-center justify-between'>
							<h2 className='font-display text-lg font-bold'>{title}</h2>
							<button
								type='button'
								onClick={() => setOpen(false)}
								className='hover:bg-muted rounded-md p-1'
								aria-label='Закрити'
							>
								<X className='h-5 w-5' />
							</button>
						</div>

						<form onSubmit={submit} className='flex flex-col gap-3'>
							<Field label="Ваше ім'я *">
								<input className={INPUT} value={form.name} onChange={set('name')} placeholder='Іван' />
							</Field>
							<Field label='Телефон *'>
								<input
									className={INPUT}
									value={form.phone}
									onChange={set('phone')}
									placeholder='+380…'
									type='tel'
								/>
							</Field>
							{showVin && (
								<Field label='VIN або код запчастини'>
									<input className={INPUT} value={form.vin} onChange={set('vin')} placeholder='5YJ… або 1645989-00-A' />
								</Field>
							)}
							{showLink && (
								<Field label='Посилання, де дешевше'>
									<input className={INPUT} value={form.link} onChange={set('link')} placeholder='https://…' />
								</Field>
							)}
							{showTarget && (
								<Field label='Бажана ціна, ₴'>
									<input
										className={INPUT}
										value={form.targetPrice}
										onChange={set('targetPrice')}
										type='number'
										min={0}
										placeholder='3000'
									/>
								</Field>
							)}
							{showMessage && (
								<Field label='Коментар'>
									<textarea
										className={INPUT + ' min-h-20'}
										value={form.message}
										onChange={set('message')}
										placeholder='Опишіть деталь або питання'
									/>
								</Field>
							)}

							<button
								type='submit'
								disabled={loading}
								className='bg-primary text-primary-foreground mt-2 flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60'
							>
								{loading && <Loader2 className='h-4 w-4 animate-spin' />}
								{loading ? 'Надсилання…' : 'Надіслати заявку'}
							</button>
						</form>
					</div>
				</div>
			)}
		</>
	)
}

const INPUT =
	'border-border bg-background focus:border-primary w-full rounded-xl border px-4 py-2.5 text-sm outline-none'

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
	<div>
		<label className='mb-1 block text-sm font-medium'>{label}</label>
		{children}
	</div>
)
