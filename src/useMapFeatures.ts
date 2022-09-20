import { FeatureCollection, Geometry } from 'geojson'
import { useEffect, useState } from 'react'
import { fetchMyMapsFeatures, MyMapsProperties } from './myMapsMapData'
import { fetchOsmFeatures } from './osmMapData'
import { emptyFeatureGroup } from './utils'

export function useMapFeatures() {
  const [myMapsFeatures, setMyMapsFeatures] =
    useState<FeatureCollection<Geometry, MyMapsProperties>>(emptyFeatureGroup)
  const [osmFeatures, setOsmFeatures] =
    useState<FeatureCollection<Geometry>>(emptyFeatureGroup)

  useEffect(() => {
    fetchMyMapsFeatures()
      .then((features) => setMyMapsFeatures(features))
      .catch((err) => console.error(err))
  }, [])

  useEffect(() => {
    fetchOsmFeatures()
      .then((featureCollection) => {
        setOsmFeatures(featureCollection)
      })
      .catch((err) => console.error(err))
  }, [])

  return { myMapsFeatures, osmFeatures }
}
