import { Feature, LineString } from 'geojson'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useEffect, useState } from 'react'
import {
  MdArrowBack,
  MdCircle,
  MdDone,
  MdLayers,
  MdMyLocation,
  MdOutlineAddLocationAlt,
  MdOutlineIosShare,
  MdOutlineWrongLocation,
  MdSettings,
} from 'react-icons/md'
import { TbRoute } from 'react-icons/tb'
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
import { HoverInfo } from './HoverInfo'
import { LayerToggles } from './LayerToggles'
import { MyMapsLayers } from './MyMapsLayers'
import { FeatureGroup, featureGroups } from './myMapsMapData'
import { useMapFeatures } from './useMapFeatures'
import { emptyFeatureGroup, useThrottledFunction } from './utils'

type Point = { latitude: number; longitude: number }

function App() {
  const { myMapsFeatures, osmFeatures } = useMapFeatures()
  const [isLayerListOpen, setIsLayerListOpen] = useState(false)
  const [visibleLayers, setVisibleLayers] = useState(
    new Set<FeatureGroup | 'osmBikePaths'>([
      'osmBikePaths',
      'recommendedRoad',
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
              <MyMapsLayers
                group={group}
                highlightedId={hoverInfo?.id ?? null}
              />
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
            >
              <MdCircle color='red' size='20' />
            </Marker>
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
          <MdMyLocation size={20} />
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
              icon={MdArrowBack}
              color={color1}
              onClick={() => route.clearPath()}
            />
            <ButtonBar.Button
              label='הסרת עצירה'
              icon={MdOutlineWrongLocation}
              color={color2}
              onClick={() => {}}
            />
            <ButtonBar.Button
              label='הוספת עצירה'
              icon={MdOutlineAddLocationAlt}
              color={color3}
              onClick={() => {}}
            />
            <ButtonBar.Button
              label='סיום'
              icon={MdDone}
              color={color4}
              onClick={() => {}}
            />
          </>
        ) : (
          <>
            <ButtonBar.Button
              label='שכבות'
              icon={MdLayers}
              color={color1}
              onClick={() => setIsLayerListOpen(!isLayerListOpen)}
            />
            <ButtonBar.Button
              label='תכנון מסלול'
              icon={TbRoute}
              color={color2}
              onClick={() => route.setOrigin(viewState)}
            />
            <ButtonBar.Button
              label='שיתוף'
              icon={MdOutlineIosShare}
              color={color3}
              onClick={() => alert('אל תשתפו את האתר הזה בינתיים בבקשה')}
            />
            <ButtonBar.Button
              label='הגדרות'
              icon={MdSettings}
              color={color4}
              onClick={() => alert('עוד אין')}
            />
          </>
        )}
      </ButtonBar>
    </div>
  )
}

export default App

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
