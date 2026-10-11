import { useSyncExternalStore } from 'react'

function subscribe(callback: () => void) {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

function getSnapshot() {
  return window.location.hash.slice(1) || '/'
}

function getServerSnapshot() {
  return '/'
}

export function useHashRoute() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
