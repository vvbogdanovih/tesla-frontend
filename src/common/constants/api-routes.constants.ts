export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!

export const API_URLS = {
	AUTH: {
		LOGIN: `/auth/login`,
		REGISTER: `/auth/register`,
		REFRESH: `/auth/refresh`,
		LOGOUT: `/auth/logout`,
		ME: `/auth/me`,
		FORGOT_PASSWORD: `/auth/forgot-password`,
		RESET_PASSWORD: `/auth/reset-password`
	},
	ACCOUNT: {
		PROFILE: `/account/profile`,
		ADDRESSES: `/account/addresses`,
		ORDERS: `/account/orders`
	},
	PRODUCTS: {
		BASE: `/products`,
		SEARCH: `/products/search`,
		BY_SLUG: (slug: string) => `/products/by-slug/${slug}`,
		BY_ID: (id: string) => `/products/${id}`
	},
	CARS: {
		BASE: `/cars`
	},
	CATEGORIES: {
		BASE: `/categories`,
		PRODUCTS: (slug: string) => `/categories/${slug}/products`
	},
	CART: {
		BASE: `/cart`
	},
	ORDERS: {
		BASE: `/orders`,
		BY_ID: (id: string) => `/orders/${id}`
	},
	LEADS: {
		BASE: `/leads`,
		PRICE_MATCH: `/leads/price-match`,
		PRICE_SUBSCRIBE: `/leads/price-subscribe`
	},
	BLOG: {
		BASE: `/blog`,
		BY_SLUG: (slug: string) => `/blog/${slug}`
	},
	NOVA_POSHTA: {
		CITIES: `/delivery/np/cities`,
		WAREHOUSES: `/delivery/np/warehouses`
	}
}
