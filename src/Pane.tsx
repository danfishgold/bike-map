import { PropsWithChildren } from 'react'

export function Pane({
  isOpen,
  style,
  children,
}: PropsWithChildren<{ isOpen: boolean; style?: React.CSSProperties }>) {
  if (!isOpen) {
    return null
  }

  return (
    <div
      style={{
        position: 'absolute',
        background: 'white',
        padding: '10px',
        border: '1px solid black',
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
