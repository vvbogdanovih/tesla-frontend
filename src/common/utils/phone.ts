// Український мобільний: +380XXXXXXXXX (приймаємо 0XX…, 380…, з пробілами/дужками)
export const cleanPhone = (raw: string) => raw.replace(/[\s\-()]/g, '')

export const normalizePhone = (raw: string) => {
	const p = cleanPhone(raw)
	if (p.startsWith('+380')) return p
	if (p.startsWith('380')) return `+${p}`
	if (p.startsWith('0')) return `+38${p}`
	return p
}

export const isValidUaPhone = (raw: string) => /^(\+?380|0)\d{9}$/.test(cleanPhone(raw))
