import { PropsWithChildren } from 'react'
import { IconType } from 'react-icons'
import { rgbValuesForColor, textColor } from './utils'

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
}: {
  onClick: () => void
  color?: string
  label: string
  icon: IconType
}) {
  return (
    <button
      style={{
        flexGrow: 1,
        padding: '10px 20px',
        margin: 0,
        outline: 0,
        border: 0,
        background: color,
        color: textColor(...rgbValuesForColor(color)),
        fontSize: '0.8rem',
        fontWeight: 700,
        display: 'grid',
        gridTemplateRows: '20px 1fr',
        gap: '5px',
        alignItems: 'center',
        justifyItems: 'center',
      }}
      onClick={onClick}
    >
      {icon({ size: '100%' })}
      <span>{label}</span>
    </button>
  )
}

ButtonBar.Button = ButtonBarButton
