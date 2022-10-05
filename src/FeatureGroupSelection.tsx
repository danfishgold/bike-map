import { CSSProperties, PropsWithChildren } from 'react'
import { useReadLocalStorage } from 'usehooks-ts'
import {
  FeatureGroup,
  featureGroupDescription,
  featureGroupPluralDisplayName,
  myMapsFeatureGroups,
} from './featureGroups'
import GroupIcon from './GroupIcon'
import { toggleSetRecordMember } from './utils'

type Props = {
  visibleLayers: Partial<Record<FeatureGroup, true>>
  setVisibleLayers: (visibleLayers: Partial<Record<FeatureGroup, true>>) => void
}

type Section = {
  title: string
  groups: FeatureGroup[]
}

const inputAndLabelContainerStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gap: '10px',
  alignItems: 'start',
}

const recommendedGroups: FeatureGroup[] = [
  'recommendedRoad',
  'dangerousRoad',
  'bridge',
  'hill',
]

const otherGroups: FeatureGroup[] = [
  'dirtPath',
  'dirtRoad',
  'calmedTrafficArea',
  //  'trainStation'
]

const notThereGroups: FeatureGroup[] = [
  'ofney dan',
  'planned',
  'inProgress',
  // 'missing',
]

const nonDebugSections: Section[] = [
  { title: 'המומלצים שלנו', groups: recommendedGroups },
  { title: 'שונות', groups: otherGroups },
  { title: 'שבילים שלא קיימים כרגע', groups: notThereGroups },
]

const debugOnlyGroups = myMapsFeatureGroups.filter(
  (group) =>
    group !== 'bikePath' &&
    !nonDebugSections.some((section) => section.groups.includes(group)),
)

const debugSection: Section = { title: 'שכבות חבויות', groups: debugOnlyGroups }

export default function FeatureGroupSelection({
  visibleLayers,
  setVisibleLayers,
}: Props) {
  const isDebugging = useReadLocalStorage<boolean>('isDebugging')
  const sections = isDebugging
    ? [...nonDebugSections, debugSection]
    : nonDebugSections
  return (
    <div>
      <h2>שכבות</h2>
      <div>
        <Section title='שבילי אופניים'>
          <BikePathLayerToggles
            visibleLayers={visibleLayers}
            setVisibleLayers={setVisibleLayers}
          />
        </Section>
      </div>
      {sections.map((section) => (
        <Section key={section.title} title={section.title}>
          {section.groups.map((group) => (
            <GroupToggle
              key={group}
              group={group}
              visibleLayers={visibleLayers}
              setVisibleLayers={setVisibleLayers}
            />
          ))}
        </Section>
      ))}
    </div>
  )
}

function Section({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <div>
      <h3>{title}</h3>
      <div style={{ display: 'grid', gap: '5px' }}>{children}</div>
    </div>
  )
}

function BikePathLayerToggles({
  visibleLayers,
  setVisibleLayers,
}: {
  visibleLayers: Partial<Record<FeatureGroup, true>>
  setVisibleLayers: (visibleLayers: Partial<Record<FeatureGroup, true>>) => void
}) {
  return (
    <>
      <div style={inputAndLabelContainerStyle}>
        <input
          type='radio'
          name='bike-path-layer'
          id='bike-path-layer--my-maps'
          checked={visibleLayers['bikePath'] ?? false}
          onChange={(event) =>
            setVisibleLayers(
              toggleSetRecordMember(
                toggleSetRecordMember(
                  visibleLayers,
                  'bikePath',
                  event.target.checked,
                ),
                'osmBikePath',
                !event.target.checked,
              ),
            )
          }
        />
        <GroupLabel group='bikePath' htmlFor={'bike-path-layer--my-maps'} />
      </div>
      <div style={inputAndLabelContainerStyle}>
        <input
          type='radio'
          name='bike-path-layer'
          id='bike-path-layer--osm'
          checked={visibleLayers['osmBikePath'] ?? false}
          onChange={(event) =>
            setVisibleLayers(
              toggleSetRecordMember(
                toggleSetRecordMember(
                  visibleLayers,
                  'osmBikePath',
                  event.target.checked,
                ),
                'bikePath',
                !event.target.checked,
              ),
            )
          }
        />
        <GroupLabel group='osmBikePath' htmlFor={'bike-path-layer--osm'} />
      </div>
    </>
  )
}

function GroupToggle({
  group,
  visibleLayers,
  setVisibleLayers,
}: {
  group: FeatureGroup
  visibleLayers: Partial<Record<FeatureGroup, true>>
  setVisibleLayers: (visibleLayers: Partial<Record<FeatureGroup, true>>) => void
}) {
  return (
    <div style={inputAndLabelContainerStyle} key={group}>
      <input
        id={`layer-toggle-${group}`}
        type='checkbox'
        checked={visibleLayers[group] ?? false}
        onChange={(event) =>
          setVisibleLayers(
            toggleSetRecordMember(visibleLayers, group, event.target.checked),
          )
        }
      />
      <GroupLabel group={group} htmlFor={`layer-toggle-${group}`} />
    </div>
  )
}

function GroupLabel({
  group,
  htmlFor,
}: {
  group: FeatureGroup
  htmlFor: string
}) {
  const description = featureGroupDescription(group)
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: 'grid',
        gridTemplateColumns: '20px auto',
        columnGap: '10px',
        rowGap: 0,
        alignItems: 'center',
      }}
    >
      <GroupIcon group={group} sizeInPixels={20} />
      <span>{featureGroupPluralDisplayName(group)}</span>
      {description && (
        <span style={{ gridColumn: 2, fontSize: '0.8rem' }}>{description}</span>
      )}
    </label>
  )
}
