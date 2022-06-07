import { FeatureCollection, Geometry } from 'geojson'

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
