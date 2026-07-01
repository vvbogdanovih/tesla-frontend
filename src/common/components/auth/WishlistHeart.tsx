'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Heart } from 'lucide-react'
import { UI_ROUTES } from '@/common/constants/ui-routes.constants'
import { useAuthStore } from '@/common/store/useAuthStore'
import { useWishlistIds } from '@/common/hooks/useWishlist'
import { LoginGateModal } from './LoginGateModal'

// Сердечко у хедері. Авторизований → перехід у кабінет (список бажаного).
// Неавторизований → попап із пропозицією увійти.
export const WishlistHeart = () => {
	const isLoggedIn = useAuthStore(s => !!s.user)
	const isLoading = useAuthStore(s => s.isLoading)
	const ids = useWishlistIds()
	const [gateOpen, setGateOpen] = useState(false)

	// Поки перевіряємо сесію — нейтральне неактивне серце (без хибного попапа).
	if (isLoading) {
		return <Heart aria-hidden className='text-muted-foreground h-5 w-5' />
	}

	if (isLoggedIn) {
		const count = ids.size
		return (
			<Link href={UI_ROUTES.WISHLIST} aria-label='Обране' className='relative'>
				<Heart className='h-5 w-5' />
				{count > 0 && (
					<span className='bg-primary text-primary-foreground absolute -top-2 -right-2 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] leading-none font-bold'>
						{count}
					</span>
				)}
			</Link>
		)
	}

	return (
		<>
			<button
				type='button'
				onClick={() => setGateOpen(true)}
				aria-label='Список бажаного'
				className='cursor-pointer'
			>
				<Heart className='h-5 w-5' />
			</button>
			<LoginGateModal open={gateOpen} onClose={() => setGateOpen(false)} />
		</>
	)
}
