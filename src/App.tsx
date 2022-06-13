import {
  Feature,
  FeatureCollection,
  Geometry,
  LineString,
  Point as GeoJsonPoint,
  Position,
} from 'geojson'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useEffect, useMemo, useState } from 'react'
import {
  MdArrowBack,
  MdDone,
  MdEdit,
  MdInfoOutline,
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
import { Pane } from './Pane'
import { useMapFeatures } from './useMapFeatures'
import { compact, emptyFeatureGroup, useThrottledFunction } from './utils'

type Point = { latitude: number; longitude: number }

function App() {
  const { myMapsFeatures, osmFeatures } = useMapFeatures()
  const [currentlyOpenPane, setCurrentlyOpenPane] = useState<
    'settings' | 'layers' | 'about' | null
  >(null)
  const [baseMap, setBaseMap] = useState<'light' | 'dark'>('light')
  const [isDebugging, setIsDebugging] = useState(false)
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

  const [mode, setMode] = useState<'browse' | 'constructRoute' | 'viewRoute'>(
    'browse',
  )
  const route = useRoute(viewState, mode === 'constructRoute')

  const hoverInfoZoomThreshold = isDebugging ? 0 : 13
  const HoverInfoComponent = isDebugging ? HoverInfo.Debug : HoverInfo

  const color1 = baseMap === 'light' ? '#f0f9ff' : '#0c4a6e'
  const color2 = baseMap === 'light' ? '#e0f2fe' : '#075985'
  const color3 = baseMap === 'light' ? '#bae6fd' : '#0369a1'
  const color4 = baseMap === 'light' ? '#7dd3fc' : '#0284c7'

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
          const newHoverInfo =
            zoom > hoverInfoZoomThreshold
              ? featureAtPosition({
                  map: event.target,
                  position: [longitude, latitude],
                  interactiveLayerIds,
                })
              : null

          if (newHoverInfo?.id !== hoverInfo?.id) {
            if (hoverInfo) {
              event.target.setFeatureState(hoverInfo, { hover: false })
            }
            if (newHoverInfo) {
              event.target.setFeatureState(newHoverInfo, { hover: true })
            }
          }
          setHoverInfo(newHoverInfo)
        }}
        style={{ flexGrow: 1, position: 'relative' }}
        mapStyle={
          baseMap === 'light'
            ? 'mapbox://styles/danfishgold/cl2821j55000714m1b7zb25yd'
            : 'mapbox://styles/danfishgold/cl4d043ck000w14p2tm2v444j'
        }
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
              <MyMapsLayers group={group} />
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
        <Source type='geojson' data={route.features}>
          <Layer
            filter={['==', ['geometry-type'], 'LineString']}
            type='line'
            id='route-border'
            paint={{
              'line-color': '#218531',
              'line-width': 16,
            }}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          />
          <Layer
            filter={['==', ['geometry-type'], 'LineString']}
            type='line'
            id='route-lines'
            paint={{
              'line-color': '#2bbd43',
              'line-width': 12,
            }}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          />
          <Layer
            filter={['==', ['geometry-type'], 'Point']}
            type='circle'
            id='route-points'
            paint={{ 'circle-radius': 4, 'circle-color': 'white' }}
          />
        </Source>

        <Marker
          latitude={viewState.latitude}
          longitude={viewState.longitude}
          anchor='center'
        >
          <MdMyLocation
            size={20}
            color={baseMap === 'light' ? 'black' : 'white'}
          />
        </Marker>
        <LayerToggles
          isOpen={currentlyOpenPane === 'layers'}
          setIsOpen={(isOpen) => setCurrentlyOpenPane(isOpen ? 'layers' : null)}
          visibleLayers={visibleLayers}
          setVisibleLayers={setVisibleLayers}
          inDarkMode={baseMap === 'dark'}
        />
        <Pane
          isOpen={currentlyOpenPane === 'settings'}
          style={{
            bottom: '10px',
            left: '10px',
            right: '10px',
            maxHeight: 'calc(100% - 40px)',
          }}
          inDarkMode={baseMap === 'dark'}
        >
          <h2>הגדרות</h2>
          <div>
            <button onClick={() => setBaseMap('light')}>בהיר</button>
            <button onClick={() => setBaseMap('dark')}>כהה</button>
          </div>
          <div>
            <input
              type='checkbox'
              checked={isDebugging}
              onChange={(event) => setIsDebugging(event.target.checked)}
              id='settings__is-debugging-checkbox'
            />
            <label htmlFor='settings__is-debugging-checkbox'>
              מצב דיבוג (אם אתם לא דן אז לא כדאי)
            </label>
          </div>
        </Pane>
        <Pane
          isOpen={currentlyOpenPane === 'about'}
          style={{
            top: '10px',
            left: '10px',
            right: '10px',
            maxHeight: 'calc(100% - 40px)',
          }}
          inDarkMode={baseMap === 'dark'}
        >
          <h2>אודות</h2>
          <p>האתר הזה נבנה על ידי דן פישגולד.</p>
          <p>
            המפה וחלק מהמידע שמוצג עליה מגיע מ{' '}
            <a href='https://openstreetmap.org'>Open Street Map</a> (ומ Mapbox).
          </p>
          <p>
            כמעט כל המידע שמופיע על המפה מגיע מ
            <a href='https://www.google.com/maps/d/viewer?mid=1X14aSd2dYmTnBfy6UDmumcvshcw'>
              מפת שבילי האופניים של דרור רשף
            </a>{' '}
            ואני צריך לוודא איתו שהוא סבבה עם האתר הזה ועם הקרדיט הזה.
          </p>
          <p>תודה לכל האנשים שהקדישו מזמנם ליצירת ועדכון וטיפוח המידע הזה!</p>
          <p>
            קוד המקור של האתר זמין ב
            <a href='https://github.com/danfishgold/bike-map'>גיטהאב</a>. אתם
            מוזמנים לנבור או לתקן באגים או להציע הצעות!
          </p>
          <p>
            אם יש לכם שאלות או בקשות ויש לכם את מספר הטלפון שלי צרו איתי קשר
            בוואטסאפ. אם אין לכם את מספר הטלפון שלי צרו איתי קשר בטוויטר. אם אין
            לכם טוויטר צרו איתי קשר בפייסבוק. די דיינו די דיינו.
          </p>
          <p style={{ textAlign: 'left' }}>באהבה, דן</p>
        </Pane>
        {hoverInfo && !currentlyOpenPane && (
          <HoverInfoComponent
            feature={hoverInfo}
            inDarkMode={baseMap === 'dark'}
          />
        )}
      </Map>
      <ButtonBar>
        {mode === 'browse' ? (
          <>
            <ButtonBar.Button
              label='שכבות'
              icon={MdLayers}
              color={color1}
              onClick={() =>
                setCurrentlyOpenPane(
                  currentlyOpenPane === 'layers' ? null : 'layers',
                )
              }
            />
            <ButtonBar.Button
              label='תכנון מסלול'
              icon={TbRoute}
              color={color2}
              onClick={() => setMode('constructRoute')}
            />
            <ButtonBar.Button
              label='הגדרות'
              icon={MdSettings}
              color={color3}
              onClick={() =>
                setCurrentlyOpenPane(
                  currentlyOpenPane === 'settings' ? null : 'settings',
                )
              }
            />
            <ButtonBar.Button
              label='אודות'
              icon={MdInfoOutline}
              color={color4}
              onClick={() =>
                setCurrentlyOpenPane(
                  currentlyOpenPane === 'about' ? null : 'about',
                )
              }
            />
          </>
        ) : mode === 'constructRoute' ? (
          <>
            <ButtonBar.Button
              label='חזרה'
              icon={MdArrowBack}
              color={color1}
              onClick={() => {
                route.clear()
                setMode('browse')
              }}
            />
            <ButtonBar.Button
              disabled={!route.canRemoveStop}
              label='הסרת עצירה'
              icon={MdOutlineWrongLocation}
              color={color2}
              onClick={() => route.removeStop()}
            />
            <ButtonBar.Button
              label='הוספת עצירה'
              icon={MdOutlineAddLocationAlt}
              color={color3}
              onClick={() => route.addStop()}
            />
            <ButtonBar.Button
              label='סיום'
              icon={MdDone}
              color={color4}
              onClick={() => setMode('viewRoute')}
            />
          </>
        ) : (
          <>
            <ButtonBar.Button
              label='חזרה'
              icon={MdArrowBack}
              color={color1}
              onClick={() => {
                route.clear()
                setMode('browse')
              }}
            />
            <ButtonBar.Button
              label='עריכת המסלול'
              icon={MdEdit}
              color={color2}
              onClick={() => setMode('constructRoute')}
            />
            <ButtonBar.Button
              label='מידע נוסף'
              icon={MdInfoOutline}
              color={color3}
              onClick={() => alert('בסופו של דבר')}
            />
            <ButtonBar.Button
              label='שיתוף'
              icon={MdOutlineIosShare}
              color={color4}
              onClick={() => alert('בסופו של דבר')}
            />
          </>
        )}
      </ButtonBar>
    </div>
  )
}

