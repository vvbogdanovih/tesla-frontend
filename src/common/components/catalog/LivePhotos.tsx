'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Camera, Check, ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { CatalogImage } from '@/common/types'

// «Живі фото товару» — акцентна смуга-довіри між галереєю та описом (FRD §3.4).
// Реальні знімки саме цього екземпляра; окремий блок, щоб не зливатися зі студійною галереєю.
// Рендериться лише за наявності фото (інакше для користувача блок відсутній).
export const LivePhotos = ({ photos, productName }: { photos: CatalogImage[]; productName: string }) => {
	const [active, setActive] = useState<number | null>(null)
	if (!photos.length) return null

	const alt = (i: number) => photos[i].alt ?? `${productName} — живе фото ${i + 1}`
	const prev = () => setActive(a => (a === null ? a : (a - 1 + photos.length) % photos.length))
	const next = () => setActive(a => (a === null ? a : (a + 1) % photos.length))

	return (
		<section className='mt-10 rounded-2xl border border-amber-200 bg-amber-50/50 p-5 sm:p-6 dark:border-amber-900 dark:bg-amber-800/60'>
			<div className='flex flex-wrap items-center gap-3'>
				<span className='bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-xl'>
					<Camera className='h-5 w-5' />
				</span>
				<h2 className='text-lg font-bold tracking-[-0.01em]'>Живі фото товару</h2>
				<span className='text-accent-text ml-auto inline-flex items-center gap-1.5 rounded-full border border-amber-300 px-2.5 py-1 text-xs font-bold dark:border-amber-700'>
					<Check className='h-3.5 w-3.5' /> реальні знімки
				</span>
			</div>
			<p className='text-muted-foreground mt-1.5 text-sm'>
				Саме цей екземпляр — фото з нашого складу, без ретуші
			</p>

			<div className='mt-4 flex snap-x gap-3 overflow-x-auto pb-1'>
				{photos.map((p, i) => (
					<button
						key={i}
						type='button'
						onClick={() => setActive(i)}
						aria-label={`Відкрити живе фото ${i + 1}`}
						className='group border-border bg-muted relative aspect-[4/3] w-40 shrink-0 cursor-zoom-in snap-start overflow-hidden rounded-xl border shadow-sm'
					>
						<Image
							src={p.url}
							alt={alt(i)}
							fill
							sizes='160px'
							className='object-cover transition-transform duration-300 group-hover:scale-105'
						/>
						<span className='absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-md bg-black/55 text-white'>
							<Camera className='h-3 w-3' />
						</span>
					</button>
				))}
			</div>

			{active !== null && (
				<div
					className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4'
					onClick={() => setActive(null)}
					role='dialog'
					aria-modal='true'
				>
					<button
						type='button'
						aria-label='Закрити'
						className='absolute right-4 top-4 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20'
						onClick={() => setActive(null)}
					>
						<X className='h-5 w-5' />
					</button>

					{photos.length > 1 && (
						<>
							<button
								type='button'
								aria-label='Попереднє фото'
								className='absolute left-4 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20'
								onClick={e => {
									e.stopPropagation()
									prev()
								}}
							>
								<ChevronLeft className='h-6 w-6' />
							</button>
							<button
								type='button'
								aria-label='Наступне фото'
								className='absolute right-4 top-1/2 -translate-y-1/2 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20'
								onClick={e => {
									e.stopPropagation()
									next()
								}}
							>
								<ChevronRight className='h-6 w-6' />
							</button>
						</>
					)}

					<div
						className='relative h-full max-h-[85vh] w-full max-w-4xl'
						onClick={e => e.stopPropagation()}
					>
						<Image src={photos[active].url} alt={alt(active)} fill sizes='100vw' className='object-contain' />
					</div>
				</div>
			)}
		</section>
	)
}
