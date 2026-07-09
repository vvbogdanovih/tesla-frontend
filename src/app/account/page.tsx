'use client'

import { useState } from 'react'
import { KeyRound, Pencil } from 'lucide-react'
import { useAuthStore } from '@/common/store/useAuthStore'
import { ProfileForm } from '@/common/components/account/ProfileForm'
import { PasswordForm } from '@/common/components/account/PasswordForm'

// Огляд акаунта: дані профілю (перегляд / редагування / зміна пароля).
// Гейт і навігація — в layout кабінету.
export default function AccountPage() {
	const user = useAuthStore(s => s.user)

	// Режим секції «Профіль»: перегляд / редагування даних / зміна пароля
	const [editing, setEditing] = useState<'profile' | 'password' | null>(null)

	if (!user) return null

	return (
		<>
			<h1 className='font-display text-2xl font-bold'>Огляд акаунта</h1>
			<p className='text-muted-foreground mt-1 text-sm'>
				Особисті дані та налаштування входу
			</p>

			<section className='bg-card border-border mt-6 rounded-2xl border p-6'>
				<div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
					<h2 className='font-display text-lg font-bold'>Профіль</h2>
					{editing === null && (
						<div className='flex items-center gap-2'>
							<button
								type='button'
								onClick={() => setEditing('profile')}
								className='border-border hover:bg-muted flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors'
							>
								<Pencil className='h-4 w-4' />
								Редагувати
							</button>
							<button
								type='button'
								onClick={() => setEditing('password')}
								className='border-border hover:bg-muted flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors'
							>
								<KeyRound className='h-4 w-4' />
								Змінити пароль
							</button>
						</div>
					)}
				</div>
				{editing === 'profile' ? (
					<ProfileForm user={user} onClose={() => setEditing(null)} />
				) : editing === 'password' ? (
					<PasswordForm onClose={() => setEditing(null)} />
				) : (
					<dl className='grid gap-x-8 gap-y-4 sm:grid-cols-2'>
						<Info label="Ім'я" value={user.firstName} />
						<Info label='Прізвище' value={user.lastName} />
						<Info label='Email' value={user.email} />
						<Info label='Телефон' value={user.phone} />
					</dl>
				)}
			</section>
		</>
	)
}

const Info = ({ label, value }: { label: string; value?: string }) => (
	<div>
		<dt className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
			{label}
		</dt>
		<dd className='mt-0.5 text-sm'>{value || '—'}</dd>
	</div>
)
