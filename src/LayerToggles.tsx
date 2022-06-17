import { MdClose } from 'react-icons/md'
import {
  FeatureGroup,
  featureGroupPluralDisplayName,
  featureGroups,
} from './myMapsMapData'
import { Panel } from './Panel'
import { toggleSetRecordMember } from './utils'

export function LayerToggles({
  isOpen,
  setIsOpen,
  visibleLayers,
  setVisibleLayers,
}: {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  visibleLayers: Partial<Record<FeatureGroup | 'osmBikePath', true>>
  setVisibleLayers: (
    visibleLayers: Partial<Record<FeatureGroup | 'osmBikePath', true>>,
  ) => void
}) {
  return (
    <Panel
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
      {['osmBikePath' as const, ...featureGroups].map((group) => (
        <div key={group}>
          <input
            id={`layer-toggle-${group}`}
            type='checkbox'
            checked={visibleLayers[group] ?? false}
            onChange={(event) =>
              setVisibleLayers(
                toggleSetRecordMember(
                  visibleLayers,
                  group,
                  event.target.checked,
                ),
              )
            }
          />
          <label htmlFor={`layer-toggle-${group}`}>
            {group === 'osmBikePath'
              ? 'שבילי אופניים (OSM)'
              : featureGroupPluralDisplayName(group)}
          </label>
        </div>
      ))}
    </Panel>
  )
}
