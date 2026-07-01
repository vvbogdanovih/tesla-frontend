import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
	productId: string
	slug: string
	name: string
	sku: string
	price: number
	image: string | null
	stockQty: number
	qty: number
}

export type CartProduct = Omit<CartItem, 'qty'>

// результат додавання: ok=false коли вперлися в наявність
export interface AddResult {
	ok: boolean
	max: number // 0 = «під замовлення», без межі
}

interface CartState {
	items: CartItem[]
	isOpen: boolean
	hasHydrated: boolean
	add: (product: CartProduct, qty?: number) => AddResult
	increment: (productId: string) => boolean
	setQty: (productId: string, qty: number) => void
	remove: (productId: string) => void
	clear: () => void
	open: () => void
	close: () => void
	toggle: () => void
	setHasHydrated: (v: boolean) => void
}

// qty в межах [1, stockQty] (викликається лише для наявних товарів, stockQty > 0)
const clampQty = (qty: number, stockQty: number): number => Math.max(1, Math.min(qty, stockQty))

// чи досягнуто/перевищено наявність (для stockQty<=0 — завжди true: товару нема)
const atStockLimit = (qty: number, stockQty: number): boolean => stockQty <= 0 || qty >= stockQty

export const useCartStore = create<CartState>()(
	persist(
		(set, get) => ({
			items: [],
			isOpen: false,
			hasHydrated: false,

			add: (product, qty = 1) => {
				// немає на складі — додати неможливо
				if (product.stockQty <= 0) return { ok: false, max: 0 }
				const existing = get().items.find(i => i.productId === product.productId)
				const current = existing?.qty ?? 0
				// вперлися в наявність — нічого не додаємо
				if (atStockLimit(current, product.stockQty)) {
					return { ok: false, max: product.stockQty }
				}
				if (existing) {
					set({
						items: get().items.map(i =>
							i.productId === product.productId
								? { ...i, ...product, qty: clampQty(i.qty + qty, product.stockQty) }
								: i
						)
					})
				} else {
					set({ items: [...get().items, { ...product, qty: clampQty(qty, product.stockQty) }] })
				}
				return { ok: true, max: product.stockQty }
			},

			// +1 з перевіркою наявності; false = досягнуто межі
			increment: productId => {
				const item = get().items.find(i => i.productId === productId)
				if (!item) return false
				if (atStockLimit(item.qty, item.stockQty)) return false
				set({
					items: get().items.map(i =>
						i.productId === productId ? { ...i, qty: clampQty(i.qty + 1, i.stockQty) } : i
					)
				})
				return true
			},

			setQty: (productId, qty) =>
				set({
					items: get().items.flatMap(i => {
						if (i.productId !== productId) return [i]
						if (qty <= 0) return [] // «−» на 1 або явний 0 → прибрати позицію
						if (i.stockQty <= 0) return [] // немає на складі → не тримати в кошику
						return [{ ...i, qty: clampQty(qty, i.stockQty) }]
					})
				}),

			remove: productId => set({ items: get().items.filter(i => i.productId !== productId) }),

			clear: () => set({ items: [] }),

			open: () => set({ isOpen: true }),
			close: () => set({ isOpen: false }),
			toggle: () => set({ isOpen: !get().isOpen }),

			setHasHydrated: v => set({ hasHydrated: v })
		}),
		{
			name: 'tesla-cart',
			partialize: state => ({ items: state.items }),
			onRehydrateStorage: () => state => state?.setHasHydrated(true)
		}
	)
)

// Зручні селектори (похідні значення)
export const useCartCount = () => useCartStore(s => s.items.reduce((n, i) => n + i.qty, 0))
export const useCartTotal = () => useCartStore(s => s.items.reduce((sum, i) => sum + i.price * i.qty, 0))
