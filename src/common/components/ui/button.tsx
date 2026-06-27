import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/common/utils/shad-cn.utils'

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90',
				ghost: 'border border-border bg-transparent hover:bg-muted',
				link: 'text-primary underline-offset-4 hover:underline'
			},
			size: {
				default: 'h-12 px-5',
				sm: 'h-10 px-4 text-sm',
				lg: 'h-14 px-7 text-base',
				icon: 'h-11 w-11'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	}
)

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {}

export const Button = ({ className, variant, size, ...props }: ButtonProps) => {
	return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { buttonVariants }
