import { FeatureCollection, Geometry } from 'geojson'
import osmtogeojson from 'osmtogeojson'

export async function fetchOsmFeatures(): Promise<FeatureCollection<Geometry>> {
  const osmData = await import('./osmData.json')
  return osmtogeojson(osmData) as FeatureCollection<Geometry>
}
