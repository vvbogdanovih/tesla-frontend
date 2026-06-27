export enum Role {
	USER = 'user',
	ADMIN = 'admin',
	SUPERADMIN = 'superadmin'
}

export const ROLES = {
	USER: Role.USER,
	ADMIN: Role.ADMIN,
	SUPERADMIN: Role.SUPERADMIN
} as const

// Доступ будь-якому авторизованому користувачу
export const ANY_AUTHENTICATED = 'any' as const
export type AnyAuthenticated = typeof ANY_AUTHENTICATED
