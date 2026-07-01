'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageOff } from 'lucide-react'
import type { CatalogImage } from '@/common/types'

export const ProductGallery = ({
	images,
	name,
	badges
}: {
	images: CatalogImage[]
	name: string
	badges?: React.ReactNode
}) => {
	const [active, setActive] = useState(0)

	if (!images.length) {
		return (
			<div className='bg-muted text-muted-foreground flex aspect-square w-full items-center justify-center rounded-2xl'>
				<ImageOff className='h-10 w-10' />
			</div>
		)
	}

	const main = images[active]

	return (
		<div className='flex flex-col gap-3'>
			<div className='bg-white shadow-2xl relative aspect-square w-full overflow-hidden rounded-2xl'>
				{badges && (
					<div className='absolute left-3.5 top-3.5 z-10 flex flex-wrap gap-1.5'>{badges}</div>
				)}
				<Image
					src={main.url}
					alt={main.alt ?? name}
					fill
					sizes='(max-width:1024px) 100vw, 600px'
					className='object-contain p-2 sm:p-4'
					priority
				/>
			</div>
			{images.length > 1 && (
				<div className='flex flex-wrap gap-2'>
					{images.map((img, i) => (
						<button
							key={i}
							type='button'
							onClick={() => setActive(i)}
							className={
								'bg-muted relative h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors ' +
								(i === active ? 'border-primary' : 'border-transparent')
							}
						>
							<Image
								src={img.url}
								alt={img.alt ?? `${name} ${i + 1}`}
								fill
								sizes='64px'
								className='object-contain p-1'
							/>
						</button>
					))}
				</div>
			)}
		</div>
	)
}
