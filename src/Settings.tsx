import 'mapbox-gl/dist/mapbox-gl.css'
import { useTernaryDarkMode } from 'usehooks-ts'
import darkMode from './assets/darkMode.png'
import lightMode from './assets/lightMode.png'

type Props = {
  isDebugging: boolean
  setIsDebugging: (isDebugging: boolean) => void
}

export default function Settings({ isDebugging, setIsDebugging }: Props) {
  return (
    <>
      <h2>הגדרות</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto auto auto 1fr',
          gap: '20px',
        }}
      >
        <LightDarkModeToggleButton mode='light' />
        <LightDarkModeToggleButton mode='dark' />
        <LightDarkModeToggleButton mode='system' />
      </div>
      <div>
        <input
          type='checkbox'
          checked={isDebugging}
          onChange={(event) => setIsDebugging(event.target.checked)}
          id='settings__is-debugging-checkbox'
        />
        <label htmlFor='settings__is-debugging-checkbox'>
          מצב דיבוג (אם אתם לא דן אז לא כדאי)
        </label>
      </div>
      <button
        onClick={() => {
          if (confirm('בטוח?')) {
            localStorage.clear()
            window.location.reload()
          }
        }}
      >
        אתחול (אם משהו מוזר קורה)
      </button>
    </>
  )
}

function LightDarkModeToggleButton({
  mode,
}: {
  mode: 'dark' | 'light' | 'system'
}) {
  const { ternaryDarkMode, setTernaryDarkMode } = useTernaryDarkMode()
  const isSelected = ternaryDarkMode === mode
  const onClick = () => setTernaryDarkMode(mode)
  const label = {
    light: 'בהיר',
    dark: 'כהה',
    system: 'אוטומטי',
  }[mode]
  return (
    <button
      aria-selected={isSelected}
      onClick={onClick}
      style={{
        padding: 0,
        outline: 0,
        border: 0,
        margin: 0,
        background: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '80px',
          borderRadius: '8px',
          boxShadow: isSelected ? '0 0 0 2px var(--blue-6)' : 'none',
          overflow: 'hidden',
        }}
      >
        <TernaryDarkModeImage mode={mode} />
      </div>
      <span style={{ fontWeight: isSelected ? 900 : 400 }}>{label}</span>
    </button>
  )
}

function TernaryDarkModeImage({ mode }: { mode: 'dark' | 'light' | 'system' }) {
  switch (mode) {
    case 'light': {
      return <img style={{ display: 'block', width: '80px' }} src={lightMode} />
    }
    case 'dark': {
      return <img style={{ display: 'block', width: '80px' }} src={darkMode} />
    }
    case 'system': {
      return (
        <div
          style={{
            width: '80px',
            position: 'relative',
          }}
        >
          <img style={{ display: 'block', width: '80px' }} src={lightMode} />
          <img
            style={{
              display: 'block',
              position: 'absolute',
              width: '80px',
              top: 0,
              left: 0,
              clipPath: 'polygon(0 0, 65% 0, 35% 100%, 0 100%)',
            }}
            src={darkMode}
          />
        </div>
      )
    }
  }
}
