import type { Metadata } from 'next'
import { Onest, Unbounded } from 'next/font/google'
import './globals.css'
import { Providers } from './provider'
import { Header, Footer, CartDrawer } from '@/common/components'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/common/constants/seo.constants'
import { CONTACT_EMAIL, CONTACT_PHONE_E164 } from '@/common/constants/contacts.constants'

const onest = Onest({
	variable: '--font-onest',
	subsets: ['latin', 'cyrillic'],
	weight: ['400', '500', '600', '700', '800']
})

const unbounded = Unbounded({
	variable: '--font-unbounded',
	subsets: ['latin', 'cyrillic'],
	weight: ['400', '500', '600', '700']
})

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: { absolute: SITE_NAME, template: `%s | ${SITE_NAME}` },
	description: SITE_DESCRIPTION,
	openGraph: { siteName: SITE_NAME, locale: 'uk_UA', type: 'website' },
	twitter: { card: 'summary_large_image' }
}

// Organization JSON-LD — машиночитана картка магазину для пошуковиків (SEO)
const organizationLd = {
	'@context': 'https://schema.org',
	'@type': 'Organization',
	name: SITE_NAME,
	url: SITE_URL,
	logo: `${SITE_URL}/icon.png`,
	email: CONTACT_EMAIL,
	contactPoint: {
		'@type': 'ContactPoint',
		telephone: CONTACT_PHONE_E164,
		contactType: 'customer service',
		areaServed: 'UA',
		availableLanguage: 'uk'
	},
	address: {
		'@type': 'PostalAddress',
		addressLocality: 'Львів',
		addressCountry: 'UA'
	}
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			lang='uk'
			className={`${onest.variable} ${unbounded.variable}`}
			suppressHydrationWarning
		>
			<body className='antialiased' suppressHydrationWarning>
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
				/>
				{/* Тема до гідрації (без FOUC): збережений вибір або системна перевага */}
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}})()`
					}}
				/>
				{/* Лого Tesla у фоні (×3 від адмінки) */}
				<div
					aria-hidden
					className='pointer-events-none fixed inset-0 z-0 bg-center bg-no-repeat opacity-[0.05] dark:brightness-0 dark:invert'
					style={{
						backgroundImage: "url('/tesla.svg')",
						backgroundSize: 'min(2100px, 165vw)'
					}}
				/>
				<Providers>
					<div className='relative z-10 flex min-h-screen flex-col'>
						<Header />
						<div className='flex-1'>{children}</div>
						<Footer />
					</div>
					<CartDrawer />
				</Providers>
			</body>
		</html>
	)
}
