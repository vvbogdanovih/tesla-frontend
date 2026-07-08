export const UI_ROUTES = {
	HOME: '/',
	SHOP: '/shop',
	PRICE_SHEET: '/price-sheet',
	PRODUCT: (slug: string) => `/product/${slug}`,
	SEARCH: '/search',
	CART: '/cart',
	CHECKOUT: '/checkout',
	ACCOUNT: '/account',
	ACCOUNT_ORDERS: '/account/orders',
	ACCOUNT_ADDRESSES: '/account/addresses',
	WISHLIST: '/wishlist',
	LOGIN: '/auth/login',
	REGISTER: '/auth/register',
	// Українські slug'и — відповідають старому сайту (SEO-наступність, ADR-0001)
	ABOUT: '/pro-nas',
	CONTACTS: '/kontakty'
} as const
