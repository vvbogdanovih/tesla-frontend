import { httpService } from './http.service'
import { API_URLS } from '@/common/constants/api-routes.constants'
import type { User } from '@/common/types/user.type'

interface AuthResponse {
	user: User
}

export interface LoginPayload {
	email: string
	password: string
}

export interface RegisterPayload {
	email: string
	password: string
	firstName?: string
	lastName?: string
	phone?: string
}

// skipErrorToast — помилки показуємо інлайн/тостом на самій формі,
// щоб контролювати текст (напр. «Невірний email або пароль»).
export const authApi = {
	login: (data: LoginPayload) =>
		httpService.post<AuthResponse, LoginPayload>(API_URLS.AUTH.LOGIN, data, {
			skipErrorToast: true
		}),

	register: (data: RegisterPayload) =>
		httpService.post<AuthResponse, RegisterPayload>(API_URLS.AUTH.REGISTER, data, {
			skipErrorToast: true
		})
}
