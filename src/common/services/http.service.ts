import axios, { type AxiosRequestConfig } from 'axios'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { API_BASE_URL, API_URLS } from '@/common/constants/api-routes.constants'
import { useAuthStore } from '@/common/store/useAuthStore'

const apiClient = axios.create({
	baseURL: API_BASE_URL,
	headers: { 'Content-Type': 'application/json' },
	withCredentials: true
})

// Один /auth/refresh на кілька одночасних 401: усі чекають той самий промис.
let refreshPromise: Promise<boolean> | null = null

apiClient.interceptors.response.use(
	response => response,
	async error => {
		const originalRequest = error?.config
		const errorMessage = error?.response?.data?.message || 'Сталася помилка'

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true
			if (!refreshPromise) {
				refreshPromise = HttpService.refreshToken().finally(() => {
					refreshPromise = null
				})
			}
			const ok = await refreshPromise
			if (ok) return apiClient(originalRequest)
		}

		if (!originalRequest?.skipErrorToast) toast.error(errorMessage)
		const err = new Error(errorMessage) as Error & { status?: number }
		err.status = error.response?.status
		throw err
	}
)

const handleResponse = async <T>(schema: z.ZodType<T> | undefined, data: T): Promise<T> => {
	if (!schema) return data
	try {
		return await schema.parseAsync(data)
	} catch (error) {
		if (error instanceof z.ZodError) {
			const message = `Помилка валідації: ${error.issues.map(i => i.message).join(', ')}`
			toast.error(message)
			throw new Error(message)
		}
		throw error
	}
}

type Config<T = unknown, D = unknown> = AxiosRequestConfig<D> & {
	schema?: z.ZodType<T>
	skipErrorToast?: boolean
}

export class HttpService {
	async get<T, D = unknown>(url: string, config?: Config<T, D>): Promise<T> {
		const response = await apiClient.get(url, config)
		return handleResponse(config?.schema, response.data)
	}

	async post<T, D = unknown>(url: string, data?: D, config?: Config<T, D>): Promise<T> {
		const response = await apiClient.post(url, data, config)
		return handleResponse(config?.schema, response.data)
	}

	async patch<T, D = unknown>(url: string, data?: D, config?: Config<T, D>): Promise<T> {
		const response = await apiClient.patch(url, data, config)
		return handleResponse(config?.schema, response.data)
	}

	async put<T, D = unknown>(url: string, data?: D, config?: Config<T, D>): Promise<T> {
		const response = await apiClient.put(url, data, config)
		return handleResponse(config?.schema, response.data)
	}

	async delete<T, D = unknown>(url: string, config?: Config<T, D>): Promise<T> {
		const response = await apiClient.delete(url, config)
		return handleResponse(config?.schema, response.data)
	}

	// Native fetch (а не apiClient), щоб не зациклити інтерсептор 401→refresh→401.
	static async refreshToken(): Promise<boolean> {
		const { logOut } = useAuthStore.getState()
		const res = await fetch(API_BASE_URL + API_URLS.AUTH.REFRESH, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({})
		})
		if (!res.ok) {
			await logOut()
			return false
		}
		return true
	}
}

export const httpService = new HttpService()
