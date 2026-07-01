'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { wishlistApi } from '@/common/services/wishlist.api'
import { useAuthStore } from '@/common/store/useAuthStore'
import type { CatalogProduct } from '@/common/types'

export const WISHLIST_QK = ['wishlist'] as const

const EMPTY_IDS: ReadonlySet<string> = new Set<string>()

// Список обраного поточного користувача (лише авторизований) — джерело правди БД.
export const useWishlist = () => {
	const isLoggedIn = useAuthStore(s => !!s.user)
	return useQuery({
		queryKey: WISHLIST_QK,
		queryFn: wishlistApi.list,
		enabled: isLoggedIn,
		staleTime: 30_000
	})
}

// Множина id товарів у обраному — для стану ♡ на картках і лічильника в хедері.
export const useWishlistIds = (): ReadonlySet<string> => {
	const isLoggedIn = useAuthStore(s => !!s.user)
	const { data } = useQuery({
		queryKey: WISHLIST_QK,
		queryFn: wishlistApi.list,
		enabled: isLoggedIn,
		staleTime: 30_000,
		select: (items: CatalogProduct[]) => new Set(items.map(p => String(p.id)))
	})
	return data ?? EMPTY_IDS
}

interface ToggleVars {
	productId: string
	next: boolean // true = додати, false = прибрати
	product?: CatalogProduct // для оптимістичного показу на сторінці /wishlist
}

// Тумблер обраного з оптимістичним оновленням кешу (миттєвий ♡).
export const useToggleWishlist = () => {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ productId, next }: ToggleVars) =>
			next ? wishlistApi.add(productId) : wishlistApi.remove(productId),
		onMutate: async ({ productId, next, product }: ToggleVars) => {
			await qc.cancelQueries({ queryKey: WISHLIST_QK })
			const prev = qc.getQueryData<CatalogProduct[]>(WISHLIST_QK) ?? []
			const optimistic = next
				? prev.some(p => String(p.id) === productId) || !product
					? prev
					: [product, ...prev]
				: prev.filter(p => String(p.id) !== productId)
			qc.setQueryData(WISHLIST_QK, optimistic)
			return { prev }
		},
		onError: (_err, _vars, ctx) => {
			if (ctx?.prev) qc.setQueryData(WISHLIST_QK, ctx.prev)
			toast.error('Не вдалося оновити обране')
		},
		onSuccess: (_data, { next }: ToggleVars) => {
			toast.success(next ? 'Додано в обране' : 'Прибрано з обраного')
		},
		onSettled: () => {
			qc.invalidateQueries({ queryKey: WISHLIST_QK })
		}
	})
}
