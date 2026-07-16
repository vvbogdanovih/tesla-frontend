import { describe, expect, it } from 'vitest'
import { checkoutSchema } from './checkout.schema'

// Контракт superRefine-гілок доставки: np вимагає ref-и з довідника (ADR-0014),
// ukrposhta — довільні текстові city/warehouse, pickup — нічого
const base = {
	name: 'Іван Тест',
	phone: '0737251881',
	delivery: 'pickup' as const,
	paymentMethod: 'cod' as const
}

const issuePaths = (values: unknown): string[] => {
	const res = checkoutSchema.safeParse(values)
	return res.success ? [] : res.error.issues.map(i => String(i.path[0]))
}

describe('checkoutSchema — базові поля', () => {
	it('pickup: валідний мінімум без адреси', () => {
		expect(checkoutSchema.safeParse(base).success).toBe(true)
	})

	it('кривий телефон → issue на phone', () => {
		expect(issuePaths({ ...base, phone: '12345' })).toContain('phone')
	})
})

describe('checkoutSchema — гілка np', () => {
	it('без ref-ів довідника → issues на city та warehouse', () => {
		const paths = issuePaths({ ...base, delivery: 'np' })
		expect(paths).toContain('city')
		expect(paths).toContain('warehouse')
	})

	it('текстові city/warehouse без ref-ів не рятують (потрібен вибір із довідника)', () => {
		const paths = issuePaths({ ...base, delivery: 'np', city: 'Львів', warehouse: '№1' })
		expect(paths).toContain('city')
		expect(paths).toContain('warehouse')
	})

	it('з cityRef, але без warehouseRef → issue лише на warehouse', () => {
		const paths = issuePaths({ ...base, delivery: 'np', city: 'Львів', cityRef: 'ref-1' })
		expect(paths).not.toContain('city')
		expect(paths).toContain('warehouse')
	})

	it('обидва ref-и → валідно', () => {
		const res = checkoutSchema.safeParse({
			...base,
			delivery: 'np',
			city: 'Львів',
			cityRef: 'ref-1',
			warehouse: 'Відділення №1',
			warehouseRef: 'wh-1',
			warehouseType: 'branch'
		})
		expect(res.success).toBe(true)
	})
})

describe('checkoutSchema — гілка ukrposhta', () => {
	it('без city/warehouse → issues на обидва поля', () => {
		const paths = issuePaths({ ...base, delivery: 'ukrposhta' })
		expect(paths).toContain('city')
		expect(paths).toContain('warehouse')
	})

	it('текстових city/warehouse достатньо (ref-и не потрібні)', () => {
		const res = checkoutSchema.safeParse({
			...base,
			delivery: 'ukrposhta',
			city: 'Львів',
			warehouse: '79000'
		})
		expect(res.success).toBe(true)
	})
})
