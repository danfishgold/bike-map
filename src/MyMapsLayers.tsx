import { ReactElement } from 'react'
import { Layer } from 'react-map-gl'
import { FeatureGroup, featureGroupLayerType } from './myMapsMapData'

export function MyMapsLayers({
  firstSymbolLayer,
  group,
  source,
}: {
  firstSymbolLayer: string | undefined
  group: FeatureGroup
  source?: string | mapboxgl.AnySourceData
}): ReactElement {
  switch (featureGroupLayerType(group)) {
    case 'line': {
      return (
        <>
          <Layer
            beforeId={firstSymbolLayer}
            type='line'
            id={`my-maps-${group}`}
            source={source}
            paint={{
              'line-color': ['get', 'stroke'],
              'line-width': [
                '*',
                ['case', ['boolean', ['feature-state', 'hover'], false], 2, 1],
                ['get', 'stroke-width'],
              ],
              'line-opacity': ['get', 'stroke-opacity'],
            }}
            layout={{
              'line-cap': 'round',
            }}
          />
          {group !== 'roadArrow' && (
            <Layer
              beforeId={firstSymbolLayer}
              type='line'
              id={`my-maps-target-${group}`}
              source={source}
              paint={{
                'line-width': 20,
                'line-color': '#ffffff',
                'line-opacity': 0.00001,
              }}
            />
          )}
        </>
      )
    }
    case 'point': {
      return (
        <Layer
          beforeId={firstSymbolLayer}
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
            beforeId={firstSymbolLayer}
            type='fill'
            id={`my-maps-target-${group}`}
            source={source}
            paint={{
              'fill-color': ['get', 'fill'],
              'fill-opacity': [
                'interpolate',
                ['linear'],
                [
                  'case',
                  ['boolean', ['feature-state', 'hover'], false],
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
        </>
      )
    }
  }
}
