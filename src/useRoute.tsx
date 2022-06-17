import {
  Feature,
  FeatureCollection,
  Geometry,
  LineString,
  Point as GeoJsonPoint,
  Position,
} from 'geojson'
import { useEffect, useMemo, useState } from 'react'
import { env } from './env'
import { compact, useThrottledValue } from './utils'

export type Point = { latitude: number; longitude: number }

export type Segment = {
  origin: Point
  destination: Point
  feature: Feature<LineString>
}

export type PartialSegment = {
  origin: Point
  destination: Point
  feature: Feature<LineString> | null
}

export type Route = {
  origin: Position | null
  canRemoveStop: boolean
  clear: () => void
  addStop: () => void
  removeStop: () => void
  features: FeatureCollection<Geometry>
}

export function useRoute(center: Point, isTracking: boolean): Route {
  const [segment, setSegment] = useState<PartialSegment | null>(null)
  const throttledCenter = useThrottledValue(center, 250)

  const [pastSegments, setPastSegments] = useState<Segment[]>([])

  useEffect(() => {
    if (!isTracking) {
      return
    }
    if (!segment || distanceSortOf(segment.origin, center) < 0.001) {
      return
    }

    console.log('calculating')
    fetchRoute(segment.origin, throttledCenter).then((feature) =>
      setSegment({
        origin: segment.origin,
        destination: throttledCenter,
        feature,
      }),
    )
  }, [throttledCenter, segment?.origin, isTracking])

  // useEffect(() => {
  //   if (isTracking) {
  //     setSegment({ origin: center, destination: center, feature: null })
  //   }
  // }, [isTracking])
  const clear = () => {
    setPastSegments([])
    setSegment(null)
  }

  const addStop = () => {
    if (segment && !segment?.feature) {
      return
    }
    if (segment) {
      setPastSegments([...pastSegments, segment as Segment])
    }
    const lastSegment = segment ? segment : pastSegments.at(-1)
    const lastDestination = lastSegment?.feature?.geometry.coordinates.at(-1)
    const origin = lastDestination
      ? { longitude: lastDestination[0], latitude: lastDestination[1] }
      : center

    setSegment({
      origin,
      destination: center,
      feature: null,
    })
  }

  const removeStop = () => {
    if (!pastSegments.length) {
      return
    }
    const lastSegment = pastSegments[pastSegments.length - 1]
    setPastSegments(pastSegments.slice(0, -1))
    setSegment({
      origin: lastSegment.origin,
      destination: center,
      feature: null,
    })
  }

  const segments = useMemo(
    () => compact([...pastSegments, segment]),
    [pastSegments, segment],
  )
  const features: FeatureCollection<Geometry> = useMemo(() => {
    const lineFeatures: Feature<LineString>[] = compact(
      segments.map((segment) => segment.feature),
    )

    const pointFeatures: Feature<GeoJsonPoint>[] = segments.flatMap(
      (segment): Feature<GeoJsonPoint>[] => {
        const points = segment.feature
          ? compact([
              segment.feature.geometry.coordinates.at(0),
              segment.feature.geometry.coordinates.at(-1),
            ])
          : []

        return points.map(pointFeature)
      },
    )

    return {
      type: 'FeatureCollection',
      features: [...lineFeatures, ...pointFeatures],
    }
  }, [segments])

  const canRemoveStop = pastSegments.length > 0

  const firstSegment = segments.at(0)
  const origin = useMemo(() => {
    const firstSegment = segments.at(0)
    if (!firstSegment) {
      return null
    }
    const firstRoutePoint = firstSegment.feature?.geometry.coordinates.at(0)
    return (
      firstRoutePoint ?? [
        firstSegment.origin.longitude,
        firstSegment.origin.latitude,
      ]
    )
  }, [firstSegment])

  return {
    canRemoveStop,
    clear,
    addStop,
    removeStop,
    features,
    origin,
  }
}

export function distanceSortOf(p1: Point, p2: Point) {
  return Math.hypot(p1.latitude - p2.latitude, p1.longitude - p2.longitude)
}

export async function fetchRoute(origin: Point, destination: Point) {
  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/cycling/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?geometries=geojson&access_token=${env.VITE_MAPBOX_TOKEN}`,
  )
  const data = await response.json()

  const feature = { type: 'Feature', ...data.routes[0] }
  return feature
}

export function pointFeature(point: Point | Position): Feature<GeoJsonPoint> {
  const coordinates = Array.isArray(point)
    ? point
    : [point.longitude, point.latitude]
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates },
    properties: {},
  }
}
