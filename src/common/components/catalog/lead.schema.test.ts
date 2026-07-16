import { describe, expect, it } from 'vitest'
import { leadSchema } from './lead.schema'

// Контракт схеми заявки-ліда (F3): мінімум — імʼя + валідний UA-телефон
const valid = { name: 'Іван', phone: '0737251881', targetPrice: '' as const }

describe('leadSchema', () => {
	it('приймає валідний мінімум (name + phone)', () => {
		expect(leadSchema.safeParse(valid).success).toBe(true)
	})

	it('приймає телефон у форматі +380 та з пробілами', () => {
		expect(leadSchema.safeParse({ ...valid, phone: '+380737251881' }).success).toBe(true)
		expect(leadSchema.safeParse({ ...valid, phone: '+380 73 725 18 81' }).success).toBe(true)
	})

	it('відхиляє кривий телефон з issue на phone', () => {
		const res = leadSchema.safeParse({ ...valid, phone: '12345' })
		expect(res.success).toBe(false)
		if (!res.success) {
			expect(res.error.issues.some(i => i.path[0] === 'phone')).toBe(true)
		}
	})

	it("targetPrice: '' — поле не заповнене, ок", () => {
		const res = leadSchema.safeParse({ ...valid, targetPrice: '' })
		expect(res.success).toBe(true)
		if (res.success) expect(res.data.targetPrice).toBe('')
	})

	it("targetPrice: '3000' коерситься в число 3000", () => {
		const res = leadSchema.safeParse({ ...valid, targetPrice: '3000' })
		expect(res.success).toBe(true)
		if (res.success) expect(res.data.targetPrice).toBe(3000)
	})

	it('targetPrice: -5 → помилка (лише додатна ціна)', () => {
		const res = leadSchema.safeParse({ ...valid, targetPrice: -5 })
		expect(res.success).toBe(false)
		if (!res.success) {
			expect(res.error.issues.some(i => i.path[0] === 'targetPrice')).toBe(true)
		}
	})

	it('кривий link → помилка; порожній — ок', () => {
		expect(leadSchema.safeParse({ ...valid, link: 'не-посилання' }).success).toBe(false)
		expect(leadSchema.safeParse({ ...valid, link: '' }).success).toBe(true)
		expect(leadSchema.safeParse({ ...valid, link: 'https://example.com/p/1' }).success).toBe(
			true
		)
	})

	it('кривий email → помилка; порожній — ок', () => {
		expect(leadSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false)
		expect(leadSchema.safeParse({ ...valid, email: '' }).success).toBe(true)
	})

	it("закоротке ім'я → помилка", () => {
		expect(leadSchema.safeParse({ ...valid, name: 'І' }).success).toBe(false)
	})
})
