'use client'

import { useQuery } from '@tanstack/react-query'
import { Landmark } from 'lucide-react'
import { ordersApi } from '@/common/services/orders.api'

interface Props {
	// Номер замовлення для призначення платежу; якщо ще невідомий — «№…»
	orderNumber?: string
}

// Реквізити IBAN (ADR-0008): тягнемо публічний ендпоінт лише коли блок видимий.
export const IbanRequisites = ({ orderNumber }: Props) => {
	const { data, isPending, isError } = useQuery({
		queryKey: ['payment-requisites'],
		queryFn: ordersApi.paymentRequisites,
		staleTime: 5 * 60_000
	})

	if (isPending) {
		return (
			<div className='bg-muted border-border mt-2.5 rounded-xl border p-4 text-sm'>
				<p className='text-muted-foreground'>Завантажуємо реквізити…</p>
			</div>
		)
	}

	if (isError || !data?.iban) {
		return (
			<div className='bg-muted border-border mt-2.5 rounded-xl border p-4 text-sm'>
				<p className='text-muted-foreground'>
					Реквізити для оплати надішле менеджер після підтвердження замовлення.
				</p>
			</div>
		)
	}

	const { label, iban, taxId, bankName } = data.iban

	return (
		<div className='bg-muted border-border mt-2.5 rounded-xl border p-4 text-sm leading-relaxed'>
			<p className='mb-1 flex items-center gap-2 font-semibold'>
				<Landmark className='h-4 w-4' />
				Реквізити для оплати
			</p>
			<p>
				<span className='text-muted-foreground'>Отримувач:</span> <b>{label}</b>
			</p>
			<p className='break-all'>
				<span className='text-muted-foreground'>IBAN:</span>{' '}
				<b className='font-mono font-semibold'>{iban}</b>
			</p>
			<p>
				<span className='text-muted-foreground'>ЄДРПОУ/ІПН:</span> <b>{taxId}</b>
			</p>
			<p>
				<span className='text-muted-foreground'>Банк:</span> <b>{bankName}</b>
			</p>
			<p className='mt-1'>
				<span className='text-muted-foreground'>Призначення платежу:</span> оплата
				замовлення №{orderNumber ?? '…'}
			</p>
		</div>
	)
}