export default App

type Segment = {
  origin: Point
  destination: Point
  feature: Feature<LineString>
}

type PartialSegment = {
  origin: Point
  destination: Point
  feature: Feature<LineString> | null
}

function useRoute(center: Point, isTracking: boolean) {
  const [segment, setSegment] = useState<PartialSegment | null>(null)

  const [pastSegments, setPastSegments] = useState<Segment[]>([])

  const throttledFetchSegment = useThrottledFunction(
    (origin: Point, destination: Point) => {
      console.log('calculating')
      fetchRoute(origin, destination).then((feature) =>
        setSegment({ origin, destination, feature }),
      )
    },
    250,
  )

  useEffect(() => {
    if (!isTracking) {
      return
    }
    if (!segment || distanceSortOf(segment.origin, center) < 0.001) {
      return
    }

    throttledFetchSegment(segment.origin, center)
  }, [center, segment?.origin, isTracking])

  // useEffect(() => {
  //   if (isTracking) {
  //     setSegment({ origin: center, destination: center, feature: null })
  //   }
  // }, [isTracking])

  const clear = () => {
    setPastSegments([])
    setSegment(null)
  }

  const addStop = () => {
    if (segment && !segment?.feature) {
      return
    }
    if (segment) {
      setPastSegments([...pastSegments, segment as Segment])
    }
    const lastSegment = segment ? segment : pastSegments.at(-1)
    const lastDestination = lastSegment?.feature?.geometry.coordinates.at(-1)
    const origin = lastDestination
      ? { longitude: lastDestination[0], latitude: lastDestination[1] }
      : center

    setSegment({
      origin,
      destination: center,
      feature: null,
    })
  }

  const removeStop = () => {
    if (!pastSegments.length) {
      return
    }
    const lastSegment = pastSegments[pastSegments.length - 1]
    setPastSegments(pastSegments.slice(0, -1))
    setSegment({
      origin: lastSegment.origin,
      destination: center,
      feature: null,
    })
  }

  const features: FeatureCollection<Geometry> = useMemo(() => {
    const segments = compact([...pastSegments, segment])
    const lineFeatures: Feature<LineString>[] = compact(
      segments.map((segment) => segment.feature),
    )

    const pointFeatures: Feature<GeoJsonPoint>[] = segments.flatMap(
      (segment): Feature<GeoJsonPoint>[] => {
        const points = segment.feature
          ? compact([
              segment.feature.geometry.coordinates.at(0),
              segment.feature.geometry.coordinates.at(-1),
            ])
          : []

        return points.map(pointFeature)
      },
    )

    return {
      type: 'FeatureCollection',
      features: [...lineFeatures, ...pointFeatures],
    }
  }, [pastSegments, segment])

  const canRemoveStop = pastSegments.length > 0

  return { canRemoveStop, clear, addStop, removeStop, features }
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

function pointFeature(point: Point | Position): Feature<GeoJsonPoint> {
  const coordinates = Array.isArray(point)
    ? point
    : [point.longitude, point.latitude]
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates },
    properties: {},
  }
}

function featureAtPosition({
  map,
  position,
  interactiveLayerIds,
}: {
  map: mapboxgl.Map
  position: mapboxgl.LngLatLike
  interactiveLayerIds: string[]
}) {
  const point = map.project(position)
  const features = map.queryRenderedFeatures(point, {
    layers: interactiveLayerIds,
  })
  return features[0] ?? null
}
