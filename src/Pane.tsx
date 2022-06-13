import { PropsWithChildren } from 'react'

export function Pane({
  isOpen,
  style,
  inDarkMode,
  children,
}: PropsWithChildren<{
  isOpen: boolean
  style?: React.CSSProperties
  inDarkMode: boolean
}>) {
  if (!isOpen) {
    return null
  }

  return (
    <div
      style={{
        position: 'absolute',
        color: inDarkMode ? 'white' : 'black',
        background: inDarkMode ? '#222' : 'white',
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
