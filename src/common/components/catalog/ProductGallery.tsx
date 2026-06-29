'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageOff } from 'lucide-react'
import type { CatalogImage } from '@/common/types'

export const ProductGallery = ({ images, name }: { images: CatalogImage[]; name: string }) => {
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
			<div className='bg-muted relative aspect-square w-full overflow-hidden rounded-2xl'>
				<Image
					src={main.url}
					alt={main.alt ?? name}
					fill
					sizes='(max-width:1024px) 100vw, 600px'
					className='object-cover'
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
								className='object-cover'
							/>
						</button>
					))}
				</div>
			)}
		</div>
	)
}
