export type IconName =
  | 'dashboard'
  | 'questions'
  | 'practice'
  | 'exam'
  | 'review'
  | 'bookmark'
  | 'settings'
  | 'arrow'
  | 'compass'
  | 'menu'

export interface NavigationItem {
  path: string
  label: string
  shortLabel: string
  icon: IconName
}
