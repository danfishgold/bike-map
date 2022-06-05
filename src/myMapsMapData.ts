import * as tj from '@tmcw/togeojson'
import { Feature, FeatureCollection, Geometry } from 'geojson'
import 'mapbox-gl/dist/mapbox-gl.css'
import { env } from './env'
import { groupBy } from './utils'

type MyMapsProperties = {
  name: string
  description: string
  stroke: string
  'stroke-width': number
  'stroke-opacity': number
}

const featureGroups = [
  'bikePath',
  'recommendedRoad',
  'dangerousRoad',
  'unknown',
] as const

type FeatureGroup = typeof featureGroups[number]

export async function fetchMyMapsFeatures(): Promise<
  Map<FeatureGroup, FeatureCollection<Geometry, MyMapsProperties>>
> {
  const allFeatures = await fetchAllFeatures()
  const groupFeatures = groupBy(allFeatures.features, getFeatureGroup)

  return new Map(
    Array.from(groupFeatures.entries()).map(([group, features]) => [
      group,
      { type: 'FeatureCollection', features },
    ]),
  )
}

async function fetchAllFeatures(): Promise<
  FeatureCollection<Geometry, MyMapsProperties>
> {
  const response = await fetch(env.VITE_KML_SOURCE)
  const xmlString = await response.text()
  const xml = new DOMParser().parseFromString(xmlString, 'text/xml')
  const geoJson = tj.kml(xml)

  if (geoJson.features.some((feature) => feature.geometry === null)) {
    throw new Error('GeoJSON has null geometry')
  }

  return geoJson as FeatureCollection<Geometry, MyMapsProperties>
}

function getFeatureGroup(feature: Feature): FeatureGroup {
  if (feature.geometry.type === 'LineString') {
    return 'bikePath'
  } else {
    return 'unknown'
  }
}
