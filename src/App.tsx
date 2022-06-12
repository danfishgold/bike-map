import { Feature, LineString } from 'geojson'
import 'mapbox-gl/dist/mapbox-gl.css'
import { ReactElement, useEffect, useState } from 'react'
import Map, {
  AttributionControl,
  GeolocateControl,
  Layer,
  Marker,
  NavigationControl,
  ScaleControl,
  Source,
} from 'react-map-gl'
import ButtonBar from './ButtonBar'
import { env } from './env'
import {
  FeatureGroup,
  featureGroupLayerType,
  featureGroupPluralDisplayName,
  featureGroups,
  featureGroupSingularDisplayName,
} from './myMapsMapData'
import { useMapFeatures } from './useMapFeatures'
import {
  emptyFeatureGroup,
  rgbValuesForColor,
  textColor,
  toggleSetMember,
  useThrottledFunction,
} from './utils'

type Point = { latitude: number; longitude: number }

function App() {
  const { myMapsFeatures, osmFeatures } = useMapFeatures()
  const [isLayerListOpen, setIsLayerListOpen] = useState(false)
  const [visibleLayers, setVisibleLayers] = useState(
    new Set<FeatureGroup | 'osmBikePaths'>([
      'osmBikePaths',
      'recommendedRoad',
      'alsoRecommendedRoadMaybe?',
      'roadArrow',
      'dangerousRoad',
      'hill',
    ]),
  )
  const [hoverInfo, setHoverInfo] =
    useState<mapboxgl.MapboxGeoJSONFeature | null>(null)

  const [viewState, setViewState] = useState({
    longitude: 34.7804731,
    latitude: 32.0805045,
    zoom: 12,
  })

  const route = useRoute(viewState)

  const interactiveLayerIds = featureGroups
    .filter((group) => visibleLayers.has(group))
    .filter((group) => group !== 'roadArrow')
    .map((group) => `my-maps-target-${group}`)

  return (
    <div
      style={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Map
        {...viewState}
        onMove={(event) => {
          setViewState(event.viewState)
          const { latitude, longitude, zoom } = event.viewState
          if (zoom > 13) {
            const point = event.target.project([longitude, latitude])
            const features = event.target.queryRenderedFeatures(point, {
              layers: interactiveLayerIds,
            })
            setHoverInfo(features[0] ?? null)
          } else {
            setHoverInfo(null)
          }
        }}
        style={{ width: '100%', flexGrow: 1 }}
        mapStyle='mapbox://styles/danfishgold/cl2821j55000714m1b7zb25yd'
        mapboxAccessToken={env.VITE_MAPBOX_TOKEN}
        attributionControl={false}
        interactiveLayerIds={interactiveLayerIds}
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
        {route.path && (
          <>
            <Marker
              latitude={route.path.origin.latitude}
              longitude={route.path.origin.longitude}
            ></Marker>
            {route.path.feature && (
              <Source type='geojson' data={route.path.feature}>
                <Layer
                  type='line'
                  id='route'
                  paint={{
                    'line-color': 'black',
                    'line-width': 3,
                  }}
                />
              </Source>
            )}
          </>
        )}
        <Marker
          latitude={viewState.latitude}
          longitude={viewState.longitude}
          anchor='center'
        >
          ×
        </Marker>
        <LayerToggles
          isOpen={isLayerListOpen}
          setIsOpen={setIsLayerListOpen}
          visibleLayers={visibleLayers}
          setVisibleLayers={setVisibleLayers}
        />
        {hoverInfo && !isLayerListOpen && <HoverInfo feature={hoverInfo} />}
      </Map>
      <ButtonBar>
        {route.path ? (
          <>
            <ButtonBar.Button
              label='חזרה'
              color={color1}
              onClick={() => route.clearPath()}
            />
            <ButtonBar.Button label='אנדו' color={color2} onClick={() => {}} />
            <ButtonBar.Button label='עצירה' color={color3} onClick={() => {}} />
            <ButtonBar.Button label='סיום' color={color4} onClick={() => {}} />
          </>
        ) : (
          <>
            <ButtonBar.Button
              label='שכבות'
              color={color1}
              onClick={() => setIsLayerListOpen(!isLayerListOpen)}
            />
            <ButtonBar.Button
              label='מסלול'
              color={color2}
              onClick={() => route.setOrigin(viewState)}
            />
            <ButtonBar.Button
              label='שיתוף'
              color={color3}
              onClick={() => alert('אל תשתפו את האתר הזה בינתיים בבקשה')}
            />
          </>
        )}
      </ButtonBar>
    </div>
  )
}

export default App

function HoverInfo({ feature }: { feature: mapboxgl.MapboxGeoJSONFeature }) {
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
      <button onClick={onHide}>hide</button>
    </div>
  )
}

function LayerToggles({
  isOpen,
  setIsOpen,
  visibleLayers: visibleFeatures,
  setVisibleLayers: setVisibleFeatures,
}: {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  visibleLayers: Set<FeatureGroup | 'osmBikePaths'>
  setVisibleLayers: (
    visibleFeatures: Set<FeatureGroup | 'osmBikePaths'>,
  ) => void
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        padding: '5px',
        background: 'white',
        border: '1px solid black',
        direction: 'rtl',
      }}
    >
      <button onClick={() => setIsOpen(false)}>סגירה</button>
      {['osmBikePaths' as const, ...featureGroups].map((group) => (
        <div key={group}>
          <input
            id={`layer-toggle-${group}`}
            type='checkbox'
            checked={visibleFeatures.has(group)}
            onChange={(event) =>
              setVisibleFeatures(
                toggleSetMember(visibleFeatures, group, event.target.checked),
              )
            }
          />
          <label htmlFor={`layer-toggle-${group}`}>
            {group === 'osmBikePaths'
              ? 'שבילי אופניים (OSM)'
              : featureGroupPluralDisplayName(group)}
          </label>
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

function useRoute(center: Point) {
  const [path, setPath] = useState<{
    origin: Point
    destination: Point | null
    feature: Feature<LineString> | null
  } | null>(null)

  const throttledFetchRoute = useThrottledFunction(
    (origin: Point, destination: Point) => {
      console.log('calculating')
      fetchRoute(origin, destination).then((feature) =>
        setPath({ origin, destination, feature }),
      )
    },
    250,
  )

  useEffect(() => {
    if (!path || distanceSortOf(path.origin, center) < 0.001) {
      return
    }

    throttledFetchRoute(path.origin, center)
  }, [center, path?.origin])

  const setOrigin = (origin: Point) => {
    setPath({ origin, destination: null, feature: null })
  }

  const clearPath = () => {
    setPath(null)
  }

  return { setOrigin, path, clearPath }
}

function distanceSortOf(p1: Point, p2: Point) {
  return Math.hypot(p1.latitude - p2.latitude, p1.longitude - p2.longitude)
}

async function fetchRoute(origin: Point, destination: Point) {
  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/cycling/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?geometries=geojson&access_token=${env.VITE_MAPBOX_TOKEN}`,
  )
  const data = await response.json()

  const feature = { type: 'Feature', ...data.routes[0] }
  return feature
}

const color1 = '#f0f9ff'
const color2 = '#e0f2fe'
const color3 = '#bae6fd'
const color4 = '#7dd3fc'
