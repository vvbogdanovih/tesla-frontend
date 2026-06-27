'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type PropsWithChildren, useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/common/store/useAuthStore'
import { FullScreenLoader } from '@/common/components'

export const Providers = ({ children }: PropsWithChildren) => {
	const [client] = useState(
		() =>
			new QueryClient({
				defaultOptions: { queries: { refetchOnWindowFocus: false } }
			})
	)
	const [ready, setReady] = useState(false)

	useEffect(() => {
		useAuthStore
			.getState()
			.checkAuth()
			.finally(() => setReady(true))
	}, [])

	return (
		<QueryClientProvider client={client}>
			<Toaster position='top-right' />
			{ready ? children : <FullScreenLoader />}
		</QueryClientProvider>
	)
}
