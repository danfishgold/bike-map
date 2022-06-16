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
import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { useLocalStorage, useMediaQuery, useTernaryDarkMode } from 'usehooks-ts'
import darkMode from './assets/darkMode.png'
import lightMode from './assets/lightMode.png'
import ButtonBar from './ButtonBar'
import { env } from './env'
import { FeatureTooltip } from './FeatureTooltip'
import { LayerToggles } from './LayerToggles'
import { FeatureGroup } from './myMapsMapData'
import { Pane } from './Pane'
import { useMapFeatures } from './useMapFeatures'
import { compact, emptyFeatureGroup, useThrottledValue } from './utils'

type Point = { latitude: number; longitude: number }

function App() {
  const canHover = useMediaQuery('(any-hover: hover)')
  const { myMapsFeatures, osmFeatures } = useMapFeatures()
  const [currentlyOpenPane, setCurrentlyOpenPane] = useState<
    'settings' | 'layers' | 'about' | null
  >(null)
  const [isDebugging, setIsDebugging] = useState(false)
  const [visibleGroups, setVisibleGroups] = useState(
    new Set<FeatureGroup | 'osmBikePaths'>([
      'osmBikePaths',
      'recommendedRoad',
      'roadArrow',
      'dangerousRoad',
      'hill',
      'calmedTrafficArea',
      'dirtPath',
    ]),
  )
  const [tooltipFeature, setTooltipFeature] =
    useState<mapboxgl.MapboxGeoJSONFeature | null>(null)

  const [viewState, setViewState] = useLocalStorage('mapViewState', {
    longitude: 34.7804731,
    latitude: 32.0805045,
    zoom: 12,
  })

  const [mode, setMode] = useState<'browse' | 'constructRoute' | 'viewRoute'>(
    'browse',
  )
  const [firstSymbolLayer, setFirstSymbolLayer] = useState<string | undefined>(
    undefined,
  )
  const route = useRoute(viewState, mode === 'constructRoute')
  const { isDarkMode, ternaryDarkMode, setTernaryDarkMode } =
    useTernaryDarkMode()

  const tooltipFeatureZoomThreshold = isDebugging ? 0 : 13
  const FeatureTooltipComponent = isDebugging
    ? FeatureTooltip.Debug
    : FeatureTooltip

  const interactiveLayerIds = [
    'my-maps-points',
    'my-maps-line-targets',
    'my-maps-polygons',
  ]

  const highlightFeature = useCallback(
    (feature: mapboxgl.MapboxGeoJSONFeature | null, map: mapboxgl.Map) => {
      if (feature?.id !== tooltipFeature?.id) {
        if (tooltipFeature) {
          map.setFeatureState(tooltipFeature, {
            highlighted: false,
          })
        }
        if (feature) {
          map.setFeatureState(feature, {
            highlighted: true,
          })
        }
      }
      setTooltipFeature(feature)
    },
    [tooltipFeature],
  )

  const onMouseEnter = useCallback((event: mapboxgl.MapLayerMouseEvent) => {
    event.target.getCanvas().style.cursor = 'pointer'
  }, [])

  const onMouseMove = useCallback(
    (event: mapboxgl.MapLayerMouseEvent) => {
      if (viewState.zoom <= tooltipFeatureZoomThreshold) {
        return
      }
      const { features } = event
      const hoveredFeature = features && features[0]
      highlightFeature(hoveredFeature ?? null, event.target)
    },
    [viewState.zoom, tooltipFeatureZoomThreshold, highlightFeature],
  )

  const onMouseLeave = useCallback(
    (event: mapboxgl.MapLayerMouseEvent) => {
      event.target.getCanvas().style.cursor = ''
      highlightFeature(null, event.target)
    },
    [canHover, highlightFeature],
  )

  return (
    <div
      className={`app-container ${isDarkMode ? 'dark' : ''}`}
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
          if (!canHover) {
            const newTooltipFeature =
              zoom > tooltipFeatureZoomThreshold
                ? featureAtPosition({
                    map: event.target,
                    position: [longitude, latitude],
                    interactiveLayerIds,
                  })
                : null

            highlightFeature(newTooltipFeature, event.target)
          }
        }}
        style={{ flexGrow: 1, position: 'relative' }}
        mapStyle={
          isDarkMode
            ? 'mapbox://styles/danfishgold/cl4d043ck000w14p2tm2v444j'
            : 'mapbox://styles/danfishgold/cl2821j55000714m1b7zb25yd'
        }
        mapboxAccessToken={env.VITE_MAPBOX_TOKEN}
        attributionControl={false}
        interactiveLayerIds={interactiveLayerIds}
        onMouseEnter={canHover ? onMouseEnter : undefined}
        onMouseMove={canHover ? onMouseMove : undefined}
        onMouseLeave={canHover ? onMouseLeave : undefined}
        onLoad={(event) => {
          const layers = event.target.getStyle().layers
          // Find the index of the first symbol layer in the map style.
          let firstSymbolId
          for (const layer of layers) {
            if (layer.type === 'symbol') {
              firstSymbolId = layer.id
              break
            }
          }
          setFirstSymbolLayer(firstSymbolId)
        }}
      >
        <ScaleControl />
        <NavigationControl />
        <GeolocateControl />
        <AttributionControl
          customAttribution={['© המפה הציבורית לשבילי אופניים']}
        />
        <Source id='my-maps-features' type='geojson' data={myMapsFeatures}>
          <Layer
            beforeId={firstSymbolLayer}
            type='fill'
            id='my-maps-polygons'
            filter={[
              'all',
              ['==', ['get', 'layerType'], 'polygon'],
              [
                'in',
                ['get', 'featureGroup'],
                ['literal', Array.from(visibleGroups)],
              ],
            ]}
            paint={{
              'fill-color': ['get', 'fill'],
              'fill-opacity': [
                'interpolate',
                ['linear'],
                [
                  'case',
                  ['boolean', ['feature-state', 'highlighted'], false],
                  0.5,
                  0,
                ],
                0,
                ['get', 'fill-opacity'],
                1,
                1,
              ],
            }}
          />

          <Layer
            id='my-maps-lines'
            type='line'
            filter={[
              'all',
              ['==', ['get', 'layerType'], 'line'],
              [
                'in',
                ['get', 'featureGroup'],
                ['literal', Array.from(visibleGroups)],
              ],
            ]}
            paint={{
              'line-color': ['get', 'stroke'],
              'line-width': [
                '*',
                [
                  'case',
                  ['boolean', ['feature-state', 'highlighted'], false],
                  2,
                  1,
                ],
                ['get', 'stroke-width'],
              ],
              'line-opacity': ['get', 'stroke-opacity'],
            }}
            layout={{
              'line-cap': 'round',
            }}
          />
          <Layer
            beforeId={firstSymbolLayer}
            type='line'
            id='my-maps-line-targets'
            filter={[
              'all',
              ['==', ['get', 'layerType'], 'line'],
              [
                'in',
                ['get', 'featureGroup'],
                ['literal', Array.from(visibleGroups)],
              ],
              ['!=', ['get', 'featureGroup'], 'roadArrow'],
            ]}
            paint={{
              'line-width': 20,
              'line-color': '#ffffff',
              'line-opacity': 0.0001,
            }}
          />

          <Layer
            beforeId={firstSymbolLayer}
            type='circle'
            id='my-maps-points'
            filter={[
              'all',
              ['==', ['get', 'layerType'], 'point'],
              [
                'in',
                ['get', 'featureGroup'],
                ['literal', Array.from(visibleGroups)],
              ],
            ]}
            paint={{ 'circle-color': ['get', 'icon-color'] }}
          />
        </Source>

        <Source type='geojson' data={osmFeatures ?? emptyFeatureGroup}>
          <Layer
            beforeId={firstSymbolLayer}
            type='line'
            id='osm-bike-paths'
            filter={['to-boolean', visibleGroups.has('osmBikePaths')]}
            paint={{
              'line-color': '#3f5ba9',
              'line-width': 4,
            }}
            layout={{
              'line-cap': 'round',
            }}
          />
        </Source>

        <Source type='geojson' data={route.features}>
          <Layer
            beforeId={firstSymbolLayer}
            filter={['==', ['geometry-type'], 'LineString']}
            type='line'
            id='route-border'
            paint={{
              'line-color': '#218531',
              'line-width': 12,
            }}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          />
          <Layer
            beforeId={firstSymbolLayer}
            filter={['==', ['geometry-type'], 'LineString']}
            type='line'
            id='route-lines'
            paint={{
              'line-color': '#2bbd43',
              'line-width': 8,
            }}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          />
          <Layer
            beforeId={firstSymbolLayer}
            filter={['==', ['geometry-type'], 'Point']}
            type='circle'
            id='route-points'
            paint={{ 'circle-radius': 3, 'circle-color': 'white' }}
          />
        </Source>

        {!canHover && (
          <Marker
            latitude={viewState.latitude}
            longitude={viewState.longitude}
            anchor='center'
          >
            <MdMyLocation size={20} color={'var(--text-color)'} />
          </Marker>
        )}
        <LayerToggles
          isOpen={currentlyOpenPane === 'layers'}
          setIsOpen={(isOpen) => setCurrentlyOpenPane(isOpen ? 'layers' : null)}
          visibleLayers={visibleGroups}
          setVisibleLayers={setVisibleGroups}
        />
        <Pane
          isOpen={currentlyOpenPane === 'settings'}
          style={{
            bottom: '10px',
            left: '10px',
            right: '10px',
            maxHeight: 'calc(100% - 40px)',
          }}
        >
          <h2>הגדרות</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto auto 1fr',
              gap: '20px',
            }}
          >
            <LightDarkModeToggleButton
              onClick={() => setTernaryDarkMode('light')}
              imageSource={lightMode}
              label='בהיר'
              isSelected={ternaryDarkMode === 'light'}
            />
            <LightDarkModeToggleButton
              onClick={() => setTernaryDarkMode('dark')}
              imageSource={darkMode}
              label='כהה'
              isSelected={ternaryDarkMode === 'dark'}
            />
            <button onClick={() => setTernaryDarkMode('system')}>
              מצב מערכת
            </button>
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
              המפה הציבורית לשבילי אופניים
            </a>
            .
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
        {tooltipFeature && !currentlyOpenPane && (
          <FeatureTooltipComponent feature={tooltipFeature} />
        )}
      </Map>
      <ButtonBar>
        {mode === 'browse' ? (
          <>
            <ButtonBar.Button
              label='שכבות'
              icon={MdLayers}
              color='var(--blue-1)'
              onClick={() =>
                setCurrentlyOpenPane(
                  currentlyOpenPane === 'layers' ? null : 'layers',
                )
              }
            />
            <ButtonBar.Button
              label='תכנון מסלול'
              icon={TbRoute}
              color='var(--blue-2)'
              onClick={() => setMode('constructRoute')}
            />
            <ButtonBar.Button
              label='הגדרות'
              icon={MdSettings}
              color='var(--blue-3)'
              onClick={() =>
                setCurrentlyOpenPane(
                  currentlyOpenPane === 'settings' ? null : 'settings',
                )
              }
            />
            <ButtonBar.Button
              label='אודות'
              icon={MdInfoOutline}
              color='var(--blue-4)'
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
              color='var(--blue-1)'
              onClick={() => {
                route.clear()
                setMode('browse')
              }}
            />
            <ButtonBar.Button
              disabled={!route.canRemoveStop}
              label='הסרת עצירה'
              icon={MdOutlineWrongLocation}
              color='var(--blue-2)'
              onClick={() => route.removeStop()}
            />
            <ButtonBar.Button
              label='הוספת עצירה'
              icon={MdOutlineAddLocationAlt}
              color='var(--blue-3)'
              onClick={() => route.addStop()}
            />
            <ButtonBar.Button
              label='סיום'
              icon={MdDone}
              color='var(--blue-4)'
              onClick={() => setMode('viewRoute')}
            />
          </>
        ) : (
          <>
            <ButtonBar.Button
              label='חזרה'
              icon={MdArrowBack}
              color='var(--blue-1)'
              onClick={() => {
                route.clear()
                setMode('browse')
              }}
            />
            <ButtonBar.Button
              label='עריכת המסלול'
              icon={MdEdit}
              color='var(--blue-2)'
              onClick={() => setMode('constructRoute')}
            />
            <ButtonBar.Button
              label='מידע נוסף'
              icon={MdInfoOutline}
              color='var(--blue-3)'
              onClick={() => alert('בסופו של דבר')}
            />
            <ButtonBar.Button
              label='שיתוף'
              icon={MdOutlineIosShare}
              color='var(--blue-4)'
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
  const throttledCenter = useThrottledValue(center, 250)

  const [pastSegments, setPastSegments] = useState<Segment[]>([])

  useEffect(() => {
    if (!isTracking) {
      return
    }
    if (!segment || distanceSortOf(segment.origin, center) < 0.001) {
      return
    }

    console.log('calculating')
    fetchRoute(segment.origin, throttledCenter).then((feature) =>
      setSegment({
        origin: segment.origin,
        destination: throttledCenter,
        feature,
      }),
    )
  }, [throttledCenter, segment?.origin, isTracking])

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

function LightDarkModeToggleButton({
  onClick,
  label,
  imageSource,
  isSelected,
}: {
  onClick: () => void
  label: string
  imageSource: string
  isSelected: boolean
}) {
  return (
    <button
      aria-selected={isSelected}
      onClick={onClick}
      style={{
        padding: 0,
        outline: 0,
        border: 0,
        margin: 0,
        background: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <img
        style={{
          width: '80px',
          borderRadius: '8px',
          border: isSelected ? '2px solid #0284c7' : 0,
          boxSizing: 'border-box',
        }}
        src={imageSource}
      />
      <span style={{ fontWeight: isSelected ? 900 : 400 }}>{label}</span>
    </button>
  )
}
