import { PropsWithChildren } from 'react'

export function Pane({
  isOpen,
  style,
  children,
}: PropsWithChildren<{
  isOpen: boolean
  style?: React.CSSProperties
}>) {
  if (!isOpen) {
    return null
  }

  return (
    <div
      style={{
        position: 'absolute',
        color: 'var(--text-color)',
        background: 'var(--panel-background)',
        padding: '10px',
        border: '1px solid var(--panel-border)',
        borderRadius: '4px',
        zIndex: 2,
        direction: 'rtl',
        fontSize: '1rem',
        lineHeight: 1.25,
        overflowY: 'scroll',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
