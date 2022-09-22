import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useCallback, useState } from 'react'
import { MdMyLocation } from 'react-icons/md'
import Map, {
  AttributionControl,
  GeolocateControl,
  Marker,
  NavigationControl,
  ScaleControl,
} from 'react-map-gl'
import {
  useLocalStorage,
  useMediaQuery,
  useReadLocalStorage,
  useTernaryDarkMode,
} from 'usehooks-ts'
import About from './About'
import ButtonBar from './ButtonBar'
import { env } from './env'
import { FeatureGroup } from './featureGroups'
import FeatureGroupSelection from './FeatureGroupSelection'
import { FeatureTooltip } from './FeatureTooltip'
import Layers, { interactiveLayerIds } from './Layers'
import { Panel } from './Panel'
import Settings from './Settings'
import { useRoute } from './useRoute'

export type Mode = 'browse' | 'constructRoute' | 'viewRoute'
export type Panel = 'layers' | 'settings' | 'about'

function App() {
  const canHover = useMediaQuery('(any-hover: hover)')
  const [currentlyOpenPanel, setCurrentlyOpenPanel] = useState<Panel | null>(
    null,
  )
  const isDebugging = useReadLocalStorage<boolean>('isDebugging') ?? false
  const shouldShowMapControlButtons =
    useReadLocalStorage<boolean>('showMapControlButtons') ?? true
  const [visibleGroups, setVisibleGroups] = useLocalStorage<
    Partial<Record<FeatureGroup, true>>
  >('visibleGroups', {
    bikePath: true,
    recommendedRoad: true,
    dangerousRoad: true,
    hill: true,
    dirtPath: true,
  })

  const [tooltipFeature, setTooltipFeature] =
    useState<mapboxgl.MapboxGeoJSONFeature | null>(null)
  const [isFollowingCurrentPosition, setIsFollowingCurrentPosition] =
    useState(false)

  const [viewState, setViewState] = useState({
    longitude: 34.7804731,
    latitude: 32.0805045,
    zoom: 12,
  })

  const [mode, setMode] = useState<Mode>('browse')
  const [firstSymbolLayer, setFirstSymbolLayer] = useState<string | undefined>(
    undefined,
  )
  const route = useRoute(viewState, mode === 'constructRoute')
  const { isDarkMode } = useTernaryDarkMode()

  const tooltipFeatureZoomThreshold = isDebugging ? 0 : 13
  const isBelowTooltipFeatureZoomThreshold =
    viewState.zoom <= tooltipFeatureZoomThreshold
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
      if (isBelowTooltipFeatureZoomThreshold) {
        return
      }
      const { features } = event
      const hoveredFeature = features && features[0]
      highlightFeature(hoveredFeature ?? null, event.target)
    },
    [isBelowTooltipFeatureZoomThreshold, highlightFeature],
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
        {shouldShowMapControlButtons && (
          <>
            <ScaleControl />
          </>
        )}
        <AttributionControl
          customAttribution={['© המפה הציבורית לשבילי אופניים']}
        />
        <NavigationControl position={canHover ? 'top-right' : 'bottom-right'} />
        <GeolocateControl
          onTrackUserLocationEnd={() => setIsFollowingCurrentPosition(false)}
          onTrackUserLocationStart={() => setIsFollowingCurrentPosition(true)}
          position={canHover ? 'top-right' : 'bottom-right'}
          positionOptions={{
            enableHighAccuracy: true,
          }}
          trackUserLocation={true}
          showUserHeading={true}
        />
        <Layers
          firstSymbolLayer={firstSymbolLayer}
          visibleGroups={visibleGroups}
          route={route}
        />
        {!canHover && !isFollowingCurrentPosition && (
          <Marker
            latitude={viewState.latitude}
            longitude={viewState.longitude}
            anchor='center'
          >
            <MdMyLocation size={20} color={'var(--text-color)'} />
          </Marker>
        )}
        {tooltipFeature &&
          !isBelowTooltipFeatureZoomThreshold &&
          !(isFollowingCurrentPosition && !canHover) && (
            <FeatureTooltipComponent feature={tooltipFeature} />
          )}

        <Panel
          isOpen={currentlyOpenPanel === 'layers'}
          close={() => setCurrentlyOpenPanel(null)}
          style={{
            top: '10px',
            left: '10px',
            maxHeight: 'calc(100% - 40px)',
            maxWidth: 'calc(100% - 40px)',
          }}
        >
          <FeatureGroupSelection
            visibleLayers={visibleGroups}
            setVisibleLayers={setVisibleGroups}
          />
        </Panel>
        <Panel
          isOpen={currentlyOpenPanel === 'settings'}
          close={() => setCurrentlyOpenPanel(null)}
          style={{
            bottom: '10px',
            right: '10px',
            maxWidth: 'calc(100% - 42px)',
            maxHeight: 'calc(100% - 40px)',
          }}
        >
          <Settings />
        </Panel>
        <Panel
          isOpen={currentlyOpenPanel === 'about'}
          close={() => setCurrentlyOpenPanel(null)}
          style={{
            top: '10px',
            right: '10px',
            width: 'calc(100% - 42px)',
            maxWidth: '500px',
            maxHeight: 'calc(100% - 40px)',
          }}
        >
          <About />
        </Panel>
      </Map>
      <ButtonBar
        mode={mode}
        setMode={setMode}
        currentlyOpenPanel={currentlyOpenPanel}
        setCurrentlyOpenPanel={setCurrentlyOpenPanel}
        route={route}
      />
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
