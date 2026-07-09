import { httpService } from './http.service'
import { API_URLS } from '@/common/constants/api-routes.constants'
import type { User } from '@/common/types/user.type'

// Редагування профілю (контактні дані + пароль). Email не редагується — це логін.
export interface UpdateProfilePayload {
	firstName?: string
	lastName?: string
	phone?: string
}

export interface ChangePasswordPayload {
	currentPassword: string
	newPassword: string
}

export const profileApi = {
	// Повертає користувача у формі /auth/me — можна одразу класти у стор
	update: (data: UpdateProfilePayload) =>
		httpService.patch<User, UpdateProfilePayload>(API_URLS.ACCOUNT.PROFILE, data),

	changePassword: (data: ChangePasswordPayload) =>
		httpService.patch<{ ok: boolean }, ChangePasswordPayload>(
			API_URLS.ACCOUNT.PROFILE_PASSWORD,
			data,
			{ skipErrorToast: true }
		)
}
