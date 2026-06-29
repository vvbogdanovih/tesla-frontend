import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Car as CarIcon, Search, ShieldCheck, Truck, Package } from 'lucide-react'
import { catalogApi } from '@/common/services/catalog.api'
import { ProductCard } from '@/common/components/catalog/ProductCard'
import { UI_ROUTES } from '@/common/constants'
import type { Car } from '@/common/types'

const CONTAINER = 'mx-auto max-w-[1240px] px-6'

export default async function Home() {
	// Graceful fallback: головна пре-рендериться — не валимо білд, якщо бек недоступний
	const [cars, categories, featured] = await Promise.all([
		catalogApi.cars().catch(() => []),
		catalogApi.categories().catch(() => []),
		catalogApi
			.products('sort=newest&limit=8')
			.catch(() => ({ items: [], total: 0, page: 1, limit: 8, pages: 1 }))
	])

	const carLabel = (c: Car) => c.generation ?? c.brand

	return (
		<>
			{/* Hero */}
			<section className='relative overflow-hidden border-b border-[#1b1f24] bg-[#0b0d10] text-white'>
				<div
					aria-hidden
					className='pointer-events-none absolute inset-0 z-0'
					style={{
						background:
							'radial-gradient(900px 520px at 84% -12%, rgba(245,158,11,.46), transparent 60%)'
					}}
				/>
				<div
					aria-hidden
					className='pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[66%] bg-cover bg-right bg-no-repeat md:block'
					style={{
						backgroundImage: "url('/hero.jpg')",
						WebkitMaskImage: 'linear-gradient(90deg,transparent 0%,#000 42%,#000 100%)',
						maskImage: 'linear-gradient(90deg,transparent 0%,#000 42%,#000 100%)'
					}}
				/>
				<div
					aria-hidden
					className='pointer-events-none absolute inset-0 z-0'
					style={{
						background:
							'linear-gradient(90deg,#0b0d10 0%,rgba(11,13,16,.9) 28%,rgba(11,13,16,.35) 52%,transparent 72%)'
					}}
				/>

				<div className={`${CONTAINER} relative z-10 py-20 md:py-24`}>
					<p className='text-xs font-bold tracking-[0.1em] text-amber-400 uppercase'>
						Запчастини Tesla · Україна
					</p>
					<h1 className='font-display mt-3.5 mb-4 max-w-2xl bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-4xl leading-[1.06] font-medium tracking-tight text-transparent md:text-6xl'>
						Знайди потрібну деталь за хвилину
					</h1>
					<p className='mb-6 max-w-xl text-lg text-zinc-400'>
						Понад 1000 оригінальних та аналогових запчастин для Model 3 · Y · S · X.
					</p>

					<Link
						href={UI_ROUTES.SEARCH}
						className='mb-7 flex max-w-xl items-center gap-2.5 rounded-2xl border border-white/15 bg-white/[0.07] px-5 py-4 text-sm text-zinc-300 backdrop-blur'
					>
						<Search className='h-4 w-4' /> Введи назву або артикул&nbsp;
						<span className='text-zinc-500'>напр. 1645989-00-A</span>
					</Link>

					<div className='mb-10 flex flex-wrap gap-3'>
						<Link
							href='#models'
							className='bg-primary text-primary-foreground flex h-12 items-center rounded-xl px-6 text-sm font-bold transition-transform hover:-translate-y-0.5'
						>
							Обрати модель
						</Link>
						<Link
							href={UI_ROUTES.SHOP}
							className='flex h-12 items-center rounded-xl border border-white/25 px-6 text-sm font-bold transition-colors hover:bg-white/10'
						>
							Перейти в каталог
						</Link>
					</div>

					<div className='flex flex-wrap gap-10'>
						{[
							['1000+', 'позицій'],
							[`${cars.length}`, 'моделей'],
							['Оригінал & аналог', 'на вибір'],
							['Доставка', 'по Україні']
						].map(([n, l]) => (
							<div key={l}>
								<div className='text-2xl font-extrabold'>{n}</div>
								<div className='mt-1 text-xs tracking-wide text-zinc-500 uppercase'>{l}</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Оберіть модель */}
			<section id='models' className={`${CONTAINER} py-14`}>
				<SectionHead title='Оберіть модель' href={UI_ROUTES.SHOP} linkText='Усі товари' />
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
					{cars.map(c => (
						<Link
							key={c.id}
							href={`${UI_ROUTES.SHOP}?car=${c.slug}`}
							className='group border-border bg-card overflow-hidden rounded-2xl border transition-transform hover:-translate-y-1 hover:shadow-lg'
						>
							<div className='bg-muted relative aspect-[16/9] w-full'>
								{c.imageUrl ? (
									<Image src={c.imageUrl} alt={c.model} fill sizes='400px' className='object-cover' />
								) : (
									<CarIcon className='text-muted-foreground absolute inset-0 m-auto h-8 w-8' />
								)}
							</div>
							<div className='flex items-center justify-between p-4'>
								<div>
									<div className='font-bold'>{c.model}</div>
									<div className='text-muted-foreground text-sm'>{carLabel(c)}</div>
								</div>
								<ArrowRight className='text-accent-text h-5 w-5 transition-transform group-hover:translate-x-1' />
							</div>
						</Link>
					))}
				</div>
			</section>

			{/* Переваги */}
			<section className={`${CONTAINER} pb-14`}>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
					{[
						{ icon: Package, t: '1000+ позицій', d: 'Під усі популярні моделі Tesla.' },
						{ icon: Search, t: 'Швидкий пошук', d: 'За кодом запчастини, назвою та VIN.' },
						{ icon: Truck, t: 'Доставка', d: 'Нова Пошта та Укрпошта — в день замовлення.' },
						{ icon: ShieldCheck, t: 'Гарантія', d: 'Гарантія на товар і повернення 14 днів.' }
					].map(b => (
						<div key={b.t} className='border-border bg-card rounded-2xl border p-5'>
							<div className='bg-primary/10 text-accent-text mb-3 flex h-11 w-11 items-center justify-center rounded-xl'>
								<b.icon className='h-5 w-5' />
							</div>
							<h3 className='mb-1 font-bold'>{b.t}</h3>
							<p className='text-muted-foreground text-sm'>{b.d}</p>
						</div>
					))}
				</div>
			</section>

			{/* Новинки */}
			{featured.items.length > 0 && (
				<section className={`${CONTAINER} pb-14`}>
					<SectionHead title='Новинки' href={UI_ROUTES.SHOP} linkText='Усі товари' />
					<div className='grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4'>
						{featured.items.map(p => (
							<ProductCard key={p.id} product={p} />
						))}
					</div>
				</section>
			)}

			{/* Категорії */}
			{categories.length > 0 && (
				<section className={`${CONTAINER} pb-14`}>
					<SectionHead title='Категорії' />
					<div className='flex flex-wrap gap-2'>
						{categories.map(c => (
							<Link
								key={c.id}
								href={`${UI_ROUTES.SHOP}?category=${c.slug}`}
								className='border-border bg-card hover:border-primary rounded-full border px-4 py-2 text-sm font-medium transition-colors'
							>
								{c.name}
							</Link>
						))}
					</div>
				</section>
			)}

			{/* CTA-заявка */}
			<section className='bg-[#0b0d10]'>
				<div className={`${CONTAINER} flex flex-col items-center gap-4 py-14 text-center`}>
					<h2 className='font-display text-2xl font-medium text-white'>
						Не знайшли потрібну деталь?
					</h2>
					<p className='max-w-xl text-zinc-400'>
						Залиште заявку з кодом або VIN — підберемо запчастину та повідомимо ціну.
					</p>
					<Link
						href={UI_ROUTES.CONTACTS}
						className='bg-primary text-primary-foreground flex h-12 items-center rounded-xl px-7 text-sm font-bold transition-transform hover:-translate-y-0.5'
					>
						Залишити заявку
					</Link>
				</div>
			</section>
		</>
	)
}

const SectionHead = ({
	title,
	href,
	linkText
}: {
	title: string
	href?: string
	linkText?: string
}) => (
	<div className='mb-6 flex items-end justify-between'>
		<h2 className='font-display text-2xl font-medium tracking-tight'>{title}</h2>
		{href && linkText && (
			<Link href={href} className='text-accent-text text-sm font-semibold hover:underline'>
				{linkText} →
			</Link>
		)}
	</div>
)
