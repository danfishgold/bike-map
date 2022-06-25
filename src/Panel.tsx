import { PropsWithChildren } from 'react'
import { MdClose } from 'react-icons/md'

export function Panel({
  isOpen,
  close,
  style,
  children,
}: PropsWithChildren<{
  isOpen: boolean
  close?: () => void
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
      {close && (
        <button onClick={close}>
          <MdClose />
        </button>
      )}
      {children}
    </div>
  )
}
