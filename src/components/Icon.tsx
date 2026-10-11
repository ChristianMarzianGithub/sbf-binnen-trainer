import type { SVGProps } from 'react'
import type { IconName } from '../types/navigation'

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName
}

const iconPaths: Record<IconName, React.ReactNode> = {
  dashboard: <><path d="M4 13h6V4H4v9Z"/><path d="M14 20h6v-9h-6v9Z"/><path d="M4 20h6v-3H4v3Z"/><path d="M14 7h6V4h-6v3Z"/></>,
  questions: <><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z"/><path d="M8 8h7M8 12h7M8 16h4"/></>,
  practice: <><path d="m4 13 4 4L20 5"/><path d="M20 12v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h11"/></>,
  exam: <><path d="M7 3h10v4H7z"/><path d="M5 5H4a1 1 0 0 0-1 1v14h18V6a1 1 0 0 0-1-1h-1"/><path d="M7 12h10M7 16h6"/></>,
  review: <><path d="M12 3a9 9 0 1 1-8.2 5.3"/><path d="M3 3v6h6"/><path d="m9 9 6 6M15 9l-6 6"/></>,
  bookmark: <path d="M6 3h12v18l-6-4-6 4V3Z"/>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
  arrow: <path d="m9 18 6-6-6-6"/>,
  compass: <><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
}

export function Icon({ name, className = 'size-5', ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {iconPaths[name]}
    </svg>
  )
}
