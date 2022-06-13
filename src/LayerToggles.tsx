import { MdClose } from 'react-icons/md'
import {
  FeatureGroup,
  featureGroupPluralDisplayName,
  featureGroups,
} from './myMapsMapData'
import { Pane } from './Pane'
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
  return (
    <Pane
      isOpen={isOpen}
      style={{
        top: '10px',
        left: '10px',
        maxHeight: 'calc(100% - 40px)',
      }}
    >
      <button onClick={() => setIsOpen(false)}>
        <MdClose />
      </button>
      <h2>שכבות</h2>
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
    </Pane>
  )
}
