import { beforeEach, describe, expect, it } from 'vitest'
import { useCartStore, type CartProduct } from './useCartStore'

// Чиста логіка store через getState() — без рендера компонентів
const product = (overrides: Partial<CartProduct> = {}): CartProduct => ({
	productId: 'p1',
	slug: 'test-part',
	name: 'Тестова запчастина',
	sku: 'SKU-1',
	price: 1000,
	image: null,
	stockQty: 3,
	...overrides
})

beforeEach(() => {
	useCartStore.setState({ items: [], isOpen: false })
	localStorage.clear()
})

describe('useCartStore.add', () => {
	it('не додає товар без наявності: {ok:false, max:0}', () => {
		const res = useCartStore.getState().add(product({ stockQty: 0 }))
		expect(res).toEqual({ ok: false, max: 0 })
		expect(useCartStore.getState().items).toHaveLength(0)
	})

	it('кламкує кількість до stockQty', () => {
		const res = useCartStore.getState().add(product({ stockQty: 3 }), 10)
		expect(res).toEqual({ ok: true, max: 3 })
		expect(useCartStore.getState().items[0].qty).toBe(3)
	})

	it('повторне додавання на межі наявності → ok:false', () => {
		const p = product({ stockQty: 2 })
		useCartStore.getState().add(p, 2)
		const res = useCartStore.getState().add(p)
		expect(res).toEqual({ ok: false, max: 2 })
		expect(useCartStore.getState().items[0].qty).toBe(2)
	})

	it('накопичує кількість у межах наявності', () => {
		const p = product({ stockQty: 5 })
		useCartStore.getState().add(p, 2)
		const res = useCartStore.getState().add(p, 2)
		expect(res.ok).toBe(true)
		expect(useCartStore.getState().items[0].qty).toBe(4)
	})
})

describe('useCartStore.increment', () => {
	it('повертає false на межі наявності', () => {
		const p = product({ stockQty: 1 })
		useCartStore.getState().add(p)
		expect(useCartStore.getState().increment(p.productId)).toBe(false)
		expect(useCartStore.getState().items[0].qty).toBe(1)
	})

	it('додає +1 нижче межі', () => {
		const p = product({ stockQty: 3 })
		useCartStore.getState().add(p)
		expect(useCartStore.getState().increment(p.productId)).toBe(true)
		expect(useCartStore.getState().items[0].qty).toBe(2)
	})

	it('повертає false для відсутньої позиції', () => {
		expect(useCartStore.getState().increment('nope')).toBe(false)
	})
})

describe('useCartStore.setQty', () => {
	it('qty 0 прибирає позицію з кошика', () => {
		const p = product()
		useCartStore.getState().add(p)
		useCartStore.getState().setQty(p.productId, 0)
		expect(useCartStore.getState().items).toHaveLength(0)
	})

	it('кламкує qty до наявності', () => {
		const p = product({ stockQty: 3 })
		useCartStore.getState().add(p)
		useCartStore.getState().setQty(p.productId, 99)
		expect(useCartStore.getState().items[0].qty).toBe(3)
	})
})

describe('persist (localStorage["tesla-cart"])', () => {
	it('зберігає items, але не isOpen (partialize)', () => {
		useCartStore.getState().add(product())
		useCartStore.getState().open()
		const raw = localStorage.getItem('tesla-cart')
		expect(raw).toBeTruthy()
		const persisted = JSON.parse(raw!)
		expect(persisted.state.items).toHaveLength(1)
		expect(persisted.state.items[0].productId).toBe('p1')
		expect(persisted.state).not.toHaveProperty('isOpen')
	})
})
