import { useSyncExternalStore } from 'react'

const QUERY = '(hover: hover)'

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

/** False on touch-only devices, where hover-revealed controls would be unreachable. */
export function useCanHover(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches)
}
