import { IconType } from 'react-icons'
import { MdBlock, MdCircle, MdTraffic, MdTrain } from 'react-icons/md'
import { FeatureGroup } from './featureGroups'

export type FeatureGroupStyle =
  | { type: 'polygon'; color: string; opacity: number }
  | { type: 'line'; color: string; width: number }
  | { type: 'icon'; color: string; icon: IconType }
  | { type: 'rawPolygon' }
  | { type: 'rawLine' }
  | { type: 'rawIcon' }

function line(color: string, width: number): FeatureGroupStyle {
  return { type: 'line', color, width }
}

function polygon(color: string, opacity: number): FeatureGroupStyle {
  return { type: 'polygon', color, opacity }
}

function icon(color: string, icon: IconType): FeatureGroupStyle {
  return { type: 'icon', color, icon }
}

function styleForGroup(group: FeatureGroup): FeatureGroupStyle {
  switch (group) {
    case 'bikePath':
      return line('#3f5ba9', 4)
    case 'osmBikePath':
      return line('#3f5ba9', 4)
    case 'recommendedRoad':
      return line('#0ba9cc', 2.35)
    case 'dangerousRoad':
      return line('#ff5252', 1.75)
    case 'ofney dan':
      return line('#c6a4cf', 7)
    case 'planned':
      return line('#fad199', 3.1)
    case 'inProgress':
      return line('#f8971b', 2.9)
    case 'missing':
      return line('#f8971b', 4)
    case 'dirtRoad':
      return line('#009d57', 2.9)
    case 'dirtPath':
      return line('#62af44', 2.1)
    case 'bridge':
      return line('#7c3592', 3.7)
    case 'unknown':
      return { type: 'rawLine' }
    case 'mistake':
      return { type: 'rawLine' }
    case 'unknownPolygon':
      return { type: 'rawPolygon' }
    case 'trainStationIsochrone':
      return polygon('#f8971b', 0.2)
    case 'coveredArea':
      return polygon('#009d57', 0.8)
    case 'hill':
      return polygon('#ee9c96', 0.5)
    case 'calmedTrafficArea':
      return polygon('#93d7e8', 0.5)
    case 'junction':
      return icon('red', MdTraffic)
    case 'calmedJunction':
      return icon('green', MdTraffic)
    case 'blockedPath':
      return icon('green', MdBlock)
    case 'trainStation':
      return icon('blue', MdTrain)
    case 'generalNote':
      return { type: 'rawIcon' }
  }
}

export default function GroupIcon({
  group,
  sizeInPixels,
}: {
  group: FeatureGroup
  sizeInPixels: number
}) {
  const groupStyle = styleForGroup(group)
  switch (groupStyle.type) {
    case 'polygon': {
      return (
        <div
          style={{
            width: `${sizeInPixels}px`,
            height: `${sizeInPixels}px`,
            background: groupStyle.color,
            opacity: groupStyle.opacity,
          }}
        ></div>
      )
    }
    case 'line': {
      return (
        <div
          style={{
            width: `${sizeInPixels}px`,
            height: `${sizeInPixels}px`,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              flexGrow: 1,
              height: `${groupStyle.width}px`,
              background: groupStyle.color,
              borderRadius: '1000px',
            }}
          ></div>
        </div>
      )
    }

    case 'icon': {
      return (
        <div
          style={{
            width: `${sizeInPixels}px`,
            height: `${sizeInPixels}px`,
            background: groupStyle.color,
            textAlign: 'center',
            borderRadius: '1000px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <groupStyle.icon
            size={`${Math.round(sizeInPixels * 0.75)}px`}
            color='white'
          />
        </div>
      )
    }
    case 'rawPolygon': {
      return (
        <div
          style={{
            width: `${sizeInPixels}px`,
            height: `${sizeInPixels}px`,
            fontSize: '0.8rem',
            background: '#ccc',
            textAlign: 'center',
          }}
        >
          ?
        </div>
      )
    }
    case 'rawLine': {
      return (
        <div
          style={{
            width: `${sizeInPixels}px`,
            height: `${sizeInPixels}px`,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              flexGrow: 1,
              height: '4px',
              background: 'linear-gradient(to right, red, blue)',
              borderRadius: '1000px',
            }}
          ></div>
        </div>
      )
    }
    case 'rawIcon': {
      return (
        <div
          style={{
            width: `${sizeInPixels}px`,
            height: `${sizeInPixels}px`,
            background: 'salmon',
            textAlign: 'center',
            borderRadius: '1000px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MdCircle
            size={`${Math.round(sizeInPixels * 0.75)}px`}
            color='white'
          />
        </div>
      )
    }
  }
}
