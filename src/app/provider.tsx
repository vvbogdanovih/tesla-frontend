'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type PropsWithChildren, useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/common/store/useAuthStore'

export const Providers = ({ children }: PropsWithChildren) => {
	const [client] = useState(
		() =>
			new QueryClient({
				defaultOptions: { queries: { refetchOnWindowFocus: false } }
			})
	)

	// Авторизація — у фоні; публічний контент рендериться одразу (SSR/SEO).
	useEffect(() => {
		useAuthStore.getState().checkAuth()
	}, [])

	return (
		<QueryClientProvider client={client}>
			<Toaster position='top-center' />
			{children}
		</QueryClientProvider>
	)
}
