'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useAuthStore } from '@/common/store/useAuthStore'
import { useToggleWishlist, useWishlistIds } from '@/common/hooks/useWishlist'
import { LoginGateModal } from '@/common/components/auth/LoginGateModal'
import { cn } from '@/common/utils/shad-cn.utils'
import type { CatalogProduct } from '@/common/types'

interface Props {
	product: CatalogProduct
	variant?: 'card' | 'detail' | 'inline'
}

// ♡-тумблер обраного. Гість → попап логіну (ADR-0012, обране лише для авторизованих).
export const WishlistButton = ({ product, variant = 'card' }: Props) => {
	const isLoggedIn = useAuthStore(s => !!s.user)
	const ids = useWishlistIds()
	const toggle = useToggleWishlist()
	const [gateOpen, setGateOpen] = useState(false)
	const active = ids.has(String(product.id))

	const onClick = () => {
		if (!isLoggedIn) return setGateOpen(true)
		toggle.mutate({ productId: String(product.id), next: !active, product })
	}

	if (variant === 'detail') {
		return (
			<>
				<button
					type='button'
					onClick={onClick}
					aria-pressed={active}
					className='border-border hover:bg-muted flex h-12 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-bold transition-colors'
				>
					<Heart className={cn('h-4 w-4', active && 'fill-primary text-primary')} />
					{active ? 'В обраному' : 'В обране'}
				</button>
				<LoginGateModal open={gateOpen} onClose={() => setGateOpen(false)} />
			</>
		)
	}

	if (variant === 'inline') {
		return (
			<>
				<button
					type='button'
					onClick={onClick}
					aria-pressed={active}
					aria-label={active ? 'Прибрати з обраного' : 'Додати в обране'}
					className='border-border hover:bg-muted grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg border transition-colors'
				>
					<Heart
						className={cn(
							'h-4 w-4',
							active ? 'fill-primary text-primary' : 'text-muted-foreground'
						)}
					/>
				</button>
				<LoginGateModal open={gateOpen} onClose={() => setGateOpen(false)} />
			</>
		)
	}

	return (
		<>
			<button
				type='button'
				onClick={onClick}
				aria-pressed={active}
				aria-label={active ? 'Прибрати з обраного' : 'Додати в обране'}
				className='border-border bg-card/80 hover:bg-card absolute top-2 right-2 z-20 grid h-9 w-9 cursor-pointer place-items-center rounded-full border backdrop-blur transition-colors'
			>
				<Heart
					className={cn(
						'h-4 w-4',
						active ? 'fill-primary text-primary' : 'text-muted-foreground'
					)}
				/>
			</button>
			<LoginGateModal open={gateOpen} onClose={() => setGateOpen(false)} />
		</>
	)
}
