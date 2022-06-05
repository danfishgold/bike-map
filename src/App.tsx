import * as tj from '@tmcw/togeojson'
import { Feature, FeatureCollection, Geometry, LineString } from 'geojson'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import osmtogeojson from 'osmtogeojson'
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
import osmData from './osm-data.json'

function getOsmFeatures(): FeatureCollection<Geometry> {
  return osmtogeojson(osmData) as FeatureCollection<Geometry>
}

async function getDrorFeatures(): Promise<
  FeatureCollection<Geometry, DrorProperties>
> {
  const response = await fetch(env.VITE_KML_SOURCE)
  const xmlString = await response.text()
  const xml = new DOMParser().parseFromString(xmlString, 'text/xml')
  const geoJson = tj.kml(xml)

  if (geoJson.features.some((feature) => feature.geometry === null)) {
    throw new Error('GeoJSON has null geometry')
  }

  return geoJson as FeatureCollection<Geometry, DrorProperties>
}

function extractLineStrings<Properties>(
  featureCollection: FeatureCollection<Geometry, Properties>,
): FeatureCollection<LineString, Properties> {
  const features = featureCollection.features.filter(
    (feature) => feature.geometry.type === 'LineString',
  ) as Feature<LineString, Properties>[]
  return { type: 'FeatureCollection', features }
}

mapboxgl.setRTLTextPlugin(
  'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
  () => {},
  true,
)

type DrorProperties = {
  name: string
  description: string
  stroke: string
  'stroke-width': number
  'stroke-opacity': number
}

function App() {
  const [drorFeatures, setDrorFeatures] =
    useState<FeatureCollection<LineString> | null>(null)
  const [osmFeatures] = useState(getOsmFeatures())

  useEffect(() => {
    getDrorFeatures()
      .then((featureCollection) => extractLineStrings(featureCollection))
      .then((lines) => {
        setDrorFeatures(lines)
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
        {drorFeatures && (
          <Source type='geojson' data={drorFeatures}>
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
      </Map>
    </div>
  )
}

export default App
