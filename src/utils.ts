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
