import { redirect } from 'next/navigation'

// Пошук рендериться каталогом (/shop підтримує ?q=). Тут — лише редірект.
export default async function SearchPage({
	searchParams
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
	const sp = await searchParams
	const q = typeof sp.q === 'string' ? sp.q : ''
	redirect(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop')
}
