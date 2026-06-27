import { Button } from '@/common/components'

export default function Home() {
	return (
		<section className='mx-auto flex max-w-[1240px] flex-col items-start px-6 py-24'>
			<p className='text-accent-text text-xs font-bold tracking-[0.1em] uppercase'>
				Запчастини Tesla · Україна
			</p>
			<h1 className='font-display mt-3 mb-4 text-5xl font-medium tracking-tight'>
				Знайди потрібну
				<br />
				деталь за хвилину
			</h1>
			<p className='text-muted-foreground mb-8 max-w-xl text-lg'>
				Понад 1000 оригінальних та аналогових запчастин для Model 3 · Y · S · X.
			</p>
			<div className='flex gap-3'>
				<Button>Обрати модель</Button>
				<Button variant='ghost'>Перейти в каталог</Button>
			</div>
			<p className='text-muted-foreground mt-10 text-sm'>
				tesla-frontend — базова конфігурація та лейаут готові.
			</p>
		</section>
	)
}
