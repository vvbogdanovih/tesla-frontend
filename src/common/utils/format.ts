export const formatMoney = (value: string | number): string => {
	const n = typeof value === 'string' ? Number(value) : value
	return `${n.toLocaleString('uk-UA')} ₴`
}

export const discountPercent = (price: string, oldPrice: string | null): number | null => {
	if (!oldPrice) return null
	const p = Number(price)
	const o = Number(oldPrice)
	if (!o || o <= p) return null
	return Math.round((1 - p / o) * 100)
}

export const TYPE_LABEL: Record<string, string> = { original: 'Оригінал', analog: 'Аналог' }
export const CONDITION_LABEL: Record<string, string> = {
	new: 'Новий',
	used: 'Б/у',
	clearance: 'Уцінка'
}
