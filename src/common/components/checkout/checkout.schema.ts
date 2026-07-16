import { z } from 'zod'
import { cleanPhone } from '@/common/utils/phone'

// Схема чекауту. Окремим файлом — щоб тестувати superRefine-гілки без jsdom (F6)
export const checkoutSchema = z
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

export type CheckoutFormValues = z.infer<typeof checkoutSchema>
