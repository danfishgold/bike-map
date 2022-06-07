import * as tj from '@tmcw/togeojson'
import { Feature, FeatureCollection, Geometry } from 'geojson'
import 'mapbox-gl/dist/mapbox-gl.css'
import { env } from './env'
import { groupBy } from './utils'

type MyMapsProperties = {
  name: string
  description: string
  stroke: string
  fill?: string
  'stroke-width': number
  'stroke-opacity': number
  סוג?: string
  status?: string
}

const lineGroups = [
  'bikePath',
  'recommendedRoad',
  'recommendedRoadArrow',
  'dangerousRoad',
  'ofney dan',
  'planned',
  'inProgress',
  'missing',
  'dirtRoad',
  'bridge',
  'road???',
  'unknown',
  'mistake',
] as const
const polygonGroups = [
  'unknownPolygon',
  'trainStationIsochrone',
  'coveredArea',
  'hill',
  'calmedTrafficArea',
] as const
const pointGroups = ['point'] as const

type LineGroup = typeof lineGroups[number]
type PolygonGroup = typeof polygonGroups[number]
type PointGroup = typeof pointGroups[number]

export type FeatureGroup = LineGroup | PolygonGroup | PointGroup
export const featureGroups: FeatureGroup[] = [
  ...lineGroups,
  ...polygonGroups,
  ...pointGroups,
]

export async function fetchMyMapsFeatures(): Promise<
  Map<FeatureGroup, FeatureCollection<Geometry, MyMapsProperties>>
> {
  const allFeatures = await fetchAllFeatures()
  const groupFeatures = groupBy(allFeatures.features, parseFeatureGroup)

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

function parseFeatureGroup(
  feature: Feature<Geometry, MyMapsProperties>,
): FeatureGroup {
  if (feature.geometry.type === 'LineString') {
    return parseLineGroup(feature)
  } else if (
    feature.geometry.type === 'Polygon' ||
    feature.geometry.type === 'GeometryCollection'
  ) {
    return parsePolygonGroup(feature)
  } else if (feature.geometry.type === 'Point') {
    return parsePointGroup(feature)
  } else {
    throw new Error(`Unknown geometry type: ${feature.geometry.type}`)
  }
}

function parseLineGroup(
  feature: Feature<Geometry, MyMapsProperties>,
): LineGroup {
  const { name, stroke, status, סוג } = feature.properties
  if (stroke === '#ff5252') {
    return 'dangerousRoad'
  } else if (stroke === '#0ba9cc') {
    return 'recommendedRoad'
  } else if (stroke === '#4186f0') {
    return 'recommendedRoadArrow'
  } else if (stroke === '#c6a4cf') {
    return 'ofney dan'
  } else if (stroke === '#fad199' || status?.trim() === 'תכנון') {
    return 'planned'
  } else if (status?.trim() === 'בביצוע') {
    return 'inProgress'
  } else if (stroke === '#f8971b' || stroke === '#ffdd5e') {
    return 'missing'
  } else if (stroke === '#7c3592') {
    return 'bridge'
  } else if (סוג?.trim() === 'דרך עפר' || סוג?.trim() === 'שביל עפר') {
    return 'missing'
  } else if (סוג?.trim() === 'דרך') {
    return 'road???'
  } else if (stroke === '#3f5ba9') {
    return 'bikePath'
  } else if (name.trim() === 'קו 121') {
    return 'mistake'
  } else {
    return 'unknown'
  }
}

function parsePolygonGroup(
  feature: Feature<Geometry, MyMapsProperties>,
): PolygonGroup {
  if (feature.properties.name.includes('דקות רכיבה מ')) {
    return 'trainStationIsochrone'
  } else if (feature.properties.fill === '#009d57') {
    return 'coveredArea'
  } else if (feature.properties.fill === '#ee9c96') {
    return 'hill'
  } else if (feature.properties.fill === '#93d7e8') {
    return 'calmedTrafficArea'
  } else {
    return 'unknownPolygon'
  }
}

function parsePointGroup(
  feature: Feature<Geometry, MyMapsProperties>,
): PointGroup {
  return 'point'
}

export function featureGroupLayerType(
  featureGroup: FeatureGroup,
): 'line' | 'point' | 'polygon' {
  if (featureGroup === 'point') {
    return 'point'
  } else if (
    [
      'unknownPolygon',
      'trainStationIsochrone',
      'coveredArea',
      'hill',
      'calmedTrafficArea',
    ].includes(featureGroup)
  ) {
    return 'polygon'
  } else {
    return 'line'
  }
}
