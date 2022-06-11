import { PropsWithChildren } from 'react'

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
  color = 'azure',
  label,
  onClick,
}: {
  label: string
  onClick: () => void
  color?: string
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
        color: 'black',
        fontSize: '1rem',
        fontWeight: 700,
      }}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

ButtonBar.Button = ButtonBarButton
