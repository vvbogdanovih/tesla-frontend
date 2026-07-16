import { AccountShell } from '@/common/components/account/AccountShell'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
	return <AccountShell>{children}</AccountShell>
}
