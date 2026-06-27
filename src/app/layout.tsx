import type { Metadata } from 'next'
import { Onest, Unbounded } from 'next/font/google'
import './globals.css'
import { Providers } from './provider'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/common/constants/seo.constants'

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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang='uk' className={`${onest.variable} ${unbounded.variable}`}>
			<body className='min-h-screen antialiased' suppressHydrationWarning>
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
