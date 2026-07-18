import { z } from 'zod'
import { httpService } from './http.service'
import { API_URLS } from '@/common/constants/api-routes.constants'

// Відповідь створення інвойсу monopay — посилання на сторінку оплати
export const invoiceResultSchema = z.object({
	pageUrl: z.string().url()
})

// Статус оплати замовлення (поллінг зі сторінки успіху)
export const paymentStatusSchema = z.object({
	paymentStatus: z.string() // 'pending' | 'paid' | 'failed' | 'refunded'
})

export type InvoiceResult = z.infer<typeof invoiceResultSchema>
export type PaymentStatusResult = z.infer<typeof paymentStatusSchema>

export const paymentsApi = {
	// Створити/повторити інвойс; повертає pageUrl для редіректу на оплату
	createInvoice: (publicId: string) =>
		httpService.post<InvoiceResult, { publicId: string }>(
			API_URLS.PAYMENTS.MONOPAY_INVOICE,
			{ publicId },
			{ schema: invoiceResultSchema }
		),

	// Звірити статус оплати (fallback до вебхука)
	status: (publicId: string) =>
		httpService.get<PaymentStatusResult>(
			API_URLS.PAYMENTS.MONOPAY_STATUS(encodeURIComponent(publicId)),
			{ schema: paymentStatusSchema, skipErrorToast: true }
		)
}
