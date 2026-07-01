import { httpService } from './http.service'
import { API_URLS } from '@/common/constants/api-routes.constants'
import type { CatalogProduct } from '@/common/types'

export interface WishlistToggleResult {
	ok: boolean
	inWishlist: boolean
}

// Обране — лише для авторизованих (ADR-0012). Джерело правди — БД; cookie-сесія.
export const wishlistApi = {
	list: () => httpService.get<CatalogProduct[]>(API_URLS.WISHLIST.BASE, { skipErrorToast: true }),

	add: (productId: string) =>
		httpService.post<WishlistToggleResult>(API_URLS.WISHLIST.TOGGLE(productId)),

	remove: (productId: string) =>
		httpService.delete<WishlistToggleResult>(API_URLS.WISHLIST.TOGGLE(productId))
}
