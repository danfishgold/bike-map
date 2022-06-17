import 'mapbox-gl/dist/mapbox-gl.css'
import { IconType } from 'react-icons'
import {
  MdArrowBack,
  MdDone,
  MdEdit,
  MdInfoOutline,
  MdLayers,
  MdOutlineAddLocationAlt,
  MdOutlineIosShare,
  MdOutlineWrongLocation,
  MdSettings,
} from 'react-icons/md'
import { TbRoute } from 'react-icons/tb'
import { Mode, Pane } from './App'
import { Route } from './useRoute'

type Props = {
  mode: Mode
  setMode: (mode: Mode) => void
  currentlyOpenPane: Pane | null
  setCurrentlyOpenPane: (pane: Pane | null) => void
  route: Route
}
export default function ButtonBar({
  mode,
  setMode,
  currentlyOpenPane,
  setCurrentlyOpenPane,
  route,
}: Props) {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch' }}
    >
      {mode === 'browse' ? (
        <>
          <ButtonBar.Button
            label='שכבות'
            icon={MdLayers}
            color='var(--blue-1)'
            onClick={() =>
              setCurrentlyOpenPane(
                currentlyOpenPane === 'layers' ? null : 'layers',
              )
            }
          />
          <ButtonBar.Button
            label='תכנון מסלול'
            icon={TbRoute}
            color='var(--blue-2)'
            onClick={() => setMode('constructRoute')}
          />
          <ButtonBar.Button
            label='הגדרות'
            icon={MdSettings}
            color='var(--blue-3)'
            onClick={() =>
              setCurrentlyOpenPane(
                currentlyOpenPane === 'settings' ? null : 'settings',
              )
            }
          />
          <ButtonBar.Button
            label='אודות'
            icon={MdInfoOutline}
            color='var(--blue-4)'
            onClick={() =>
              setCurrentlyOpenPane(
                currentlyOpenPane === 'about' ? null : 'about',
              )
            }
          />
        </>
      ) : mode === 'constructRoute' ? (
        <>
          <ButtonBar.Button
            label='חזרה'
            icon={MdArrowBack}
            color='var(--blue-1)'
            onClick={() => {
              route.clear()
              setMode('browse')
            }}
          />
          <ButtonBar.Button
            disabled={!route.canRemoveStop}
            label='הסרת עצירה'
            icon={MdOutlineWrongLocation}
            color='var(--blue-2)'
            onClick={() => route.removeStop()}
          />
          <ButtonBar.Button
            label='הוספת עצירה'
            icon={MdOutlineAddLocationAlt}
            color='var(--blue-3)'
            onClick={() => route.addStop()}
          />
          <ButtonBar.Button
            label='סיום'
            icon={MdDone}
            color='var(--blue-4)'
            onClick={() => setMode('viewRoute')}
          />
        </>
      ) : (
        <>
          <ButtonBar.Button
            label='חזרה'
            icon={MdArrowBack}
            color='var(--blue-1)'
            onClick={() => {
              route.clear()
              setMode('browse')
            }}
          />
          <ButtonBar.Button
            label='עריכת המסלול'
            icon={MdEdit}
            color='var(--blue-2)'
            onClick={() => setMode('constructRoute')}
          />
          <ButtonBar.Button
            label='מידע נוסף'
            icon={MdInfoOutline}
            color='var(--blue-3)'
            onClick={() => alert('בסופו של דבר')}
          />
          <ButtonBar.Button
            label='שיתוף'
            icon={MdOutlineIosShare}
            color='var(--blue-4)'
            onClick={() => alert('בסופו של דבר')}
          />
        </>
      )}
    </div>
  )
}

function ButtonBarButton({
  label,
  onClick,
  color = 'azure',
  icon,
  disabled = false,
}: {
  onClick: () => void
  color?: string
  label: string
  icon: IconType
  disabled?: boolean
}) {
  return (
    <button
      disabled={disabled}
      style={{
        flexGrow: 1,
        padding: '10px 20px 5px',
        margin: 0,
        outline: 0,
        border: 0,
        background: color,
        color: 'var(--text-color)',
        fontSize: '0.8rem',
        fontWeight: 700,
      }}
      onClick={onClick}
    >
      <div
        style={{
          opacity: disabled ? 0.4 : 1,
          display: 'grid',
          gridTemplateRows: '20px 1fr',
          gap: '5px',
          alignItems: 'center',
          justifyItems: 'center',
        }}
      >
        {icon({ size: '100%', color: 'var(--text-color)' })}
        <span>{label}</span>
      </div>
    </button>
  )
}

ButtonBar.Button = ButtonBarButton
