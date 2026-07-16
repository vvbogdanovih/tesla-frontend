import { describe, expect, it } from 'vitest'
import { cleanPhone, isValidUaPhone, normalizePhone } from './phone'

describe('cleanPhone', () => {
	it('прибирає пробіли, дефіси й дужки', () => {
		expect(cleanPhone('+38 (073) 725-18-81')).toBe('+380737251881')
	})
})

describe('normalizePhone', () => {
	it('0XX… → +380…', () => {
		expect(normalizePhone('0737251881')).toBe('+380737251881')
	})

	it('380… → +380…', () => {
		expect(normalizePhone('380737251881')).toBe('+380737251881')
	})

	it('+380… лишається як є', () => {
		expect(normalizePhone('+380737251881')).toBe('+380737251881')
	})

	it('нормалізує з пробілами/дужками', () => {
		expect(normalizePhone('(073) 725 18 81')).toBe('+380737251881')
	})

	it('сміття пропускає без змін (лише чистить розділювачі)', () => {
		expect(normalizePhone('abc')).toBe('abc')
		expect(normalizePhone('+49 170 1234567')).toBe('+491701234567')
	})
})

describe('isValidUaPhone', () => {
	it('приймає 0XXXXXXXXX, 380…, +380… та з пробілами', () => {
		expect(isValidUaPhone('0737251881')).toBe(true)
		expect(isValidUaPhone('380737251881')).toBe(true)
		expect(isValidUaPhone('+380737251881')).toBe(true)
		expect(isValidUaPhone('+380 73 725 18 81')).toBe(true)
	})

	it('відхиляє закороткі/задовгі номери', () => {
		expect(isValidUaPhone('073725188')).toBe(false) // 9 цифр
		expect(isValidUaPhone('07372518811')).toBe(false) // 11 цифр
	})

	it('відхиляє чужі коди та сміття', () => {
		expect(isValidUaPhone('+491701234567')).toBe(false)
		expect(isValidUaPhone('abc')).toBe(false)
		expect(isValidUaPhone('')).toBe(false)
	})
})
