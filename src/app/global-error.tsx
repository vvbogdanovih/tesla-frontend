'use client'

// Кореневий boundary — ловить помилки навіть у layout. Має рендерити власні <html>/<body>.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
	return (
		<html lang='uk'>
			<body>
				<div className='mx-auto flex min-h-screen max-w-[1240px] flex-col items-center justify-center gap-4 px-6 text-center'>
					<h1 className='font-display text-2xl font-medium'>Щось пішло не так</h1>
					<p className='text-muted-foreground'>
						Не вдалося завантажити сторінку. Спробуйте ще раз.
					</p>
					<button
						onClick={reset}
						className='bg-primary text-primary-foreground rounded-full px-5 py-2 text-sm font-medium'
					>
						Спробувати ще раз
					</button>
				</div>
			</body>
		</html>
	)
}
