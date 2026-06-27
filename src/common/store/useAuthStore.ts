import { create } from 'zustand'
import { httpService } from '@/common/services/http.service'
import { API_URLS } from '@/common/constants/api-routes.constants'
import { Role } from '@/common/constants/role.constants'
import type { User } from '@/common/types/user.type'

interface AuthState {
	user: User | null
	isLoading: boolean
	checkAuth: () => Promise<void>
	login: (user: User) => void
	logOut: () => Promise<void>
	isUserLoggedIn: () => boolean
	hasRole: (...roles: Role[]) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
	user: null,
	isLoading: true,

	checkAuth: async () => {
		try {
			const user = await httpService.get<User, unknown>(API_URLS.AUTH.ME, {
				skipErrorToast: true
			})
			set({ user, isLoading: false })
		} catch {
			set({ user: null, isLoading: false })
		}
	},

	login: user => set({ user }),

	logOut: async () => {
		try {
			await httpService.post(API_URLS.AUTH.LOGOUT, {}, { skipErrorToast: true })
		} catch {
			// ігноруємо — все одно чистимо локальний стан
		}
		set({ user: null })
	},

	isUserLoggedIn: () => !!get().user,

	hasRole: (...roles: Role[]) => {
		const user = get().user
		return !!user && roles.includes(user.role)
	}
}))
