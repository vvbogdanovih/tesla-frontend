import { z } from 'zod'
import { httpService } from './http.service'
import { API_URLS } from '@/common/constants/api-routes.constants'

// Збережені адреси доставки — лише для авторизованих (ADR-0017). Cookie-сесія.
export const addressSchema = z.object({
	id: z.string(),
	label: z.string().nullish(),
	method: z.enum(['np', 'ukrposhta', 'pickup']),
	city: z.string().nullish(),
	warehouse: z.string().nullish(),
	cityRef: z.string().nullish(),
	warehouseRef: z.string().nullish(),
	warehouseType: z.enum(['branch', 'postomat', 'cargo']).nullish(),
	recipient: z.string().nullish(),
	phone: z.string().nullish(),
	isDefault: z.boolean()
})

export type Address = z.infer<typeof addressSchema>

// Пейлоад створення/оновлення адреси (форма профілю/чекауту)
export interface AddressPayload {
	label?: string
	method: 'np' | 'ukrposhta' | 'pickup'
	city?: string
	warehouse?: string
	cityRef?: string
	warehouseRef?: string
	warehouseType?: 'branch' | 'postomat' | 'cargo'
	recipient?: string
	phone?: string
	isDefault?: boolean
}

export const addressesApi = {
	list: () =>
		httpService.get<Address[]>(API_URLS.ACCOUNT.ADDRESSES, {
			schema: z.array(addressSchema),
			skipErrorToast: true
		}),

	// silent — не показувати тост при помилці (напр., фонове збереження з чекауту)
	create: (data: AddressPayload, opts?: { silent?: boolean }) =>
		httpService.post<Address, AddressPayload>(API_URLS.ACCOUNT.ADDRESSES, data, {
			schema: addressSchema,
			skipErrorToast: opts?.silent
		}),

	update: (id: string, data: AddressPayload) =>
		httpService.patch<Address, AddressPayload>(`${API_URLS.ACCOUNT.ADDRESSES}/${id}`, data, {
			schema: addressSchema
		}),

	setDefault: (id: string) =>
		httpService.patch<Address>(`${API_URLS.ACCOUNT.ADDRESSES}/${id}/default`, {}, {
			schema: addressSchema
		}),

	remove: (id: string) =>
		httpService.delete<{ ok: boolean }>(`${API_URLS.ACCOUNT.ADDRESSES}/${id}`)
}
