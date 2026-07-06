'use client'

export default function ProductError({ reset }: { error: Error; reset: () => void }) {
	return (
		<div className='mx-auto flex max-w-[1240px] flex-col items-center gap-4 px-6 py-24 text-center'>
			<h2 className='font-display text-xl font-medium'>Не вдалося завантажити товар</h2>
			<p className='text-muted-foreground text-sm'>
				Сталася помилка при завантаженні. Спробуйте ще раз.
			</p>
			<button
				onClick={reset}
				className='bg-primary text-primary-foreground rounded-full px-5 py-2 text-sm font-medium'
			>
				Спробувати ще раз
			</button>
		</div>
	)
}
