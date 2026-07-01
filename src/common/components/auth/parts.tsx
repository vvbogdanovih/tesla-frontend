import Link from 'next/link'
import type { ReactNode } from 'react'

export const authInputClass =
	'border-border bg-background focus:border-primary w-full rounded-xl border px-4 py-2.5 text-sm outline-none'

interface FieldProps {
	label: string
	error?: string
	children: ReactNode
}

export const AuthField = ({ label, error, children }: FieldProps) => (
	<div>
		<label className='mb-1 block text-sm font-medium'>{label}</label>
		{children}
		{error && <p className='text-destructive mt-1 text-xs'>{error}</p>}
	</div>
)

interface ShellProps {
	title: string
	subtitle: string
	footer: ReactNode
	children: ReactNode
}

// Спільна картка-обгортка для сторінок входу та реєстрації.
export const AuthShell = ({ title, subtitle, footer, children }: ShellProps) => (
	<main className='mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-12'>
		<Link href='/' className='font-display mb-8 text-center text-xl font-bold tracking-wide'>
			TESLA LVIV
		</Link>
		<div className='bg-card border-border rounded-2xl border p-6 shadow-sm sm:p-8'>
			<h1 className='font-display text-2xl font-bold'>{title}</h1>
			<p className='text-muted-foreground mt-1 text-sm'>{subtitle}</p>
			<div className='mt-6'>{children}</div>
		</div>
		<p className='text-muted-foreground mt-6 text-center text-sm'>{footer}</p>
	</main>
)
