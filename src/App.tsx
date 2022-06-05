import * as tj from '@tmcw/togeojson'
import { Feature, FeatureCollection, Geometry, LineString } from 'geojson'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useEffect, useState } from 'react'
import Map, {
  AttributionControl,
  GeolocateControl,
  Layer,
  NavigationControl,
  ScaleControl,
  Source,
} from 'react-map-gl'
import { env } from './env'
import { groupBy } from './utils'

mapboxgl.setRTLTextPlugin(
  'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
  () => {},
  true,
)

type LineStringProperties = {
  name: string
  description: string
  stroke: string
  'stroke-width': number
  'stroke-opacity': number
}

function App() {
  const [features, setFeatures] = useState<FeatureCollection<
    LineString,
    LineStringProperties
  > | null>(null)

  useEffect(() => {
    fetch(env.VITE_KML_SOURCE)
      .then((response) => response.text())
      .then((xmlString) =>
        new DOMParser().parseFromString(xmlString, 'text/xml'),
      )
      .then((xml) => tj.kml(xml))
      .then((geojson) => {
        if (geojson.features.some((feature) => feature.geometry === null)) {
          throw new Error('GeoJSON has null geometry')
        }

        return geojson as FeatureCollection<Geometry>
      })
      .then((geojson) => {
        const featureGroups = groupBy(
          geojson.features,
          (feature) => feature.geometry.type,
        )
        const featureCollection: FeatureCollection<
          LineString,
          LineStringProperties
        > = {
          type: 'FeatureCollection',
          features: (featureGroups.get('LineString') ?? []) as Feature<
            LineString,
            LineStringProperties
          >[],
        }
        return featureCollection
      })
      .then((lines) => {
        setFeatures(lines)
        console.log(lines)
      })
      .catch((err) => console.error(err))
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
      >
        <ScaleControl />
        <NavigationControl />
        <GeolocateControl />
        <AttributionControl customAttribution={[]} />
        {features && (
          <Source type='geojson' data={features}>
            <Layer
              type='line'
              id='all-dror-lines'
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
      </Map>
    </div>
  )
}

export default App
