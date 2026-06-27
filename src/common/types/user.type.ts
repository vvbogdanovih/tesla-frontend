import { Role } from '@/common/constants/role.constants'

export interface User {
	id: string
	email?: string
	phone?: string
	firstName?: string
	lastName?: string
	role: Role
}
