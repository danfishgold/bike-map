import { PropsWithChildren } from 'react'
import { IconType } from 'react-icons'

export default function ButtonBar({ children }: PropsWithChildren<{}>) {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch' }}
    >
      {children}
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
