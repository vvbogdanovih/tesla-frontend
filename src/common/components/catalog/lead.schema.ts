import { z } from 'zod'
import { isValidUaPhone } from '@/common/utils/phone'

// Схема заявки-ліда (LeadButton). Окремим файлом — щоб тестувати без jsdom (F6).
export const leadSchema = z.object({
	name: z.string().trim().min(2, "Вкажіть ім'я (мінімум 2 символи)"),
	phone: z
		.string()
		.trim()
		.min(1, 'Вкажіть телефон')
		.refine(v => isValidUaPhone(v), 'Формат: +380 XX XXX XX XX'),
	email: z.string().trim().email('Некоректний email').optional().or(z.literal('')),
	vin: z.string().trim().optional(),
	link: z.string().trim().url('Некоректне посилання').optional().or(z.literal('')),
	// '' — поле не заповнене; інакше коерсимо рядок з інпута в додатне число
	targetPrice: z.union([z.literal(''), z.coerce.number().positive('Вкажіть додатну ціну')]),
	message: z.string().trim().optional()
})

export type LeadFormValues = z.infer<typeof leadSchema>
