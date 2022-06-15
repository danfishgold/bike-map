import { FeatureCollection, Geometry } from 'geojson'
import { useEffect, useRef, useState } from 'react'

export function groupBy<K, T>(
  list: T[],
  keyGetter: (key: T) => K,
): Map<K, T[]> {
  const map = new Map<K, T[]>()
  list.forEach((item) => {
    const key = keyGetter(item)
    const collection = map.get(key)
    if (!collection) {
      map.set(key, [item])
    } else {
      collection.push(item)
    }
  })
  return map
}

export const emptyFeatureGroup: FeatureCollection<Geometry> = {
  type: 'FeatureCollection',
  features: [],
}

export function toggleSetMember<T>(
  set: Set<T>,
  member: T,
  include: boolean,
): Set<T> {
  const newSet = new Set(set)
  if (include) {
    newSet.add(member)
  } else {
    newSet.delete(member)
  }
  return newSet
}

export function useThrottledValue<T>(value: T, timeout: number): T {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastTimeRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
    }
    const now = new Date().getTime()
    if (now - lastTimeRef.current >= timeout) {
      setThrottledValue(value)
      lastTimeRef.current = now
    } else {
      timeoutRef.current = setTimeout(() => setThrottledValue(value), timeout)
    }
  }, [value])

  return throttledValue
}

let rgbCache = new Map<string, [number, number, number]>()

// https://stackoverflow.com/a/69057776
export function rgbValuesForColor(color: string): [number, number, number] {
  const cached = rgbCache.get(color)
  if (cached) {
    return cached
  }
  var canvas = document.createElement('canvas')
  var context = canvas.getContext('2d')
  if (!context) {
    throw new Error(`No canvas context somehow`)
  }
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data
  rgbCache.set(color, [r, g, b])
  return [r, g, b]
}

export function textColor(r: number, g: number, b: number): string {
  // http://www.w3.org/TR/AERT#color-contrast
  const brightness = Math.round((r * 299 + g * 587 + b * 114) / 1000)
  const textColor = brightness > 125 ? 'black' : 'white'
  return textColor
}

export function compact<T>(array: (T | null | undefined)[]): T[] {
  return array.flatMap((item) =>
    item !== undefined && item !== null ? [item] : [],
  )
}
