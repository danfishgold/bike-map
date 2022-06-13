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
  inDarkMode,
  visibleLayers,
  setVisibleLayers,
}: {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  inDarkMode: boolean
  visibleLayers: Set<FeatureGroup | 'osmBikePaths'>
  setVisibleLayers: (visibleLayers: Set<FeatureGroup | 'osmBikePaths'>) => void
}) {
  return (
    <Pane
      isOpen={isOpen}
      style={{
        top: '10px',
        left: '10px',
        maxHeight: 'calc(100% - 40px)',
      }}
      inDarkMode={inDarkMode}
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
            checked={visibleLayers.has(group)}
            onChange={(event) =>
              setVisibleLayers(
                toggleSetMember(visibleLayers, group, event.target.checked),
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
