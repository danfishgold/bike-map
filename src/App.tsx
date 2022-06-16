import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useCallback, useState } from 'react'
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
  Marker,
  NavigationControl,
  ScaleControl,
} from 'react-map-gl'
import { useLocalStorage, useMediaQuery, useTernaryDarkMode } from 'usehooks-ts'
import darkMode from './assets/darkMode.png'
import lightMode from './assets/lightMode.png'
import ButtonBar from './ButtonBar'
import { env } from './env'
import { FeatureTooltip } from './FeatureTooltip'
import Layers, { interactiveLayerIds } from './Layers'
import { LayerToggles } from './LayerToggles'
import { FeatureGroup } from './myMapsMapData'
import { Pane } from './Pane'
import { useRoute } from './useRoute'

function App() {
  const canHover = useMediaQuery('(any-hover: hover)')
  const [currentlyOpenPane, setCurrentlyOpenPane] = useState<
    'settings' | 'layers' | 'about' | null
  >(null)
  const [isDebugging, setIsDebugging] = useState(false)
  const [visibleGroups, setVisibleGroups] = useLocalStorage<
    Partial<Record<FeatureGroup | 'osmBikePath', true>>
  >('visibleGroups', {
    osmBikePath: true,
    recommendedRoad: true,
    roadArrow: true,
    dangerousRoad: true,
    hill: true,
    calmedTrafficArea: true,
    dirtPath: true,
  })

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
        <Layers
          firstSymbolLayer={firstSymbolLayer}
          visibleGroups={visibleGroups}
          route={route}
        />
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
          <button
            onClick={() => {
              if (confirm('בטוח?')) {
                localStorage.clear()
                window.location.reload()
              }
            }}
          >
            אתחול (אם משהו מוזר קורה)
          </button>
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
