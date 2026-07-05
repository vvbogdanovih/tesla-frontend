import { z } from 'zod'
import { httpService } from './http.service'
import { API_URLS } from '@/common/constants/api-routes.constants'

// ── Схеми відповідей бекенда ────────────────────────────────────────────────

export const orderItemSchema = z.object({
	id: z.string(),
	productId: z.string(),
	name: z.string(),
	sku: z.string(),
	price: z.string(), // Decimal приходить рядком
	qty: z.number()
})

const paymentSchema = z.object({
	method: z.string(), // 'cod' | 'iban' | 'cash' | 'card' (толерантно до нових)
	status: z.string()
})

// Повне замовлення (POST /orders, GET /account/orders)
export const orderSchema = z.object({
	id: z.string(),
	orderNumber: z.string(),
	status: z.string(),
	total: z.string(),
	createdAt: z.string(),
	customer: z.object({
		name: z.string(),
		phone: z.string(),
		email: z.string().nullish()
	}),
	delivery: z.object({
		method: z.string(), // 'np' | 'ukrposhta' | 'pickup'
		city: z.string().nullish(),
		warehouse: z.string().nullish()
	}),
	payment: paymentSchema,
	comment: z.string().nullish(),
	items: z.array(orderItemSchema),
	// Онлайн-оплата: посилання на сторінку monopay (лише у відповіді на create для method=card)
	paymentUrl: z.string().url().optional()
})

// Публічний lookup за номером — лише безпечні поля
export const orderSummarySchema = z.object({
	orderNumber: z.string(),
	status: z.string(),
	total: z.string(),
	createdAt: z.string(),
	payment: paymentSchema
})

export const paymentRequisitesSchema = z.object({
	iban: z
		.object({
			label: z.string(),
			taxId: z.string(),
			iban: z.string(),
			bankName: z.string()
		})
		.nullable()
})

export type Order = z.infer<typeof orderSchema>
export type OrderItem = z.infer<typeof orderItemSchema>
export type OrderSummary = z.infer<typeof orderSummarySchema>
export type PaymentRequisites = z.infer<typeof paymentRequisitesSchema>

// ── Пейлоад створення замовлення ────────────────────────────────────────────

export type DeliveryMethod = 'np' | 'ukrposhta' | 'pickup'
export type PaymentMethod = 'cod' | 'iban' | 'cash' | 'card'

export interface CreateOrderPayload {
	items: { productId: string; qty: number }[]
	customer: { name: string; phone: string; email?: string }
	delivery: {
		method: DeliveryMethod
		city?: string
		warehouse?: string
		// Nova Poshta — refs/тип зі снапшоту (ADR-0014), для майбутнього ТТН
		cityRef?: string
		warehouseRef?: string
		warehouseType?: 'branch' | 'postomat' | 'cargo'
	}
	paymentMethod: PaymentMethod
	comment?: string
}

// skipErrorToast — помилки (зокрема нестачу залишків 400/409) показуємо
// тостом на самій формі, щоб контролювати текст і не чистити кошик.
export const ordersApi = {
	create: (data: CreateOrderPayload) =>
		httpService.post<Order, CreateOrderPayload>(API_URLS.ORDERS.BASE, data, {
			schema: orderSchema,
			skipErrorToast: true
		}),

	byNumber: (number: string) =>
		httpService.get<OrderSummary>(API_URLS.ORDERS.BY_NUMBER(encodeURIComponent(number)), {
			schema: orderSummarySchema,
			skipErrorToast: true
		}),

	accountOrders: () =>
		httpService.get<Order[]>(API_URLS.ACCOUNT.ORDERS, {
			schema: z.array(orderSchema),
			skipErrorToast: true
		}),

	paymentRequisites: () =>
		httpService.get<PaymentRequisites>(API_URLS.PAYMENT_REQUISITES.ACTIVE, {
			schema: paymentRequisitesSchema,
			skipErrorToast: true
		})
}

// ── Передача замовлення на сторінку успіху (sessionStorage) ────────────────

const LAST_ORDER_KEY = 'tesla-last-order'

export const stashLastOrder = (order: Order) => {
	try {
		sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order))
	} catch {
		// sessionStorage недоступний — сторінка успіху підтягне з API
	}
}

export const readLastOrder = (orderNumber: string): Order | null => {
	try {
		const raw = sessionStorage.getItem(LAST_ORDER_KEY)
		if (!raw) return null
		const parsed = orderSchema.safeParse(JSON.parse(raw))
		return parsed.success && parsed.data.orderNumber === orderNumber ? parsed.data : null
	} catch {
		return null
	}
}
