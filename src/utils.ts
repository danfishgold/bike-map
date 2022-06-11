import { FeatureCollection, Geometry } from 'geojson'
import { useEffect, useMemo, useRef } from 'react'

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

export function useThrottledFunction<Args>(
  func: (...args: Args[]) => void,
  timeFrame: number,
) {
  const funcRef = useRef(func)
  useEffect(() => {
    funcRef.current = func
  }, [func])
  const throttledFunction = useMemo(
    () => throttle((...args: Args[]) => funcRef.current(...args), timeFrame),
    [funcRef],
  )

  return throttledFunction
}

export function throttle<Args>(
  func: (...args: Args[]) => void,
  timeFrame: number,
): (...args: Args[]) => void {
  let lastTime = 0
  return (...args: Args[]) => {
    const now = new Date().getTime()
    if (now - lastTime >= timeFrame) {
      func(...args)
      lastTime = now
    }
  }
}

// https://stackoverflow.com/a/69057776
export function rgbValuesForColor(color: string): [number, number, number] {
  var canvas = document.createElement('canvas')
  var context = canvas.getContext('2d')
  if (!context) {
    throw new Error(`No canvas context somehow`)
  }
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}

export function textColor(r: number, g: number, b: number): string {
  // http://www.w3.org/TR/AERT#color-contrast
  const brightness = Math.round((r * 299 + g * 587 + b * 114) / 1000)
  const textColor = brightness > 125 ? 'black' : 'white'
  return textColor
}
