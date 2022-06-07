import 'mapbox-gl/dist/mapbox-gl.css'
import { ReactElement, useCallback, useState } from 'react'
import Map, {
  AttributionControl,
  GeolocateControl,
  Layer,
  NavigationControl,
  ScaleControl,
  Source,
} from 'react-map-gl'
import { env } from './env'
import {
  FeatureGroup,
  featureGroupLayerType,
  featureGroups,
} from './myMapsMapData'
import { useMapFeatures } from './useMapFeatures'
import { emptyFeatureGroup, toggleSetMember } from './utils'

function App() {
  const { myMapsFeatures, osmFeatures } = useMapFeatures()
  const [visibleMyMapsFeatures, setVisibleMyMapsFeatures] = useState(
    new Set<FeatureGroup>([
      'recommendedRoad',
      'recommendedRoadArrow',
      'dangerousRoad',
      'hill',
    ]),
  )
  const [hoverInfo, setHoverInfo] = useState<{
    feature: mapboxgl.MapboxGeoJSONFeature
    x: number
    y: number
  } | null>(null)

  const onHover = useCallback((event: mapboxgl.MapLayerMouseEvent) => {
    const {
      features,
      point: { x, y },
    } = event
    const hoveredFeature = features && features[0]

    setHoverInfo(hoveredFeature ? { feature: hoveredFeature, x, y } : null)
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Map
        initialViewState={{
          longitude: 34.7804731,
          latitude: 32.0805045,
          zoom: 12,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle='mapbox://styles/danfishgold/cl2821j55000714m1b7zb25yd'
        mapboxAccessToken={env.VITE_MAPBOX_TOKEN}
        attributionControl={false}
        interactiveLayerIds={featureGroups
          .filter((group) => visibleMyMapsFeatures.has(group))
          .map((group) => `my-maps-${group}`)}
        onMouseMove={onHover}
        onMouseLeave={() => setHoverInfo(null)}
      >
        <ScaleControl />
        <NavigationControl />
        <GeolocateControl />
        <AttributionControl customAttribution={[]} />
        {featureGroups
          .filter((group) => visibleMyMapsFeatures.has(group))
          .map((group) => (
            <Source
              key={group}
              type='geojson'
              data={myMapsFeatures?.get(group) ?? emptyFeatureGroup}
            >
              <MyMapsLayer group={group} />
            </Source>
          ))}
        {osmFeatures && (
          <Source type='geojson' data={osmFeatures}>
            <Layer
              type='line'
              id='all-osm-lines'
              paint={{
                'line-color': '#3f5ba9',
                'line-width': 4,
              }}
              layout={{
                'line-cap': 'round',
              }}
            />
          </Source>
        )}
        {hoverInfo && <HoverInfo feature={hoverInfo.feature} />}
        <MyMapsFeatureToggles
          visibleFeatures={visibleMyMapsFeatures}
          setVisibleFeatures={setVisibleMyMapsFeatures}
        />
      </Map>
    </div>
  )
}

export default App

function HoverInfo({ feature }: { feature: mapboxgl.MapboxGeoJSONFeature }) {
  if (!feature.properties) {
    return null
  }

  const {
    name,
    description,
    stroke,
    styleUrl,
    'stroke-opacity': strokeOpacity,
    'stroke-width': strokeWidth,
    תיאור: hebrewDescription,
    סוג: hebrewType,
    status,
    type,
    fill,
    'fill-opacity': fillOpacity,
    icon,
    ...rest
  } = feature.properties
  const otherKeys = Object.keys(rest)
  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '50px',
        padding: '5px',
        background: 'white',
        direction: 'rtl',
      }}
    >
      <ul>
        {name && <li>name: {name}</li>}
        {description && <li>description: {description}</li>}
        {hebrewDescription && <li>תיאור: {hebrewDescription}</li>}
        {stroke && <li>stroke: {stroke}</li>}
        {fill && <li>fill: {fill}</li>}
        {icon && <li>icon: {icon}</li>}
        {fillOpacity && <li>fill-opacity: {fillOpacity}</li>}
        {type && <li>type: {type}</li>}
        {hebrewType && <li>סוג: {hebrewType}</li>}
        {status && <li>status: {status}</li>}
        {otherKeys.length > 0 && <li>{otherKeys.join(', ')}</li>}
      </ul>
    </div>
  )
}

function MyMapsFeatureToggles({
  visibleFeatures,
  setVisibleFeatures,
}: {
  visibleFeatures: Set<FeatureGroup>
  setVisibleFeatures: (visibleFeatures: Set<FeatureGroup>) => void
}) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '10px',
        padding: '5px',
        background: 'white',
        direction: 'rtl',
      }}
    >
      {featureGroups.map((group) => (
        <div key={group}>
          <input
            id={`my-maps-feature-toggle-${group}`}
            type='checkbox'
            checked={visibleFeatures.has(group)}
            onChange={(event) =>
              setVisibleFeatures(
                toggleSetMember(visibleFeatures, group, event.target.checked),
              )
            }
          />
          <label htmlFor={`my-maps-feature-toggle-${group}`}>{group}</label>
        </div>
      ))}
    </div>
  )
}

function MyMapsLayer({
  group,
  source,
}: {
  group: FeatureGroup
  source?: string | mapboxgl.AnySourceData
}): ReactElement {
  switch (featureGroupLayerType(group)) {
    case 'line': {
      return (
        <Layer
          type='line'
          id={`my-maps-${group}`}
          source={source}
          paint={{
            'line-color': ['get', 'stroke'],
            'line-width': ['get', 'stroke-width'],
            'line-opacity': ['get', 'stroke-opacity'],
          }}
          layout={{
            'line-cap': 'round',
          }}
        />
      )
    }
    case 'point': {
      return (
        <Layer
          type='circle'
          id={`my-maps-${group}`}
          source={source}
          paint={{ 'circle-color': ['get', 'icon-color'] }}
        />
      )
    }
    case 'polygon': {
      return (
        <Layer
          type='fill'
          id={`my-maps-${group}`}
          source={source}
          paint={{
            'fill-color': ['get', 'fill'],
            'fill-opacity': ['get', 'fill-opacity'],
          }}
        />
      )
    }
  }
}
