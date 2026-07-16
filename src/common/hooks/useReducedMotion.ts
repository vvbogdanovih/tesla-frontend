import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

const subscribe = (onChange: () => void) => {
	const mql = window.matchMedia(QUERY)
	mql.addEventListener('change', onChange)
	return () => mql.removeEventListener('change', onChange)
}

const getSnapshot = () => window.matchMedia(QUERY).matches

// prefers-reduced-motion як реактивний стан; на SSR вважаємо, що анімації дозволені
export const useReducedMotion = () => useSyncExternalStore(subscribe, getSnapshot, () => false)
