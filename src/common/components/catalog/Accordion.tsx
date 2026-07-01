'use client'

import { useState } from 'react'

interface Props {
	title: string
	html: string
	defaultOpen?: boolean
}

// Акордеон гарантії/доставки з плавним розкриттям (transition grid-rows 0fr→1fr)
export const Accordion = ({ title, html, defaultOpen = false }: Props) => {
	const [open, setOpen] = useState(defaultOpen)

	return (
		<div>
			<button
				type='button'
				onClick={() => setOpen(o => !o)}
				aria-expanded={open}
				className='flex w-full cursor-pointer items-center justify-between px-[18px] py-4 text-left text-sm font-semibold'
			>
				{title}
				<span className='text-muted-foreground text-lg leading-none'>{open ? '–' : '+'}</span>
			</button>
			<div
				className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
					open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
				}`}
			>
				<div className='overflow-hidden'>
					<div
						className='rich text-muted-foreground px-[18px] pb-[18px] text-sm'
						dangerouslySetInnerHTML={{ __html: html }}
					/>
				</div>
			</div>
		</div>
	)
}
