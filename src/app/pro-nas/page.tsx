import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { catalogApi } from '@/common/services/catalog.api'
import { SITE_URL } from '@/common/constants/seo.constants'

export const metadata: Metadata = {
	title: 'Про нас — Tesla Spare Parts Lviv',
	description:
		'Спеціалізований центр запчастин, діагностики та обслуговування Tesla у Львові. Оригінальні й аналогові деталі, доставка по всій Україні.',
	alternates: { canonical: `${SITE_URL}/pro-nas` }
}

export default async function AboutPage() {
	const block = await catalogApi.contentBlock('about')
	// notFound лише якщо блока взагалі немає в БД (seed не запускали);
	// порожній bodyHtml показуємо як плейсхолдер, щоб лінк у меню не 404-ився
	if (!block) notFound()

	return (
		<div className='mx-auto max-w-[1240px] px-6 py-12'>
			<h1 className='font-display mb-6 text-3xl font-medium tracking-tight'>{block.title}</h1>
			{block.bodyHtml ? (
				<div className='rich' dangerouslySetInnerHTML={{ __html: block.bodyHtml }} />
			) : (
				<p className='text-muted-foreground'>Контент готується.</p>
			)}
		</div>
	)
}
