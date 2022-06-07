import { FeatureCollection, Geometry } from 'geojson'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useEffect, useState } from 'react'
import {
  FeatureGroup as MyMapsFeatureGroup,
  fetchMyMapsFeatures,
} from './myMapsMapData'
import { fetchOsmFeatures } from './osmMapData'

export function useMapFeatures() {
  const [myMapsFeatures, setMyMapsFeatures] = useState<Map<
    MyMapsFeatureGroup,
    FeatureCollection<Geometry>
  > | null>(null)
  const [osmFeatures, setOsmFeatures] =
    useState<FeatureCollection<Geometry> | null>(null)

  useEffect(() => {
    fetchMyMapsFeatures()
      .then((featureGroups) => {
        setMyMapsFeatures(featureGroups)
        console.log(featureGroups)
      })
      .catch((err) => console.error(err))
  }, [])

  useEffect(() => {
    fetchOsmFeatures()
      .then((featureCollection) => {
        setOsmFeatures(featureCollection)
        console.log(featureCollection)
      })
      .catch((err) => console.error(err))
  }, [])

  return { myMapsFeatures, osmFeatures }
}
