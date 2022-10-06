export type LayerType = 'line' | 'point' | 'polygon'

const myMapsLineGroups = [
  'bikePath',
  'recommendedRoad',
  'dangerousRoad',
  'ofney dan',
  'planned',
  'inProgress',
  'missing',
  'dirtRoad',
  'dirtPath',
  'bridge',
  'unknown',
  'mistake',
] as const

const myMapsPolygonGroups = [
  'unknownPolygon',
  'trainStationIsochrone',
  'coveredArea',
  'hill',
  'calmedTrafficArea',
] as const

const myMapsPointGroups = [
  'junction',
  'calmedJunction',
  'blockedPath',
  'trainStation',
  'generalNote',
] as const

export type MyMapsLineGroup = typeof myMapsLineGroups[number]
export type MyMapsPolygonGroup = typeof myMapsPolygonGroups[number]
export type MyMapsPointGroup = typeof myMapsPointGroups[number]

export type MyMapsFeatureGroup =
  | MyMapsLineGroup
  | MyMapsPolygonGroup
  | MyMapsPointGroup

export type OsmFeatureGroup = 'osmBikePath'

export type FeatureGroup = MyMapsFeatureGroup | OsmFeatureGroup

export const myMapsFeatureGroups: FeatureGroup[] = [
  ...myMapsLineGroups,
  ...myMapsPolygonGroups,
  ...myMapsPointGroups,
]

export function featureGroupLayerType(featureGroup: FeatureGroup): LayerType {
  if (myMapsPointGroups.includes(featureGroup as any)) {
    return 'point'
  } else if (myMapsPolygonGroups.includes(featureGroup as any)) {
    return 'polygon'
  } else {
    return 'line'
  }
}

export function featureGroupSingularDisplayName(layer: FeatureGroup): string {
  switch (layer) {
    case 'osmBikePath':
      return 'שביל אופניים (OSM)'
    case 'bikePath':
      return 'שביל אופניים'
    case 'recommendedRoad':
      return 'כביש סביר'
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
      return 'דרך עפר'
    case 'dirtPath':
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
    case 'osmBikePath':
      return 'שבילי אופניים (OSM)'
    case 'bikePath':
      return 'שבילי אופניים (מפה ציבורית)'
    case 'recommendedRoad':
      return 'כבישים סבירים'
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
      return 'דרכי עפר'
    case 'dirtPath':
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

export function featureGroupDescription(
  layer: FeatureGroup,
): string | undefined {
  switch (layer) {
    case 'bikePath':
      return 'עם הערות אבל פחות מעודכן'
    case 'osmBikePath':
      return 'בלי הערות אבל יותר מעודכן'
    case 'recommendedRoad':
      return 'כבישים שלא סיוט לרכוב עליהם'
    case 'dirtPath':
      return 'לא מומלץ לאופני כביש'
    case 'dirtRoad':
      return 'לא מומלץ לאופני כביש או עיר'
    case 'ofney dan':
      return 'פרוייקט שאמור לקשר את תל אביב לשאר ערי גוש דן'
    case 'calmedTrafficArea':
      return 'המהירות המותרת למכוניות היא עד 30 קמ״ש'
    default:
      return undefined
  }
}
