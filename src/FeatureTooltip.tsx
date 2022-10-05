import { featureGroupSingularDisplayName } from './featureGroups'
import { Panel } from './Panel'
import { rgbValuesForColor, textColor } from './utils'

export function FeatureTooltip({
  feature,
  canHover,
}: {
  feature: mapboxgl.MapboxGeoJSONFeature
  canHover: boolean
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
  const description =
    hebrewDescription ||
    englishDescription?.replace(/^תיאור: <br>סוג: $/, '') ||
    ''

  return (
    <Panel
      isOpen
      style={{
        top: '10px',
        right: canHover ? '50px' : '10px',
        left: '10px',
      }}
    >
      <h3 style={{ margin: '0 0 5px' }}>
        {title} <FeatureTag feature={feature} />
      </h3>
      {description && <p style={{ margin: '0' }}>{description}</p>}
    </Panel>
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
        boxShadow: '0 0 1px rgba(0, 0, 0, 0.01)',
      }}
    >
      {featureGroupSingularDisplayName(featureGroup)}
    </span>
  )
}

function DebugFeatureTooltip({
  feature,
  canHover,
}: {
  feature: mapboxgl.MapboxGeoJSONFeature
  canHover: boolean
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
    'סוג צומת',
  ]
  const otherKeys = Object.keys(properties).filter(
    (key) => !keysToShow.includes(key),
  )
  return (
    <Panel
      isOpen
      style={{
        top: '10px',
        right: canHover ? '50px' : '10px',
        left: '10px',
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
    </Panel>
  )
}

FeatureTooltip.Debug = DebugFeatureTooltip
