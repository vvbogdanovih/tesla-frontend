// Прайс-лист має власний лейаут на всю ширину (широка таблиця), без контейнера каталогу 1240px
export default function PriceSheetLayout({ children }: { children: React.ReactNode }) {
	return <div className='w-full px-4 py-8 sm:px-6 lg:px-8'>{children}</div>
}
