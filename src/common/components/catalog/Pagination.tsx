import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const Pagination = ({
	page,
	pages,
	params
}: {
	page: number
	pages: number
	params: URLSearchParams
}) => {
	if (pages <= 1) return null

	const href = (p: number) => {
		const q = new URLSearchParams(params.toString())
		if (p > 1) q.set('page', String(p))
		else q.delete('page')
		const s = q.toString()
		return `/shop${s ? `?${s}` : ''}`
	}

	const item =
		'border-border flex h-10 min-w-10 items-center justify-center gap-1 rounded-lg border px-3 text-sm font-medium'
	const disabled = 'pointer-events-none opacity-40'

	return (
		<nav className='mt-10 flex items-center justify-center gap-2'>
			<Link href={href(page - 1)} className={`${item} ${page <= 1 ? disabled : 'hover:bg-muted'}`}>
				<ChevronLeft className='h-4 w-4' /> Назад
			</Link>
			<span className='text-muted-foreground px-2 text-sm'>
				Сторінка {page} з {pages}
			</span>
			<Link
				href={href(page + 1)}
				className={`${item} ${page >= pages ? disabled : 'hover:bg-muted'}`}
			>
				Далі <ChevronRight className='h-4 w-4' />
			</Link>
		</nav>
	)
}
