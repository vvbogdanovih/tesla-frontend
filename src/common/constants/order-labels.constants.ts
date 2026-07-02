// Українські підписи для enum-значень замовлення — єдине місце правди для UI.

export const ORDER_STATUS_LABEL: Record<string, string> = {
	new: 'Нове',
	processing: 'В обробці',
	shipped: 'Відправлено',
	completed: 'Виконано',
	done: 'Виконано',
	cancelled: 'Скасовано',
	canceled: 'Скасовано'
}

// Класи бейджа статусу (світла/темна теми)
export const ORDER_STATUS_BADGE: Record<string, string> = {
	new: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
	processing: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
	shipped: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
	completed: 'bg-green-500/10 text-green-600 dark:text-green-400',
	done: 'bg-green-500/10 text-green-600 dark:text-green-400',
	cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400',
	canceled: 'bg-red-500/10 text-red-600 dark:text-red-400'
}

export const ORDER_STATUS_BADGE_FALLBACK = 'bg-muted text-muted-foreground'

export const orderStatusLabel = (status: string): string => ORDER_STATUS_LABEL[status] ?? status

export const orderStatusBadgeClass = (status: string): string =>
	ORDER_STATUS_BADGE[status] ?? ORDER_STATUS_BADGE_FALLBACK

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
	cod: 'Накладений платіж',
	iban: 'За реквізитами (IBAN)',
	cash: 'Готівка',
	card: 'Картка онлайн'
}

export const paymentMethodLabel = (method: string): string => PAYMENT_METHOD_LABEL[method] ?? method

export const DELIVERY_METHOD_LABEL: Record<string, string> = {
	np: 'Нова Пошта',
	ukrposhta: 'Укрпошта',
	pickup: 'Самовивіз'
}

export const deliveryMethodLabel = (method: string): string =>
	DELIVERY_METHOD_LABEL[method] ?? method
