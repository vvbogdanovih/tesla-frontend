'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

// Кнопка копіювання артикула (референс картки товару, FRD §3.4)
export const CopySku = ({ sku }: { sku: string }) => {
	const [copied, setCopied] = useState(false)

	const onCopy = () => {
		navigator.clipboard?.writeText(sku)
		setCopied(true)
		setTimeout(() => setCopied(false), 1200)
	}

	return (
		<button
			type='button'
			onClick={onCopy}
			aria-label='Скопіювати артикул'
			className={`hover:bg-muted rounded p-1 transition-colors ${
				copied ? 'text-success' : 'text-accent-text'
			}`}
		>
			{copied ? <Check className='h-3.5 w-3.5' /> : <Copy className='h-3.5 w-3.5' />}
		</button>
	)
}
