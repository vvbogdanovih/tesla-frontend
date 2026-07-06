import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { catalogApi } from '@/common/services/catalog.api'
import { SITE_URL } from '@/common/constants/seo.constants'

export const metadata: Metadata = {
	title: 'Контакти — Tesla Spare Parts Lviv',
	description: 'Звʼяжіться з магазином запчастин Tesla у Львові: телефон, email, адреса.',
	alternates: { canonical: `${SITE_URL}/kontakty` }
}

export default async function ContactsPage() {
	const block = await catalogApi.contentBlock('contacts')
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
