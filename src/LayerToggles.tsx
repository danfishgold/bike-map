import { MdClose } from 'react-icons/md'
import {
  FeatureGroup,
  featureGroupPluralDisplayName,
  featureGroups,
} from './myMapsMapData'
import { toggleSetMember } from './utils'

export function LayerToggles({
  isOpen,
  setIsOpen,
  visibleLayers: visibleFeatures,
  setVisibleLayers: setVisibleFeatures,
}: {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  visibleLayers: Set<FeatureGroup | 'osmBikePaths'>
  setVisibleLayers: (
    visibleFeatures: Set<FeatureGroup | 'osmBikePaths'>,
  ) => void
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        padding: '5px',
        background: 'white',
        border: '1px solid black',
        direction: 'rtl',
      }}
    >
      <button onClick={() => setIsOpen(false)}>
        <MdClose />
      </button>
      {['osmBikePaths' as const, ...featureGroups].map((group) => (
        <div key={group}>
          <input
            id={`layer-toggle-${group}`}
            type='checkbox'
            checked={visibleFeatures.has(group)}
            onChange={(event) =>
              setVisibleFeatures(
                toggleSetMember(visibleFeatures, group, event.target.checked),
              )
            }
          />
          <label htmlFor={`layer-toggle-${group}`}>
            {group === 'osmBikePaths'
              ? 'שבילי אופניים (OSM)'
              : featureGroupPluralDisplayName(group)}
          </label>
        </div>
      ))}
    </div>
  )
}
