import 'mapbox-gl/dist/mapbox-gl.css'
import Map, {
  AttributionControl,
  GeolocateControl,
  Layer,
  NavigationControl,
  ScaleControl,
  Source,
} from 'react-map-gl'
import { env } from './env'
import { useMapFeatures } from './useMapFeatures'

function App() {
  const { myMapsFeatures, osmFeatures } = useMapFeatures()

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
      >
        <ScaleControl />
        <NavigationControl />
        <GeolocateControl />
        <AttributionControl customAttribution={[]} />
        {myMapsFeatures && (
          <Source type='geojson' data={myMapsFeatures}>
            <Layer
              type='line'
              id='all-my-maps-lines'
              paint={{
                'line-color': ['get', 'stroke'],
                'line-width': ['get', 'stroke-width'],
                'line-opacity': ['get', 'stroke-opacity'],
              }}
              layout={{
                'line-cap': 'round',
              }}
            />
          </Source>
        )}
        {osmFeatures && (
          <Source type='geojson' data={osmFeatures}>
            <Layer
              type='line'
              id='all-osm-lines'
              paint={{
                'line-color': 'black',
                'line-width': 5,
              }}
              layout={{
                'line-cap': 'round',
              }}
            />
          </Source>
        )}
      </Map>
    </div>
  )
}

export default App
