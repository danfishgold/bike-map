import 'mapbox-gl/dist/mapbox-gl.css'
import { IconType } from 'react-icons'
import {
  MdArrowBack,
  MdClose,
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
import { useReadLocalStorage } from 'usehooks-ts'
import { Mode, Panel } from './App'
import { Route } from './useRoute'

type Props = {
  mode: Mode
  setMode: (mode: Mode) => void
  currentlyOpenPanel: Panel | null
  setCurrentlyOpenPanel: (pane: Panel | null) => void
  route: Route
}
export default function ButtonBar({
  mode,
  setMode,
  currentlyOpenPanel,
  setCurrentlyOpenPanel,
  route,
}: Props) {
  const isDebugging = useReadLocalStorage('isDebugging') ?? false
  return (
    <div
      style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch' }}
    >
      {mode === 'browse' ? (
        <>
          <ButtonBar.Button
            label={currentlyOpenPanel === 'layers' ? 'סגירה' : 'שכבות'}
            icon={currentlyOpenPanel === 'layers' ? MdClose : MdLayers}
            color='var(--blue-1)'
            onClick={() =>
              setCurrentlyOpenPanel(
                currentlyOpenPanel === 'layers' ? null : 'layers',
              )
            }
          />
          {isDebugging && (
            <ButtonBar.Button
              label='תכנון מסלול'
              icon={TbRoute}
              color='var(--blue-2)'
              onClick={() => setMode('constructRoute')}
            />
          )}
          <ButtonBar.Button
            label={currentlyOpenPanel === 'settings' ? 'סגירה' : 'הגדרות'}
            icon={currentlyOpenPanel === 'settings' ? MdClose : MdSettings}
            color={isDebugging ? 'var(--blue-3)' : 'var(--blue-2)'}
            onClick={() =>
              setCurrentlyOpenPanel(
                currentlyOpenPanel === 'settings' ? null : 'settings',
              )
            }
          />
          <ButtonBar.Button
            label={currentlyOpenPanel === 'about' ? 'סגירה' : 'אודות'}
            icon={currentlyOpenPanel === 'about' ? MdClose : MdInfoOutline}
            color={isDebugging ? 'var(--blue-4)' : 'var(--blue-3)'}
            onClick={() =>
              setCurrentlyOpenPanel(
                currentlyOpenPanel === 'about' ? null : 'about',
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
