import { featureGroupSingularDisplayName } from './myMapsMapData'
import { rgbValuesForColor, textColor } from './utils'

export function HoverInfo({
  feature,
}: {
  feature: mapboxgl.MapboxGeoJSONFeature
}) {
  const {
    name: title,
    תיאור: hebrewDescription,
    description: englishDescription,
    featureGroup,
  } = feature.properties ?? {}
  if (!title) {
    return null
  }
  const description = hebrewDescription || englishDescription

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '50px',
        left: '10px',
        padding: '5px',
        background: 'white',
        border: '1px solid black',
        direction: 'rtl',
      }}
    >
      <h3 style={{ margin: '0 0 5px' }}>
        {title} <FeatureTag feature={feature} />
      </h3>
      {description && <p style={{ margin: '0' }}>{description}</p>}
    </div>
  )
}

function FeatureTag({ feature }: { feature: mapboxgl.MapboxGeoJSONFeature }) {
  const { featureGroup, stroke } = feature.properties ?? {}
  if (!featureGroup || !stroke) {
    return null
  }

  return (
    <span
      style={{
        background: stroke,
        color: textColor(...rgbValuesForColor(stroke)),
        fontWeight: 'normal',
        padding: '2px 5px',
        borderRadius: '4px',
      }}
    >
      {featureGroupSingularDisplayName(featureGroup)}
    </span>
  )
}

function DebugHoverInfo({
  feature,
}: {
  feature: mapboxgl.MapboxGeoJSONFeature
}) {
  const properties = feature.properties ?? {}
  const keysToShow = [
    'name',
    'description',
    'stroke',
    'styleUrl',
    'stroke-opacity',
    'stroke-width',
    'תיאור',
    'סוג',
    'status',
    'type',
    'fill',
    'fill-opacity',
    'icon',
  ]
  const otherKeys = Object.keys(properties).filter(
    (key) => !keysToShow.includes(key),
  )
  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '50px',
        left: '10px',
        padding: '5px',
        background: 'white',
        border: '1px solid black',
        direction: 'rtl',
      }}
    >
      <ul>
        {keysToShow.map(
          (key) =>
            properties[key] && (
              <li key={key}>
                {key}: {properties[key]}
              </li>
            ),
        )}
        {otherKeys.length > 0 && <li>{otherKeys.join(', ')}</li>}
      </ul>
      <button onClick={() => console.log({ feature })}>לוג</button>
    </div>
  )
}

HoverInfo.Debug = DebugHoverInfo
