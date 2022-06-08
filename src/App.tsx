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
  const [visibleLayers, setVisibleLayers] = useState(
    new Set<FeatureGroup | 'osmBikePaths'>([
      'osmBikePaths',
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

  const onClick = useCallback((event: mapboxgl.MapLayerMouseEvent) => {
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
          .filter((group) => visibleLayers.has(group))
          .map((group) => `my-maps-target-${group}`)}
        onClick={onClick}
        onMouseEnter={(event) =>
          (event.target.getCanvas().style.cursor = 'pointer')
        }
        onMouseLeave={(event) => (event.target.getCanvas().style.cursor = '')}
      >
        <ScaleControl />
        <NavigationControl />
        <GeolocateControl />
        <AttributionControl customAttribution={[]} />
        {featureGroups
          .filter((group) => visibleLayers.has(group))
          .map((group) => (
            <Source
              key={group}
              type='geojson'
              data={myMapsFeatures?.get(group) ?? emptyFeatureGroup}
            >
              <MyMapsLayer group={group} />
            </Source>
          ))}
        {osmFeatures && visibleLayers.has('osmBikePaths') && (
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
        <LayerToggles
          visibleLayers={visibleLayers}
          setVisibleLayers={setVisibleLayers}
        />
        {hoverInfo && (
          <HoverInfo
            feature={hoverInfo.feature}
            onHide={() => setHoverInfo(null)}
          />
        )}
      </Map>
    </div>
  )
}

export default App

function HoverInfo({
  feature,
  onHide,
}: {
  feature: mapboxgl.MapboxGeoJSONFeature
  onHide: () => void
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
      <button onClick={onHide}>hide</button>
    </div>
  )
}

function LayerToggles({
  visibleLayers: visibleFeatures,
  setVisibleLayers: setVisibleFeatures,
}: {
  visibleLayers: Set<FeatureGroup | 'osmBikePaths'>
  setVisibleLayers: (
    visibleFeatures: Set<FeatureGroup | 'osmBikePaths'>,
  ) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        padding: '5px',
        background: 'white',
      }}
    >
      {isOpen ? (
        <>
          <button onClick={() => setIsOpen(false)}>close</button>
          {['osmBikePaths' as const, ...featureGroups].map((group) => (
            <div key={group}>
              <input
                id={`layer-toggle-${group}`}
                type='checkbox'
                checked={visibleFeatures.has(group)}
                onChange={(event) =>
                  setVisibleFeatures(
                    toggleSetMember(
                      visibleFeatures,
                      group,
                      event.target.checked,
                    ),
                  )
                }
              />
              <label htmlFor={`layer-toggle-${group}`}>{group}</label>
            </div>
          ))}
        </>
      ) : (
        <button onClick={() => setIsOpen(true)}>שכבות</button>
      )}
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
        <>
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
          <Layer
            type='line'
            id={`my-maps-target-${group}`}
            source={source}
            paint={{
              'line-width': 20,
              'line-color': '#ffffff',
              'line-opacity': 0.00001,
            }}
          />
        </>
      )
    }
    case 'point': {
      return (
        <Layer
          type='circle'
          id={`my-maps-target-${group}`}
          source={source}
          paint={{ 'circle-color': ['get', 'icon-color'] }}
        />
      )
    }
    case 'polygon': {
      return (
        <Layer
          type='fill'
          id={`my-maps-target-${group}`}
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
