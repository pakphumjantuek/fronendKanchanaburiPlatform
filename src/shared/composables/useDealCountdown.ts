import { computed, onBeforeUnmount, ref } from 'vue'

export function toUtcMilliseconds(value: string) {
  const isoValue = value.replace(' ', 'T')
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(isoValue)
  return new Date(hasTimezone ? isoValue : `${isoValue}Z`).getTime()
}

export function useDealCountdown(endsAt: () => string | undefined) {
  const now = ref(Date.now())
  const timer = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)

  onBeforeUnmount(() => window.clearInterval(timer))

  const isFinished = computed(() => {
    const value = endsAt()
    return !value || toUtcMilliseconds(value) <= now.value
  })

  const remaining = computed(() => {
    const value = endsAt()
    if (!value) return '00:00:00'
    const seconds = Math.max(0, Math.ceil((toUtcMilliseconds(value) - now.value) / 1000))
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  })

  return { isFinished, remaining }
}
