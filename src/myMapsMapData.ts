import * as tj from '@tmcw/togeojson'
import { Feature, FeatureCollection, Geometry } from 'geojson'
import 'mapbox-gl/dist/mapbox-gl.css'
import { customAlphabet } from 'nanoid'
import { env } from './env'
import { groupBy } from './utils'

const nanoid = customAlphabet('1234567890', 18)

type MyMapsProperties = {
  name: string
  description: string
  stroke: string
  fill?: string
  'stroke-width': number
  'stroke-opacity': number
  סוג?: string
  status?: string
  icon?: string
}

const lineGroups = [
  'bikePath',
  'recommendedRoad',
  'roadArrow',
  'dangerousRoad',
  'ofney dan',
  'planned',
  'inProgress',
  'missing',
  'dirtRoad',
  'bridge',
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
const pointGroups = [
  'junction',
  'calmedJunction',
  'blockedPath',
  'trainStation',
  'generalNote',
] as const

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
      {
        type: 'FeatureCollection',
        features: features.map((feature) => ({
          ...feature,
          properties: { ...feature.properties, featureGroup: group },
        })),
      },
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

  const featuresButWithIds = geoJson.features.map((feature) => ({
    ...feature,
    id: parseInt(nanoid()),
  }))

  return { ...geoJson, features: featuresButWithIds } as FeatureCollection<
    Geometry,
    MyMapsProperties
  >
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
  } else if (stroke === '#0ba9cc' || stroke === '#4186f0') {
    if (/^קו \d+$/.test(name)) {
      return 'roadArrow'
    } else {
      return 'recommendedRoad'
    }
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
  if (
    feature.properties.icon ===
    'https://www.gstatic.com/mapspro/images/stock/962-wht-diamond-blank.png'
  ) {
    return 'junction'
  } else if (
    feature.properties.icon ===
    'https://www.gstatic.com/mapspro/images/stock/1269-poi-hospital-cross.png'
  ) {
    return 'calmedJunction'
  } else if (
    feature.properties.icon ===
    'https://www.gstatic.com/mapspro/images/stock/1145-crisis-explosion.png'
  ) {
    return 'blockedPath'
  } else if (
    feature.properties.icon ===
    'https://www.gstatic.com/mapspro/images/stock/1459-trans-train.png'
  ) {
    return 'trainStation'
  } else {
    return 'generalNote'
  }
}

export function featureGroupLayerType(
  featureGroup: FeatureGroup,
): 'line' | 'point' | 'polygon' {
  if (pointGroups.includes(featureGroup as any)) {
    return 'point'
  } else if (polygonGroups.includes(featureGroup as any)) {
    return 'polygon'
  } else {
    return 'line'
  }
}

export function featureGroupSingularDisplayName(layer: FeatureGroup): string {
  switch (layer) {
    case 'bikePath':
      return 'שביל'
    case 'recommendedRoad':
      return 'מסלול חלופי'
    case 'roadArrow':
      return 'חץ סטריות'
    case 'dangerousRoad':
      return 'כביש מסוכן'
    case 'ofney dan':
      return 'אופנידן'
    case 'planned':
      return 'שביל מתוכנן'
    case 'inProgress':
      return 'שביל בביצוע'
    case 'missing':
      return 'שביל חסר'
    case 'dirtRoad':
      return 'שביל עפר'
    case 'bridge':
      return 'גשר'
    case 'unknown':
      return '???'
    case 'mistake':
      return 'טעות'
    case 'unknownPolygon':
      return 'שטח כלשהו'
    case 'trainStationIsochrone':
      return 'איזוכרון תחנת רכבת'
    case 'coveredArea':
      return 'שטח מכוסה'
    case 'hill':
      return 'גבעה'
    case 'calmedTrafficArea':
      return 'איזור מיתון תנועה'
    case 'junction':
      return 'צומת'
    case 'calmedJunction':
      return 'צומת עם מיתון תנועה'
    case 'blockedPath':
      return 'דרך חסומה'
    case 'trainStation':
      return 'תחנת רכבת'
    case 'generalNote':
      return 'הערה כללית'
  }
}

export function featureGroupPluralDisplayName(layer: FeatureGroup): string {
  switch (layer) {
    case 'bikePath':
      return 'שבילי אופניים'
    case 'recommendedRoad':
      return 'מסלולים חלופיים'
    case 'roadArrow':
      return 'חיצי סטריות'
    case 'dangerousRoad':
      return 'כבישים מסוכנים'
    case 'ofney dan':
      return 'אופנידן'
    case 'planned':
      return 'שבילים מתוכננים'
    case 'inProgress':
      return 'שבילים בביצוע'
    case 'missing':
      return 'שבילים חסרים'
    case 'dirtRoad':
      return 'שבילי עפר'
    case 'bridge':
      return 'גשרים'
    case 'unknown':
      return '???'
    case 'mistake':
      return 'טעויות'
    case 'unknownPolygon':
      return 'שטחים כלשהם'
    case 'trainStationIsochrone':
      return 'איזוכרוני תחנת רכבת'
    case 'coveredArea':
      return 'שטחים מכוסים'
    case 'hill':
      return 'גבעות'
    case 'calmedTrafficArea':
      return 'איזורי מיתון תנועה'
    case 'junction':
      return 'צמתים'
    case 'calmedJunction':
      return 'צמתים עם מיתון תנועה'
    case 'blockedPath':
      return 'דרכים חסומות'
    case 'trainStation':
      return 'תחנות רכבת'
    case 'generalNote':
      return 'הערות כלליות'
  }
}
