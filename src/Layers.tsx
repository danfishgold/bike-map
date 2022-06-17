import { FeatureCollection, Geometry } from 'geojson'
import { useMemo } from 'react'
import { MdLocationPin } from 'react-icons/md'
import { Layer, Marker, Source } from 'react-map-gl'
import { FeatureGroup } from './myMapsMapData'
import { useMapFeatures } from './useMapFeatures'
import { Route } from './useRoute'

type Props = {
  firstSymbolLayer: string | undefined
  visibleGroups: Partial<Record<FeatureGroup | 'osmBikePath', true>>
  route: Route
}

enum LayerId {
  MY_MAPS_POINTS = 'my-maps-points',
  MY_MAPS_LINES = 'my-maps-lines',
  MY_MAPS_LINE_TARGETS = 'my-maps-line-targets',
  MY_MAPS_POLYGONS = 'my-maps-polygons',
  OSM_BIKE_PATHS = 'osm-bike-paths',
  ROUTE_BORDERS = 'route-borders',
  ROUTE_LINES = 'route-lines',
  ROUTE_POINTS = 'route-points',
}

export const interactiveLayerIds: LayerId[] = [
  LayerId.MY_MAPS_POINTS,
  LayerId.MY_MAPS_LINE_TARGETS,
  LayerId.MY_MAPS_POLYGONS,
]

export default function Layers({
  firstSymbolLayer,
  visibleGroups,
  route,
}: Props) {
  const { myMapsFeatures, osmFeatures } = useMapFeatures()

  return (
    <>
      <MyMapsLayers
        features={myMapsFeatures}
        firstSymbolLayer={firstSymbolLayer}
        visibleGroups={visibleGroups}
      />
      <OsmLayers
        features={osmFeatures}
        firstSymbolLayer={firstSymbolLayer}
        visible={visibleGroups['osmBikePath'] ?? false}
      />
      <RouteLayers route={route} firstSymbolLayer={firstSymbolLayer} />
    </>
  )
}
function RouteLayers({
  route,
  firstSymbolLayer,
}: {
  route: any
  firstSymbolLayer: string | undefined
}) {
  return (
    <>
      <Source type='geojson' data={route.features}>
        <Layer
          beforeId={firstSymbolLayer}
          filter={['==', ['geometry-type'], 'LineString']}
          type='line'
          id={LayerId.ROUTE_BORDERS}
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
          id={LayerId.ROUTE_LINES}
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
          id={LayerId.ROUTE_POINTS}
          paint={{ 'circle-radius': 3, 'circle-color': 'white' }}
        />
      </Source>
      {route.origin && (
        <Marker
          latitude={route.origin[1]}
          longitude={route.origin[0]}
          anchor='bottom'
          offset={[0, 10]}
        >
          <MdLocationPin size={35} color='black' />
        </Marker>
      )}
    </>
  )
}

function OsmLayers({
  features,
  firstSymbolLayer,
  visible,
}: {
  features: FeatureCollection<Geometry>
  firstSymbolLayer: string | undefined
  visible: boolean
}) {
  return (
    <Source type='geojson' data={features}>
      <Layer
        beforeId={firstSymbolLayer}
        type='line'
        id={LayerId.OSM_BIKE_PATHS}
        filter={['to-boolean', visible]}
        paint={{
          'line-color': '#3f5ba9',
          'line-width': 4,
        }}
        layout={{
          'line-cap': 'round',
        }}
      />
    </Source>
  )
}

function MyMapsLayers({
  features,
  firstSymbolLayer,
  visibleGroups,
}: {
  features: FeatureCollection<Geometry>
  firstSymbolLayer: string | undefined
  visibleGroups: Partial<Record<FeatureGroup | 'osmBikePath', true>>
}) {
  const visibleGroupsArray = useMemo(
    () => Object.keys(visibleGroups) as Array<FeatureGroup | 'osmBikePath'>,
    [visibleGroups],
  )
  return (
    <Source type='geojson' data={features}>
      <Layer
        beforeId={firstSymbolLayer}
        type='fill'
        id={LayerId.MY_MAPS_POLYGONS}
        filter={[
          'all',
          ['==', ['get', 'layerType'], 'polygon'],
          ['in', ['get', 'featureGroup'], ['literal', visibleGroupsArray]],
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
        id={LayerId.MY_MAPS_LINES}
        type='line'
        filter={[
          'all',
          ['==', ['get', 'layerType'], 'line'],
          ['in', ['get', 'featureGroup'], ['literal', visibleGroupsArray]],
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
        id={LayerId.MY_MAPS_LINE_TARGETS}
        filter={[
          'all',
          ['==', ['get', 'layerType'], 'line'],
          ['in', ['get', 'featureGroup'], ['literal', visibleGroupsArray]],
          ['get', 'highlightable'],
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
        id={LayerId.MY_MAPS_POINTS}
        filter={[
          'all',
          ['==', ['get', 'layerType'], 'point'],
          ['in', ['get', 'featureGroup'], ['literal', visibleGroupsArray]],
        ]}
        paint={{
          'circle-color': ['get', 'icon-color'],
          'circle-radius': [
            '*',
            [
              'case',
              ['boolean', ['feature-state', 'highlighted'], false],
              1.5,
              1,
            ],
            5,
          ],
        }}
      />
    </Source>
  )
}
