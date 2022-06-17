import * as tj from '@tmcw/togeojson'
import { Feature, FeatureCollection, Geometry } from 'geojson'
import 'mapbox-gl/dist/mapbox-gl.css'
import { customAlphabet } from 'nanoid'
import { env } from './env'
import {
  featureGroupLayerType,
  LayerType,
  MyMapsFeatureGroup,
  MyMapsLineGroup,
  MyMapsPointGroup,
  MyMapsPolygonGroup,
} from './featureGroups'

const nanoid = customAlphabet('1234567890', 18)

type RawMyMapsProperties = {
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

export type MyMapsProperties = RawMyMapsProperties & {
  featureGroup: MyMapsFeatureGroup
  layerType: LayerType
  highlightable: boolean
}

export async function fetchMyMapsFeatures(): Promise<
  FeatureCollection<Geometry, MyMapsProperties>
> {
  const response = await fetch(env.VITE_KML_SOURCE)
  const xmlString = await response.text()
  const xml = new DOMParser().parseFromString(xmlString, 'text/xml')
  const geoJson = tj.kml(xml)

  if (geoJson.features.some((feature) => feature.geometry === null)) {
    throw new Error('GeoJSON has null geometry')
  }

  const goodGeoJson = geoJson as FeatureCollection<
    Geometry,
    RawMyMapsProperties
  >

  const featuresButWithIdsAndGroups = goodGeoJson.features.map((feature) => {
    const [featureGroup, highlightable] = parseFeature(feature)
    const layerType = featureGroupLayerType(featureGroup)
    const properties: MyMapsProperties = {
      ...feature.properties,
      featureGroup,
      layerType,
      highlightable,
    }
    return {
      ...feature,
      id: parseInt(nanoid()),
      properties,
    }
  })

  return {
    ...goodGeoJson,
    features: featuresButWithIdsAndGroups,
  }
}

function parseFeature(
  feature: Feature<Geometry, RawMyMapsProperties>,
): [MyMapsFeatureGroup, boolean] {
  if (feature.geometry.type === 'LineString') {
    return parseLineFeature(feature)
  } else if (
    feature.geometry.type === 'Polygon' ||
    feature.geometry.type === 'GeometryCollection'
  ) {
    return parsePolygonFeature(feature)
  } else if (feature.geometry.type === 'Point') {
    return parsePointFeature(feature)
  } else {
    throw new Error(`Unknown geometry type: ${feature.geometry.type}`)
  }
}

function parseLineFeature(
  feature: Feature<Geometry, RawMyMapsProperties>,
): [MyMapsLineGroup, boolean] {
  const { name, stroke, status, סוג } = feature.properties
  if (stroke === '#ff5252') {
    return ['dangerousRoad', true]
  } else if (stroke === '#0ba9cc' || stroke === '#4186f0') {
    if (/^קו \d+$/.test(name)) {
      // this is a direction arrow
      return ['recommendedRoad', false]
    } else {
      return ['recommendedRoad', true]
    }
  } else if (stroke === '#c6a4cf') {
    return ['ofney dan', true]
  } else if (stroke === '#fad199' || status?.trim() === 'תכנון') {
    return ['planned', true]
  } else if (status?.trim() === 'בביצוע') {
    return ['inProgress', true]
  } else if (stroke === '#f8971b' || stroke === '#ffdd5e') {
    return ['missing', true]
  } else if (stroke === '#7c3592') {
    return ['bridge', true]
  } else if (סוג?.trim() === 'דרך עפר') {
    return ['dirtRoad', true]
  } else if (סוג?.trim() === 'שביל עפר') {
    return ['dirtPath', true]
  } else if (stroke === '#3f5ba9') {
    return ['bikePath', true]
  } else if (name.trim() === 'קו 121') {
    return ['mistake', true]
  } else {
    return ['unknown', true]
  }
}

function parsePolygonFeature(
  feature: Feature<Geometry, RawMyMapsProperties>,
): [MyMapsPolygonGroup, boolean] {
  if (feature.properties.name.includes('דקות רכיבה מ')) {
    return ['trainStationIsochrone', true]
  } else if (feature.properties.fill === '#009d57') {
    return ['coveredArea', true]
  } else if (feature.properties.fill === '#ee9c96') {
    return ['hill', true]
  } else if (feature.properties.fill === '#93d7e8') {
    return ['calmedTrafficArea', true]
  } else {
    return ['unknownPolygon', true]
  }
}

function parsePointFeature(
  feature: Feature<Geometry, RawMyMapsProperties>,
): [MyMapsPointGroup, boolean] {
  if (
    feature.properties.icon ===
    'https://www.gstatic.com/mapspro/images/stock/962-wht-diamond-blank.png'
  ) {
    return ['junction', true]
  } else if (
    feature.properties.icon ===
    'https://www.gstatic.com/mapspro/images/stock/1269-poi-hospital-cross.png'
  ) {
    return ['calmedJunction', true]
  } else if (
    feature.properties.icon ===
    'https://www.gstatic.com/mapspro/images/stock/1145-crisis-explosion.png'
  ) {
    return ['blockedPath', true]
  } else if (
    feature.properties.icon ===
    'https://www.gstatic.com/mapspro/images/stock/1459-trans-train.png'
  ) {
    return ['trainStation', true]
  } else {
    return ['generalNote', true]
  }
}
