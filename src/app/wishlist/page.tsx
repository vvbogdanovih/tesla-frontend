'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useAuthStore } from '@/common/store/useAuthStore'
import { UI_ROUTES } from '@/common/constants'
import { useWishlist } from '@/common/hooks/useWishlist'
import { ProductCard } from '@/common/components/catalog/ProductCard'
import { FullScreenLoader } from '@/common/components'

// «товар / товари / товарів»
const pluralItems = (n: number) => {
	const mod10 = n % 10
	const mod100 = n % 100
	if (mod10 === 1 && mod100 !== 11) return 'товар'
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'товари'
	return 'товарів'
}

export default function WishlistPage() {
	const router = useRouter()
	const user = useAuthStore(s => s.user)
	const isAuthLoading = useAuthStore(s => s.isLoading)

	// Гейт: неавторизованих ведемо на вхід із поверненням у обране (ADR-0012).
	useEffect(() => {
		if (!isAuthLoading && !user) {
			router.replace(`${UI_ROUTES.LOGIN}?next=${encodeURIComponent(UI_ROUTES.WISHLIST)}`)
		}
	}, [isAuthLoading, user, router])

	const { data, isPending, isError } = useWishlist()

	if (isAuthLoading || !user) return <FullScreenLoader />

	const items = data ?? []

	return (
		<main className='mx-auto max-w-[1240px] px-6 py-10'>
			<h1 className='font-display text-2xl font-bold'>Обране</h1>
			<p className='text-muted-foreground mt-1 text-sm'>
				{items.length > 0
					? `${items.length} ${pluralItems(items.length)}`
					: 'Збережені товари'}
			</p>

			{isPending ? (
				<div className='py-20'>
					<FullScreenLoader />
				</div>
			) : isError ? (
				<p className='text-muted-foreground py-20 text-center text-sm'>
					Не вдалося завантажити обране. Спробуйте оновити сторінку.
				</p>
			) : items.length === 0 ? (
				<div className='border-border bg-card mt-8 flex flex-col items-center rounded-2xl border px-6 py-16 text-center'>
					<div className='bg-muted mb-4 grid h-16 w-16 place-items-center rounded-full'>
						<Heart className='text-muted-foreground h-8 w-8' />
					</div>
					<p className='text-lg font-semibold'>У «Обраному» поки порожньо</p>
					<p className='text-muted-foreground mt-1 text-sm'>
						Тисніть ♡ на товарах, щоб зберегти їх на потім.
					</p>
					<Link
						href={UI_ROUTES.SHOP}
						className='bg-primary text-primary-foreground mt-6 flex h-11 items-center justify-center rounded-xl px-6 text-sm font-bold transition-opacity hover:opacity-90'
					>
						До каталогу
					</Link>
				</div>
			) : (
				<div className='mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
					{items.map(p => (
						<ProductCard key={p.id} product={p} />
					))}
				</div>
			)}
		</main>
	)
}
