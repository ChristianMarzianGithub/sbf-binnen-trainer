import type { ReactNode } from 'react'

interface PageIntroProps {
  eyebrow?: string
  title: string
  description: string
  action?: ReactNode
}

export function PageIntro({ eyebrow, title, description, action }: PageIntroProps) {
  return (
    <header className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">{eyebrow}</p>
        ) : null}
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
      </div>
      {action}
    </header>
  )
}
