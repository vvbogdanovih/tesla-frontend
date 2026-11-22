'use client'

import { useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import { useReducedMotion } from '@/common/hooks/useReducedMotion'

const DESKTOP_QUERY = '(min-width: 768px)'

const subscribeDesktop = (onChange: () => void) => {
	const mql = window.matchMedia(DESKTOP_QUERY)
	mql.addEventListener('change', onChange)
	return () => mql.removeEventListener('change', onChange)
}

// SSR-фолбек false → <video> домонтовується лише на клієнті після гідрації
const useIsDesktop = () =>
	useSyncExternalStore(
		subscribeDesktop,
		() => window.matchMedia(DESKTOP_QUERY).matches,
		() => false
	)

const POSITION_CLASS =
	'pointer-events-none absolute inset-y-0 right-0 z-0 hidden h-full w-[66%] object-cover object-right md:block'

const MASK_STYLE = {
	WebkitMaskImage: 'linear-gradient(90deg,transparent 0%,#000 42%,#000 100%)',
	maskImage: 'linear-gradient(90deg,transparent 0%,#000 42%,#000 100%)'
} as const

// Hero-фон головної: постер завжди в розмітці (SSR, стабільний LCP), а <video>
// монтується поверх лише на клієнті, лише на ≥768px і лише без
// prefers-reduced-motion — інакше 2.6MB hero.mp4 вантажився навіть на мобайлі,
// де відео сховане CSS.
//
// Щойно відео реально грає (onPlaying) — постер прибираємо з DOM: обидва шари
// мають одну градієнтну маску, і в зоні її переходу відео напівпрозоре, тож
// крізь нього просвічував статичний силует авто з постера («застиглий кадр»).
export const HeroVideo = () => {
	const desktop = useIsDesktop()
	const reduced = useReducedMotion()
	const [playing, setPlaying] = useState(false)

	const showVideo = desktop && !reduced

	return (
		<>
			{!(showVideo && playing) && (
				<Image
					src='/hero.jpg'
					alt=''
					aria-hidden
					width={1600}
					height={800}
					priority
					className={POSITION_CLASS}
					style={MASK_STYLE}
				/>
			)}
			{showVideo && (
				<video
					aria-hidden
					autoPlay
					muted
					loop
					playsInline
					preload='metadata'
					poster='/hero.jpg'
					className={POSITION_CLASS}
					style={MASK_STYLE}
					onPlaying={() => setPlaying(true)}
				>
					<source src='/hero.mp4' type='video/mp4' />
				</video>
			)}
		</>
	)
}
