import { ReactElement } from 'react'
import { Layer } from 'react-map-gl'
import { FeatureGroup, featureGroupLayerType } from './myMapsMapData'

export function MyMapsLayers({
  group,
  source,
  highlightedId,
}: {
  group: FeatureGroup
  source?: string | mapboxgl.AnySourceData
  highlightedId: string | number | null
}): ReactElement {
  switch (featureGroupLayerType(group)) {
    case 'line': {
      return (
        <>
          <Layer
            type='line'
            id={`my-maps-${group}`}
            source={source}
            paint={{
              'line-color': ['get', 'stroke'],
              'line-width': [
                '*',
                ['case', ['==', ['id'], ['number', highlightedId, 0]], 2, 1],
                ['get', 'stroke-width'],
              ],
              'line-opacity': ['get', 'stroke-opacity'],
            }}
            layout={{
              'line-cap': 'round',
            }}
          />
          <Layer
            type='line'
            id={`my-maps-target-${group}`}
            source={source}
            paint={{
              'line-width': 20,
              'line-color': '#ffffff',
              'line-opacity': 0.00001,
            }}
          />
        </>
      )
    }
    case 'point': {
      return (
        <Layer
          type='circle'
          id={`my-maps-target-${group}`}
          source={source}
          paint={{ 'circle-color': ['get', 'icon-color'] }}
        />
      )
    }
    case 'polygon': {
      return (
        <>
          <Layer
            type='fill'
            id={`my-maps-target-${group}`}
            source={source}
            paint={{
              'fill-color': ['get', 'fill'],
              'fill-opacity': [
                'interpolate',
                ['linear'],
                ['case', ['==', ['id'], ['number', highlightedId, 0]], 0.5, 0],
                0,
                ['get', 'fill-opacity'],
                1,
                1,
              ],
            }}
          />
        </>
      )
    }
  }
}
