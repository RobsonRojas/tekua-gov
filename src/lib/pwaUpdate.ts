import * as syncService from './syncService'

type UpdateListener = () => void

let updateAvailable = false
const listeners = new Set<UpdateListener>()
let updateServiceWorker: ((reloadPage?: boolean) => Promise<void>) | null = null
let reloading = false

export function setUpdateServiceWorker(fn: (reloadPage?: boolean) => Promise<void>) {
  updateServiceWorker = fn
}

export function isUpdateAvailable(): boolean {
  return updateAvailable
}

export function markUpdateAvailable() {
  if (import.meta.env.DEV) {
    return
  }
  if (updateAvailable) {
    return
  }
  updateAvailable = true
  listeners.forEach((listener) => listener())
}

export function clearUpdateAvailable() {
  updateAvailable = false
  listeners.forEach((listener) => listener())
}

export function subscribe(listener: UpdateListener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getSnapshot() {
  return updateAvailable
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  const timeoutPromise = new Promise<null>((resolve) => {
    timeoutId = setTimeout(() => resolve(null), ms)
  })
  const result = await Promise.race([promise, timeoutPromise])
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  return result as T | null
}

export async function detectWaitingUpdate() {
  if (import.meta.env.DEV) {
    return
  }
  if (!('serviceWorker' in navigator)) {
    return
  }
  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration?.waiting) {
      markUpdateAvailable()
    }
  } catch {
    // ignore
  }
}

export function watchForUpdates() {
  if (import.meta.env.DEV) {
    return
  }
  if (!('serviceWorker' in navigator)) {
    return
  }
  navigator.serviceWorker
    .getRegistration()
    .then((registration) => {
      if (!registration) {
        return
      }
      registration.addEventListener('updatefound', () => {
        const installing = registration.installing
        if (!installing) {
          return
        }
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            markUpdateAvailable()
          }
        })
      })
    })
    .catch(() => {
      // ignore
    })
}

export async function requestSkipWaiting(registration?: ServiceWorkerRegistration | null) {
  if (import.meta.env.DEV) {
    return
  }
  try {
    const reg = registration || (await navigator.serviceWorker.getRegistration())
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' })
      return
    }
    if (updateServiceWorker) {
      await updateServiceWorker()
    }
  } catch {
    // ignore
  }
}

export function waitForControllerChange(timeoutMs = 5000) {
  return new Promise<void>((resolve) => {
    let resolved = false
    const onChange = () => {
      if (resolved) {
        return
      }
      resolved = true
      navigator.serviceWorker.removeEventListener('controllerchange', onChange)
      resolve()
    }
    navigator.serviceWorker.addEventListener('controllerchange', onChange)
    setTimeout(() => {
      if (resolved) {
        return
      }
      resolved = true
      navigator.serviceWorker.removeEventListener('controllerchange', onChange)
      resolve()
    }, timeoutMs)
  })
}

export async function applyUpdate() {
  if (import.meta.env.DEV) {
    return
  }
  if (reloading) {
    return
  }
  reloading = true

  try {
    const queue = (syncService as Record<string, unknown>).processSyncQueue as (() => unknown) | undefined
    const result = queue?.()
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      await withTimeout((result as Promise<unknown>).catch(() => undefined), 2000)
    }
  } catch {
    // best effort
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    await requestSkipWaiting(registration)
  } catch {
    // ignore
  }

  try {
    await waitForControllerChange(5000)
  } catch {
    // ignore
  }

  window.location.reload()
}
